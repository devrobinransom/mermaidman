use wasm_bindgen::prelude::*;
use crate::models::ParseResult;

pub mod models;
pub mod parser;
pub mod directives;

#[wasm_bindgen]
pub fn parse_mermaidman(input: &str) -> JsValue {
    let _ = console_error_panic_hook::set_once();
    let (clean_code, nodes, edges) = parser::parse_logic(input);
    let result = ParseResult { clean_code, nodes, edges };
    serde_wasm_bindgen::to_value(&result).unwrap()
}

#[wasm_bindgen]
pub fn update_mermaidman_node(input: &str, node_id: &str, x: i32, y: i32) -> String {
    directives::update_mermaidman_node(input, node_id, x, y)
}
