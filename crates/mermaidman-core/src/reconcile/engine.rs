//! Reconcile engine: sync graph topology with directives.

use crate::parse::{parse_document, ParseResult};
use crate::store::GraphStore;
use crate::types::{Edge, Node, EID, UID};
use crate::write::generate_mermaidman;
use crate::{Error, Result};
use indexmap::IndexMap;
use serde::{Deserialize, Serialize};

/// Reconciliation result.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReconcileResult {
    /// The reconciled Mermaidman text.
    pub text: String,
    /// Updated graph store.
    pub store: GraphStore,
    /// Warnings during reconciliation.
    pub warnings: Vec<String>,
    /// Orphaned node UIDs (directives without topology).
    pub orphaned_nodes: Vec<UID>,
    /// Orphaned edge EIDs.
    pub orphaned_edges: Vec<EID>,
}

/// Reconcile topology text with existing store.
///
/// This merges new topology parsing with existing node/edge data,
/// preserving UIDs and metadata while updating structure.
pub fn reconcile(
    topology_text: &str,
    existing_store: &GraphStore,
) -> Result<ReconcileResult> {
    // Parse the new topology
    let parsed = parse_document(topology_text)?;
    let mut warnings = parsed.warnings.clone();
    
    // Build new store, reusing UIDs where possible
    let mut new_store = GraphStore::new();
    let mut mermaid_to_uid: IndexMap<String, UID> = IndexMap::new();

    // Process nodes: match by mermaid_id to preserve UIDs
    for parsed_node in &parsed.nodes {
        let uid = existing_store
            .alias
            .get_uid(&parsed_node.mermaid_id)
            .cloned()
            .unwrap_or_else(|| parsed_node.uid.clone());
        
        // Get existing node data if available
        let mut node = if let Some(existing) = existing_store.get_node(&uid) {
            let mut n = existing.clone();
            n.mermaid_id = parsed_node.mermaid_id.clone();
            n.label = parsed_node.label.clone().or(n.label);
            n
        } else {
            Node::with_uid(uid.clone(), &parsed_node.mermaid_id)
        };
        
        // Update from parsed data
        if parsed_node.x.is_some() {
            node.x = parsed_node.x;
        }
        if parsed_node.y.is_some() {
            node.y = parsed_node.y;
        }
        if parsed_node.kind != crate::types::NodeKind::Card {
            node.kind = parsed_node.kind;
        }
        if parsed_node.meta.is_some() {
            node.meta = parsed_node.meta.clone();
        }
        
        mermaid_to_uid.insert(node.mermaid_id.clone(), uid.clone());
        new_store.upsert_node(node);
    }

    // Process edges: match by source+target UIDs
    for parsed_edge in &parsed.edges {
        let source = mermaid_to_uid
            .get(parsed_edge.source.as_ref())
            .cloned()
            .unwrap_or_else(|| parsed_edge.source.clone());
        
        let target = mermaid_to_uid
            .get(parsed_edge.target.as_ref())
            .cloned()
            .unwrap_or_else(|| parsed_edge.target.clone());

        // Try to find existing edge with same source/target
        let existing_eid = existing_store
            .active_edges()
            .find(|e| e.source == source && e.target == target)
            .map(|e| e.eid.clone());
        
        let eid = existing_eid.unwrap_or_else(|| parsed_edge.eid.clone());
        
        let mut edge = if let Some(existing) = existing_store.get_edge(&eid) {
            let mut e = existing.clone();
            e.source = source;
            e.target = target;
            e.label = parsed_edge.label.clone().or(e.label);
            e
        } else {
            Edge::with_eid(eid, source, target)
        };
        
        if parsed_edge.label.is_some() {
            edge.label = parsed_edge.label.clone();
        }
        if parsed_edge.meta.is_some() {
            edge.meta = parsed_edge.meta.clone();
        }
        
        new_store.upsert_edge(edge);
    }

    // Find orphaned nodes (in old store but not in new topology)
    let new_node_uids: std::collections::HashSet<_> = 
        new_store.nodes.keys().collect();
    
    let orphaned_nodes: Vec<UID> = existing_store
        .active_nodes()
        .filter(|n| !new_node_uids.contains(&n.uid))
        .map(|n| n.uid.clone())
        .collect();
    
    if !orphaned_nodes.is_empty() {
        warnings.push(format!(
            "Orphaned nodes: {:?}",
            orphaned_nodes.iter().map(|u| &u.0).collect::<Vec<_>>()
        ));
    }

    // Find orphaned edges
    let new_edge_eids: std::collections::HashSet<_> = 
        new_store.edges.keys().collect();
    
    let orphaned_edges: Vec<EID> = existing_store
        .active_edges()
        .filter(|e| !new_edge_eids.contains(&e.eid))
        .map(|e| e.eid.clone())
        .collect();

    // Generate reconciled text
    let text = generate_mermaidman(&new_store, "TD");

    Ok(ReconcileResult {
        text,
        store: new_store,
        warnings,
        orphaned_nodes,
        orphaned_edges,
    })
}

/// Reconcile from raw topology with UI node updates.
///
/// Hot-path: apply UI changes to an existing store without reparsing.
pub fn apply_ui_changes(
    store: &mut GraphStore,
    node_updates: &[(UID, f64, f64)], // uid, x, y
) {
    for (uid, x, y) in node_updates {
        store.move_node(uid, *x, *y);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_reconcile_preserves_uids() {
        // Initial document
        let initial = r#"graph TD
A[Start] --> B[End]

%% @node: A {"uid":"n_001","x":100,"y":50}
%% @node: B {"uid":"n_002","x":200,"y":100}
"#;

        let parsed = parse_document(initial).unwrap();
        let store = GraphStore::from_parsed(parsed.nodes, parsed.edges);
        
        // Modified topology (same nodes, different labels)
        let modified = r#"graph TD
A[Begin] --> B[Finish]
"#;

        let result = reconcile(modified, &store).unwrap();
        
        // UIDs should be preserved
        let node_a = result.store.get_node_by_mermaid_id("A").unwrap();
        assert_eq!(node_a.uid.0, "n_001");
        assert_eq!(node_a.label, Some("Begin".to_string()));
        
        // Positions should be preserved
        assert_eq!(node_a.x, Some(100.0));
        assert_eq!(node_a.y, Some(50.0));
    }

    #[test]
    fn test_reconcile_detects_orphans() {
        let initial = r#"graph TD
A[Start] --> B[Middle]
B --> C[End]

%% @node: A {"uid":"n_001","x":100,"y":50}
%% @node: B {"uid":"n_002","x":200,"y":100}
%% @node: C {"uid":"n_003","x":300,"y":150}
"#;

        let parsed = parse_document(initial).unwrap();
        let store = GraphStore::from_parsed(parsed.nodes, parsed.edges);
        
        // Modified: removed node C
        let modified = r#"graph TD
A[Start] --> B[Middle]
"#;

        let result = reconcile(modified, &store).unwrap();
        
        // C should be orphaned
        assert!(result.orphaned_nodes.iter().any(|u| u.0 == "n_003"));
    }
}
