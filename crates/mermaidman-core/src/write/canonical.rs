//! Canonical JSON serialization with stable key ordering.

use crate::types::{Edge, Node};
use indexmap::IndexMap;
use serde_json::Value;

/// Serialize a node directive to canonical JSON.
pub fn canonical_node_directive(node: &Node) -> String {
    let mut map: IndexMap<&str, Value> = IndexMap::new();
    
    // Fixed key order for diff-friendliness
    map.insert("uid", Value::String(node.uid.0.clone()));
    
    if let Some(x) = node.x {
        map.insert("x", Value::Number(serde_json::Number::from_f64(x).unwrap_or_else(|| serde_json::Number::from(0))));
    }
    if let Some(y) = node.y {
        map.insert("y", Value::Number(serde_json::Number::from_f64(y).unwrap_or_else(|| serde_json::Number::from(0))));
    }
    
    let kind_str = format!("{:?}", node.kind).to_lowercase();
    if kind_str != "card" {
        map.insert("kind", Value::String(kind_str));
    }
    
    // Add other fields as needed
    if let Some(ref style) = node.style {
        if let Ok(style_json) = serde_json::to_value(style) {
            if !style_json.as_object().map(|o| o.is_empty()).unwrap_or(true) {
                map.insert("style", style_json);
            }
        }
    }
    
    if let Some(ref code) = node.code {
        if let Ok(code_json) = serde_json::to_value(code) {
            map.insert("code", code_json);
        }
    }
    
    if let Some(ref media) = node.media {
        if let Ok(media_json) = serde_json::to_value(media) {
            map.insert("media", media_json);
        }
    }
    
    if let Some(ref diagram) = node.diagram {
        if let Ok(diagram_json) = serde_json::to_value(diagram) {
            map.insert("diagram", diagram_json);
        }
    }
    
    if let Some(ref markdown) = node.markdown {
        map.insert("markdown", Value::String(markdown.clone()));
    }
    
    if let Some(ref meta) = node.meta {
        map.insert("meta", meta.clone());
    }

    // Serialize with stable ordering
    serde_json::to_string(&map).unwrap_or_else(|_| "{}".to_string())
}

/// Serialize an edge directive to canonical JSON.
pub fn canonical_edge_directive(edge: &Edge) -> String {
    let mut map: IndexMap<&str, Value> = IndexMap::new();
    
    map.insert("eid", Value::String(edge.eid.0.clone()));
    map.insert("source", Value::String(edge.source.0.clone()));
    map.insert("target", Value::String(edge.target.0.clone()));
    
    if let Some(ref label) = edge.label {
        map.insert("label", Value::String(label.clone()));
    }
    
    if let Some(ref style) = edge.style {
        if let Ok(style_json) = serde_json::to_value(style) {
            if !style_json.as_object().map(|o| o.is_empty()).unwrap_or(true) {
                map.insert("style", style_json);
            }
        }
    }
    
    if let Some(ref meta) = edge.meta {
        map.insert("meta", meta.clone());
    }

    serde_json::to_string(&map).unwrap_or_else(|_| "{}".to_string())
}

/// Format a complete directive line.
pub fn format_node_directive(node: &Node) -> String {
    format!("%% @node: {} {}", node.mermaid_id, canonical_node_directive(node))
}

/// Format a complete edge directive line.
pub fn format_edge_directive(edge: &Edge, mermaid_id: &str) -> String {
    format!("%% @edge: {} {}", mermaid_id, canonical_edge_directive(edge))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::UID;

    #[test]
    fn test_canonical_node_directive() {
        let mut node = Node::new("A");
        node.uid = UID::from_str("n_001");
        node.x = Some(100.0);
        node.y = Some(50.0);
        
        let json = canonical_node_directive(&node);
        
        // Verify key order: uid, x, y
        assert!(json.contains("\"uid\":\"n_001\""));
        assert!(json.contains("\"x\":100"));
        assert!(json.contains("\"y\":50"));
    }

    #[test]
    fn test_format_node_directive() {
        let mut node = Node::new("A");
        node.uid = UID::from_str("n_001");
        node.x = Some(100.0);
        node.y = Some(50.0);
        
        let line = format_node_directive(&node);
        
        assert!(line.starts_with("%% @node: A "));
        assert!(line.contains("\"uid\":\"n_001\""));
    }
}
