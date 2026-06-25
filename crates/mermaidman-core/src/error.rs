//! Error types for mermaidman-core.

use thiserror::Error;

/// Core error type.
#[derive(Error, Debug)]
pub enum Error {
    #[error("Parse error: {0}")]
    Parse(String),

    #[error("Node not found: {0}")]
    NodeNotFound(String),

    #[error("Edge not found: {0}")]
    EdgeNotFound(String),

    #[error("Invalid directive: {0}")]
    InvalidDirective(String),

    #[error("Reconcile error: {0}")]
    Reconcile(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Blob error: {0}")]
    Blob(String),

    #[error("Operation error: {0}")]
    Operation(String),
}

/// Result type alias.
pub type Result<T> = std::result::Result<T, Error>;
