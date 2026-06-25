use regex::Regex;
use serde_json::Value;

pub fn update_mermaidman_node(input: &str, node_id: &str, x: i32, y: i32) -> String {
    // Escape node_id for regex
    let escaped_id = regex::escape(node_id);
    // Regex to find the specific node directive line
    let pattern = format!(r"(?m)^%%\s*@node:\s*{}\s*(\{{.*?\}})\s*$", escaped_id);
    let re = Regex::new(&pattern).unwrap();
    let json_replacement = format!("%% @node: {} {}", node_id, json_directive_body(x, y));

    if let Some(caps) = re.captures(input) {
        if let Some(body_match) = caps.get(1) {
            if let Ok(mut value) = serde_json::from_str::<Value>(body_match.as_str()) {
                if let Some(obj) = value.as_object_mut() {
                    obj.insert("x".to_string(), Value::from(x));
                    obj.insert("y".to_string(), Value::from(y));
                }
                if let Ok(updated) = serde_json::to_string(&value) {
                    let replacement = format!("%% @node: {} {}", node_id, updated);
                    return re.replace(input, replacement.as_str()).to_string();
                }
            }
        }

        let replacement = format!("%% @node: {} {{ x: {}, y: {} }}", node_id, x, y);
        return re.replace(input, replacement.as_str()).to_string();
    }

    let mut new_input = input.trim_end().to_string();
    if !new_input.is_empty() {
         new_input.push('\n');
    }
    new_input.push_str(&json_replacement);
    new_input.push('\n');
    new_input
}

fn json_directive_body(x: i32, y: i32) -> String {
    let value = serde_json::json!({ "x": x, "y": y });
    serde_json::to_string(&value).unwrap_or_else(|_| format!("{{\"x\":{},\"y\":{}}}", x, y))
}
