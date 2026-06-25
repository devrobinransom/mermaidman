//! Search and backlink commands.

use crate::state::AppState;
use mermaidman_core::types::UID;
use serde::{Deserialize, Serialize};
use specta::Type;

/// Search result.
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct SearchResult {
    pub doc_id: String,
    pub title: String,
    pub snippet: String,
}

/// Backlink entry.
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct Backlink {
    pub source_doc: String,
    pub source_node: String,
    pub link_text: Option<String>,
}

/// Full-text search across indexed documents.
#[tauri::command]
#[specta::specta]
pub async fn search(
    state: tauri::State<'_, AppState>,
    query: String,
    limit: Option<u32>,
) -> Result<Vec<SearchResult>, String> {
    let db_guard = state.get_db().map_err(|e| e.to_string())?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    let results = db
        .search(&query, limit.unwrap_or(20))
        .map_err(|e| e.to_string())?;

    Ok(results
        .into_iter()
        .map(|r| SearchResult {
            doc_id: r.doc_id.0,
            title: r.title,
            snippet: r.snippet,
        })
        .collect())
}

/// Get backlinks to a node.
#[tauri::command]
#[specta::specta]
pub async fn get_backlinks(
    state: tauri::State<'_, AppState>,
    node_uid: String,
) -> Result<Vec<Backlink>, String> {
    let db_guard = state.get_db().map_err(|e| e.to_string())?;
    let db = db_guard.as_ref().ok_or("Database not initialized")?;

    let uid = UID::from_str(&node_uid);
    let results = db.get_backlinks(&uid).map_err(|e| e.to_string())?;

    Ok(results
        .into_iter()
        .map(|b| Backlink {
            source_doc: b.source_doc.0,
            source_node: b.source_node.0,
            link_text: b.link_text,
        })
        .collect())
}
