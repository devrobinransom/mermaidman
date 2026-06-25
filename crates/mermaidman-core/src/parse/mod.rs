//! Parsing module for Mermaid topology and Mermaidman directives.

mod directives;
mod topology;

pub use directives::*;
pub use topology::*;

use crate::types::{Edge, Node, EID, UID};
use crate::{Error, Result};
use indexmap::IndexMap;
use serde::{Deserialize, Serialize};

/// Parsed document result.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParseResult {
    /// The original mermaid topology (without directives).
    pub topology: String,
    /// Parsed nodes with merged directive data.
    pub nodes: Vec<Node>,
    /// Parsed edges with merged directive data.
    pub edges: Vec<Edge>,
    /// Any warnings during parsing.
    pub warnings: Vec<String>,
}

/// Parse a complete Mermaidman document.
pub fn parse_document(input: &str) -> Result<ParseResult> {
    let lines: Vec<&str> = input.lines().collect();
    let mut topology_lines = Vec::new();
    let mut node_directives: IndexMap<String, NodeDirective> = IndexMap::new();
    let mut edge_directives: Vec<EdgeDirective> = Vec::new();
    let mut warnings = Vec::new();

    // First pass: separate topology from directives
    for line in &lines {
        let trimmed = line.trim();
        if trimmed.starts_with("%%") {
            if let Some(directive) = parse_node_directive(trimmed) {
                node_directives.insert(directive.id.clone(), directive);
            } else if let Some(directive) = parse_edge_directive(trimmed) {
                edge_directives.push(directive);
            }
            // Don't add directive lines to topology
        } else {
            topology_lines.push(*line);
        }
    }

    let topology = topology_lines.join("\n");

    // Parse the mermaid topology
    let (topo_nodes, topo_edges) = parse_mermaid_topology(&topology)?;

    // Merge topology with directives
    let mut nodes = Vec::new();
    let mut mermaid_id_to_uid: IndexMap<String, UID> = IndexMap::new();

    for (mermaid_id, label) in topo_nodes {
        let directive = node_directives.get(&mermaid_id);
        
        let uid = directive
            .and_then(|d| d.uid.clone())
            .map(|s| UID::from_str(&s))
            .unwrap_or_else(UID::new);

        mermaid_id_to_uid.insert(mermaid_id.clone(), uid.clone());

        let mut node = Node::with_uid(uid, &mermaid_id);
        node.label = label;

        if let Some(d) = directive {
            if let Some(x) = d.x {
                node.x = Some(x as f64);
            }
            if let Some(y) = d.y {
                node.y = Some(y as f64);
            }
            if let Some(ref kind) = d.kind {
                node.kind = parse_node_kind(kind);
            }
            node.meta = d.meta.clone();
        }

        nodes.push(node);
    }

    // Process edges
    let mut edges = Vec::new();
    let mut edge_directive_map: IndexMap<(String, String), &EdgeDirective> = IndexMap::new();
    
    for ed in &edge_directives {
        if let (Some(ref src), Some(ref tgt)) = (&ed.source, &ed.target) {
            edge_directive_map.insert((src.clone(), tgt.clone()), ed);
        }
    }

    for (src_id, tgt_id, label) in topo_edges {
        let source = mermaid_id_to_uid
            .get(&src_id)
            .cloned()
            .unwrap_or_else(|| {
                warnings.push(format!("Unknown source node: {}", src_id));
                UID::from_str(&src_id)
            });
        
        let target = mermaid_id_to_uid
            .get(&tgt_id)
            .cloned()
            .unwrap_or_else(|| {
                warnings.push(format!("Unknown target node: {}", tgt_id));
                UID::from_str(&tgt_id)
            });

        let directive = edge_directive_map.get(&(src_id.clone(), tgt_id.clone()));
        
        let eid = directive
            .and_then(|d| d.eid.clone())
            .map(|s| EID::from_str(&s))
            .unwrap_or_else(EID::new);

        let mut edge = Edge::with_eid(eid, source, target);
        edge.label = label.or_else(|| directive.and_then(|d| d.label.clone()));
        
        if let Some(d) = directive {
            edge.meta = d.meta.clone();
        }

        edges.push(edge);
    }

    Ok(ParseResult {
        topology,
        nodes,
        edges,
        warnings,
    })
}

fn parse_node_kind(s: &str) -> crate::types::NodeKind {
    match s.to_lowercase().as_str() {
        "card" => crate::types::NodeKind::Card,
        "note" => crate::types::NodeKind::Note,
        "code" => crate::types::NodeKind::Code,
        "media" => crate::types::NodeKind::Media,
        "markdown" => crate::types::NodeKind::Markdown,
        "diagram" => crate::types::NodeKind::Diagram,
        "oembed" => crate::types::NodeKind::Oembed,
        _ => crate::types::NodeKind::Card,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_document() {
        let input = r#"graph TD
A[Start] --> B[End]

%% @node: A {"uid":"n_001","x":100,"y":50}
%% @node: B {"uid":"n_002","x":200,"y":100}
"#;

        let result = parse_document(input).unwrap();
        assert_eq!(result.nodes.len(), 2);
        assert_eq!(result.edges.len(), 1);
        
        let node_a = result.nodes.iter().find(|n| n.mermaid_id == "A").unwrap();
        assert_eq!(node_a.uid.0, "n_001");
        assert_eq!(node_a.x, Some(100.0));
    }
}
