//! Reconcile commands.

use crate::state::AppState;
use mermaidman_core::{parse, reconcile, store::GraphStore, types::DocId};
use serde::{Deserialize, Serialize};
use specta::Type;

/// Reconcile result.
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct ReconcileResult {
    pub content: String,
    pub warnings: Vec<String>,
    pub orphaned_nodes: Vec<String>,
    pub orphaned_edges: Vec<String>,
}

/// Reconcile topology text with existing graph data.
#[tauri::command]
#[specta::specta]
pub async fn reconcile(
    state: tauri::State<'_, AppState>,
    doc_id: String,
    topology_text: String,
) -> Result<ReconcileResult, String> {
    let doc_id = DocId(doc_id);

    // Get existing store
    let existing_store = state
        .docs
        .lock()
        .unwrap()
        .get(&doc_id)
        .cloned()
        .unwrap_or_else(GraphStore::new);

    // Reconcile
    let result = reconcile::reconcile(&topology_text, &existing_store).map_err(|e| e.to_string())?;

    // Update in-memory store
    state
        .docs
        .lock()
        .unwrap()
        .insert(doc_id, result.store.clone());

    Ok(ReconcileResult {
        content: result.text,
        warnings: result.warnings,
        orphaned_nodes: result.orphaned_nodes.iter().map(|u| u.0.clone()).collect(),
        orphaned_edges: result.orphaned_edges.iter().map(|e| e.0.clone()).collect(),
    })
}
