//! Directive parsing for Mermaidman comments.

use regex::Regex;
use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Parsed node directive.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeDirective {
    pub id: String,
    pub uid: Option<String>,
    pub x: Option<i32>,
    pub y: Option<i32>,
    pub kind: Option<String>,
    pub meta: Option<Value>,
}

/// Parsed edge directive.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EdgeDirective {
    pub eid: Option<String>,
    pub source: Option<String>,
    pub target: Option<String>,
    pub label: Option<String>,
    pub meta: Option<Value>,
}

/// Parsed AI directive.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AiDirective {
    pub target_uid: String,
    pub action: String,
    pub provider: Option<String>,
    pub timestamp: Option<u64>,
    pub meta: Option<Value>,
}

/// Parse a node directive line.
/// Format: `%% @node: ID {"uid":"n_xxx","x":100,"y":50,...}`
pub fn parse_node_directive(line: &str) -> Option<NodeDirective> {
    let re = Regex::new(r"^%%\s*@node:\s*([A-Za-z0-9_]+)\s*(\{.*\})\s*$").ok()?;
    let caps = re.captures(line)?;
    
    let id = caps.get(1)?.as_str().to_string();
    let body = caps.get(2)?.as_str();

    let value: Value = serde_json::from_str(body).ok()?;
    
    let uid = value.get("uid").and_then(|v| v.as_str()).map(String::from);
    let x = value.get("x").and_then(json_to_i32);
    let y = value.get("y").and_then(json_to_i32);
    let kind = value.get("kind").and_then(|v| v.as_str()).map(String::from);

    Some(NodeDirective {
        id,
        uid,
        x,
        y,
        kind,
        meta: Some(value),
    })
}

/// Parse an edge directive line.
/// Format: `%% @edge: ID {"eid":"e_xxx","source":"n_1","target":"n_2",...}`
pub fn parse_edge_directive(line: &str) -> Option<EdgeDirective> {
    let re = Regex::new(r"^%%\s*@edge:\s*([A-Za-z0-9_]+)\s*(\{.*\})\s*$").ok()?;
    let caps = re.captures(line)?;
    
    let eid = caps.get(1).map(|m| m.as_str().to_string());
    let body = caps.get(2)?.as_str();

    let value: Value = serde_json::from_str(body).ok()?;
    
    let source = value.get("source").and_then(|v| v.as_str()).map(String::from);
    let target = value.get("target").and_then(|v| v.as_str()).map(String::from);
    let label = value.get("label").and_then(|v| v.as_str()).map(String::from);

    Some(EdgeDirective {
        eid,
        source,
        target,
        label,
        meta: Some(value),
    })
}

/// Parse an AI directive line.
/// Format: `%% @ai: UID {"action":"summarize","provider":"gemini",...}`
pub fn parse_ai_directive(line: &str) -> Option<AiDirective> {
    let re = Regex::new(r"^%%\s*@ai:\s*([A-Za-z0-9_]+)\s*(\{.*\})\s*$").ok()?;
    let caps = re.captures(line)?;
    
    let target_uid = caps.get(1)?.as_str().to_string();
    let body = caps.get(2)?.as_str();

    let value: Value = serde_json::from_str(body).ok()?;
    
    let action = value.get("action").and_then(|v| v.as_str())?.to_string();
    let provider = value.get("provider").and_then(|v| v.as_str()).map(String::from);
    let timestamp = value.get("timestamp").and_then(|v| v.as_u64());

    Some(AiDirective {
        target_uid,
        action,
        provider,
        timestamp,
        meta: Some(value),
    })
}

fn json_to_i32(value: &Value) -> Option<i32> {
    value
        .as_i64()
        .map(|v| v as i32)
        .or_else(|| value.as_f64().map(|v| v.round() as i32))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_node_directive() {
        let line = r#"%% @node: A {"uid":"n_001","x":100,"y":50,"kind":"card"}"#;
        let d = parse_node_directive(line).unwrap();
        
        assert_eq!(d.id, "A");
        assert_eq!(d.uid, Some("n_001".to_string()));
        assert_eq!(d.x, Some(100));
        assert_eq!(d.y, Some(50));
        assert_eq!(d.kind, Some("card".to_string()));
    }

    #[test]
    fn test_parse_edge_directive() {
        let line = r#"%% @edge: e1 {"eid":"e_001","source":"n_1","target":"n_2","label":"next"}"#;
        let d = parse_edge_directive(line).unwrap();
        
        assert_eq!(d.eid, Some("e1".to_string()));
        assert_eq!(d.source, Some("n_1".to_string()));
        assert_eq!(d.target, Some("n_2".to_string()));
        assert_eq!(d.label, Some("next".to_string()));
    }

    #[test]
    fn test_parse_ai_directive() {
        let line = r#"%% @ai: n_001 {"action":"summarize","provider":"gemini"}"#;
        let d = parse_ai_directive(line).unwrap();
        
        assert_eq!(d.target_uid, "n_001");
        assert_eq!(d.action, "summarize");
        assert_eq!(d.provider, Some("gemini".to_string()));
    }
}
