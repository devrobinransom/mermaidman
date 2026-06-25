//! Mermaid text generation from graph store.

use crate::store::GraphStore;
use crate::write::canonical::{format_edge_directive, format_node_directive};

/// Generate a complete Mermaidman document from a graph store.
pub fn generate_mermaidman(store: &GraphStore, direction: &str) -> String {
    let mut lines = Vec::new();
    
    // Header
    lines.push(format!("graph {}", direction));
    lines.push(String::new());
    
    // Topology: nodes and edges
    let nodes: Vec<_> = store.active_nodes().collect();
    let edges: Vec<_> = store.active_edges().collect();
    
    // Generate edge lines (which implicitly declare nodes)
    for edge in &edges {
        let src = store.get_node(&edge.source);
        let tgt = store.get_node(&edge.target);
        
        if let (Some(src_node), Some(tgt_node)) = (src, tgt) {
            let src_decl = format_node_decl(src_node);
            let tgt_decl = format_node_decl(tgt_node);
            
            let arrow = if let Some(ref label) = edge.label {
                format!("--|{}|-->", label)
            } else {
                "-->".to_string()
            };
            
            lines.push(format!("{} {} {}", src_decl, arrow, tgt_decl));
        }
    }
    
    // Add any orphan nodes (not in any edge)
    let connected: std::collections::HashSet<_> = edges
        .iter()
        .flat_map(|e| [&e.source, &e.target])
        .collect();
    
    for node in &nodes {
        if !connected.contains(&node.uid) {
            lines.push(format_node_decl(node));
        }
    }
    
    lines.push(String::new());
    
    // Directives
    for node in &nodes {
        lines.push(format_node_directive(node));
    }
    
    let mut edge_counter = 0;
    for edge in &edges {
        edge_counter += 1;
        lines.push(format_edge_directive(edge, &format!("e{}", edge_counter)));
    }
    
    lines.join("\n")
}

/// Format a node declaration (ID + label in brackets).
fn format_node_decl(node: &crate::types::Node) -> String {
    if let Some(ref label) = node.label {
        if label != &node.mermaid_id {
            return format!("{}[{}]", node.mermaid_id, label);
        }
    }
    node.mermaid_id.clone()
}

/// Generate just the topology portion (no directives).
pub fn generate_topology(store: &GraphStore, direction: &str) -> String {
    let mut lines = Vec::new();
    
    lines.push(format!("graph {}", direction));
    
    let edges: Vec<_> = store.active_edges().collect();
    
    for edge in &edges {
        let src = store.get_node(&edge.source);
        let tgt = store.get_node(&edge.target);
        
        if let (Some(src_node), Some(tgt_node)) = (src, tgt) {
            let src_decl = format_node_decl(src_node);
            let tgt_decl = format_node_decl(tgt_node);
            
            let arrow = if let Some(ref label) = edge.label {
                format!("--|{}|-->", label)
            } else {
                "-->".to_string()
            };
            
            lines.push(format!("{} {} {}", src_decl, arrow, tgt_decl));
        }
    }
    
    // Orphan nodes
    let connected: std::collections::HashSet<_> = edges
        .iter()
        .flat_map(|e| [&e.source, &e.target])
        .collect();
    
    for node in store.active_nodes() {
        if !connected.contains(&node.uid) {
            lines.push(format_node_decl(node));
        }
    }
    
    lines.join("\n")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{Edge, Node, EID, UID};

    #[test]
    fn test_generate_simple_document() {
        let mut store = GraphStore::new();
        
        let mut node_a = Node::new("A");
        node_a.uid = UID::from_str("n_001");
        node_a.label = Some("Start".to_string());
        node_a.x = Some(100.0);
        node_a.y = Some(50.0);
        
        let mut node_b = Node::new("B");
        node_b.uid = UID::from_str("n_002");
        node_b.label = Some("End".to_string());
        node_b.x = Some(200.0);
        node_b.y = Some(100.0);
        
        store.upsert_node(node_a);
        store.upsert_node(node_b);
        
        let edge = Edge::with_eid(
            EID::from_str("e_001"),
            UID::from_str("n_001"),
            UID::from_str("n_002"),
        );
        store.upsert_edge(edge);
        
        let doc = generate_mermaidman(&store, "TD");
        
        assert!(doc.contains("graph TD"));
        assert!(doc.contains("A[Start]"));
        assert!(doc.contains("B[End]"));
        assert!(doc.contains("-->"));
        assert!(doc.contains("%% @node: A"));
        assert!(doc.contains("%% @node: B"));
    }
}
