//! WASM bindings for Mermaidman core.
//!
//! This crate provides web-compatible bindings to the mermaidman-core
//! engine, enabling the same parser and reconcile logic to run in browsers.

use mermaidman_core::{parse, reconcile, store::GraphStore, write};
use wasm_bindgen::prelude::*;

/// Initialize panic hook for better error messages in console.
#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
}

/// Parse a Mermaidman document and return structured data.
///
/// Returns a JS object with: { topology, nodes, edges, warnings }
#[wasm_bindgen]
pub fn parse_mermaidman(input: &str) -> Result<JsValue, JsValue> {
    let result = parse::parse_document(input)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    
    serde_wasm_bindgen::to_value(&result)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Reconcile topology text with existing graph data.
///
/// Takes topology text and existing store JSON, returns reconciled result.
#[wasm_bindgen]
pub fn reconcile_document(
    topology_text: &str,
    existing_store_json: &str,
) -> Result<JsValue, JsValue> {
    let store: GraphStore = serde_json::from_str(existing_store_json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    
    let result = reconcile::reconcile(topology_text, &store)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    
    serde_wasm_bindgen::to_value(&result)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Generate Mermaidman text from a graph store.
#[wasm_bindgen]
pub fn generate_mermaidman(store_json: &str, direction: &str) -> Result<String, JsValue> {
    let store: GraphStore = serde_json::from_str(store_json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    
    Ok(write::generate_mermaidman(&store, direction))
}

/// Update a node's position in the document text.
///
/// Hot-path operation for canvas drag updates.
#[wasm_bindgen]
pub fn update_node_position(
    input: &str,
    node_id: &str,
    x: f64,
    y: f64,
) -> Result<String, JsValue> {
    // Parse, update, regenerate
    let result = parse::parse_document(input)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    
    let mut store = GraphStore::from_parsed(result.nodes, result.edges);
    
    // Find node by mermaid_id and update
    if let Some(uid) = store.alias.get_uid(node_id).cloned() {
        store.move_node(&uid, x, y);
    }
    
    Ok(write::generate_mermaidman(&store, "TD"))
}

/// Create a new empty graph store.
#[wasm_bindgen]
pub fn create_store() -> Result<JsValue, JsValue> {
    let store = GraphStore::new();
    serde_wasm_bindgen::to_value(&store)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple() {
        let input = r#"graph TD
A[Start] --> B[End]
"#;
        
        let result = parse::parse_document(input).unwrap();
        assert_eq!(result.nodes.len(), 2);
        assert_eq!(result.edges.len(), 1);
    }
}
