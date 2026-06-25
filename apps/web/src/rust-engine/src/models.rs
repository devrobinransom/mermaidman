use serde::{Serialize, Deserialize};
use serde_json::Value;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Node {
    pub id: String,
    pub label: Option<String>,
    pub x: Option<i32>,
    pub y: Option<i32>,
    /// Mermaid node shape parsed from the topology delimiters
    /// (rect, round, stadium, subroutine, cylinder, circle, doublecircle,
    /// asymmetric, rhombus, hexagon, parallelogram, parallelogram_alt,
    /// trapezoid, trapezoid_alt). None when the id appears without a shape.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shape: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uid: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<Value>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Edge {
    pub source: String,
    pub target: String,
    pub label: Option<String>,
    /// Line style: solid | dotted | thick | invisible
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line: Option<String>,
    /// End arrowhead: arrow | circle | cross | open (None = open)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub head_end: Option<String>,
    /// Start arrowhead for bidirectional links: arrow | circle | cross
    #[serde(skip_serializing_if = "Option::is_none")]
    pub head_start: Option<String>,
    /// Link rank length (number of line characters), for layout hints
    #[serde(skip_serializing_if = "Option::is_none")]
    pub length: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub eid: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<Value>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ParseResult {
    pub clean_code: String,
    pub nodes: Vec<Node>,
    pub edges: Vec<Edge>,
}

pub struct NodeDirective {
    pub id: String,
    pub uid: Option<String>,
    pub x: Option<i32>,
    pub y: Option<i32>,
    pub meta: Option<Value>,
}

pub struct EdgeDirective {
    pub eid: Option<String>,
    pub source: Option<String>,
    pub target: Option<String>,
    pub label: Option<String>,
    pub meta: Option<Value>,
}

pub struct Spatial { 
    pub id: String, 
    pub x: i32, 
    pub y: i32 
}
