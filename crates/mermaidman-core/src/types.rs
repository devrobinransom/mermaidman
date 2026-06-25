//! Core type definitions for Mermaidman.

use serde::{Deserialize, Serialize};
use std::fmt;

/// Unique node identifier (stable across renames).
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct UID(pub String);

impl UID {
    /// Create a new random UID.
    pub fn new() -> Self {
        Self(format!("n_{}", uuid::Uuid::new_v4().simple()))
    }

    /// Create from existing string.
    pub fn from_str(s: &str) -> Self {
        Self(s.to_string())
    }
}

impl Default for UID {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Display for UID {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl AsRef<str> for UID {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

/// Unique edge identifier.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct EID(pub String);

impl EID {
    /// Create a new random EID.
    pub fn new() -> Self {
        Self(format!("e_{}", uuid::Uuid::new_v4().simple()))
    }

    /// Create from existing string.
    pub fn from_str(s: &str) -> Self {
        Self(s.to_string())
    }
}

impl Default for EID {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Display for EID {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl AsRef<str> for EID {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

/// Blob identifier (sha256 hash).
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct BlobId(pub String);

impl BlobId {
    /// Create from hash bytes.
    pub fn from_hash(hash: &[u8]) -> Self {
        use base64::Engine;
        Self(base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(hash))
    }
}

impl fmt::Display for BlobId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Document identifier.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct DocId(pub String);

impl DocId {
    /// Create from path.
    pub fn from_path(path: &str) -> Self {
        Self(path.to_string())
    }

    /// Create a temporary doc ID.
    pub fn temp() -> Self {
        Self(format!("tmp_{}", uuid::Uuid::new_v4().simple()))
    }
}

impl fmt::Display for DocId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Node kind enumeration.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub enum NodeKind {
    #[default]
    Card,
    Note,
    Code,
    Media,
    Markdown,
    Diagram,
    Oembed,
}

/// Arrow style for edges.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub enum ArrowKind {
    #[default]
    Default,
    None,
}

/// Edge style properties.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct EdgeStyle {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stroke: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dashed: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub arrow: Option<ArrowKind>,
}

/// Node style properties.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct NodeStyle {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stroke: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fill: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub border: Option<String>,
}

/// Code block metadata.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct CodeMeta {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub language: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub detected_language: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
}

/// Media (image/video/audio) metadata.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct MediaMeta {
    pub src: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alt: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub poster: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub blob_id: Option<BlobId>,
}

/// Nested diagram metadata.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct DiagramMeta {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    /// The raw mermaidman text of the nested diagram.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mermaidman: Option<String>,
}

/// A node in the graph.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    pub uid: UID,
    pub mermaid_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub x: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub y: Option<f64>,
    #[serde(default)]
    pub kind: NodeKind,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub style: Option<NodeStyle>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub code: Option<CodeMeta>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub media: Option<MediaMeta>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub diagram: Option<DiagramMeta>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub markdown: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<serde_json::Value>,
    #[serde(default)]
    pub deleted: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<u64>,
}

impl Node {
    /// Create a new node with minimal info.
    pub fn new(mermaid_id: &str) -> Self {
        Self {
            uid: UID::new(),
            mermaid_id: mermaid_id.to_string(),
            label: None,
            x: None,
            y: None,
            kind: NodeKind::default(),
            style: None,
            code: None,
            media: None,
            diagram: None,
            markdown: None,
            meta: None,
            deleted: false,
            updated_at: Some(now()),
        }
    }

    /// Create a node with a specific UID.
    pub fn with_uid(uid: UID, mermaid_id: &str) -> Self {
        Self {
            uid,
            mermaid_id: mermaid_id.to_string(),
            label: None,
            x: None,
            y: None,
            kind: NodeKind::default(),
            style: None,
            code: None,
            media: None,
            diagram: None,
            markdown: None,
            meta: None,
            deleted: false,
            updated_at: Some(now()),
        }
    }
}

/// An edge in the graph.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Edge {
    pub eid: EID,
    pub source: UID,
    pub target: UID,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub label: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub style: Option<EdgeStyle>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<serde_json::Value>,
    #[serde(default)]
    pub deleted: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<u64>,
}

impl Edge {
    /// Create a new edge.
    pub fn new(source: UID, target: UID) -> Self {
        Self {
            eid: EID::new(),
            source,
            target,
            label: None,
            style: None,
            meta: None,
            deleted: false,
            updated_at: Some(now()),
        }
    }

    /// Create an edge with a specific EID.
    pub fn with_eid(eid: EID, source: UID, target: UID) -> Self {
        Self {
            eid,
            source,
            target,
            label: None,
            style: None,
            meta: None,
            deleted: false,
            updated_at: Some(now()),
        }
    }
}

/// Blob reference.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlobRef {
    pub blob_id: BlobId,
    pub mime_type: String,
    pub size: u64,
}

/// Get current timestamp in milliseconds.
fn now() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_uid_generation() {
        let uid = UID::new();
        assert!(uid.0.starts_with("n_"));
    }

    #[test]
    fn test_eid_generation() {
        let eid = EID::new();
        assert!(eid.0.starts_with("e_"));
    }

    #[test]
    fn test_node_serialization() {
        let node = Node::new("A");
        let json = serde_json::to_string(&node).unwrap();
        assert!(json.contains("\"mermaid_id\":\"A\""));
    }
}
