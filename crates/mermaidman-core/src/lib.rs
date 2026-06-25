//! # Mermaidman Core
//!
//! Platform-agnostic engine for Mermaidman diagram editor.
//! Works in both native (Tauri) and WASM (web) contexts.
//!
//! ## Modules
//!
//! - `types` - Core type definitions (UID, EID, NodeKind, etc.)
//! - `parse` - Mermaid topology + directive parsing
//! - `write` - Canonical serialization
//! - `reconcile` - Graph ↔ directives reconciliation
//! - `store` - In-memory graph model
//! - `index` - Search and backlinks (trait-based)
//! - `ops` - Event-sourced operations for undo/redo
//! - `error` - Error types

pub mod error;
pub mod ops;
pub mod parse;
pub mod reconcile;
pub mod store;
pub mod types;
pub mod write;

// Re-exports for convenience
pub use error::{Error, Result};
pub use types::*;
