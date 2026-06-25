//! Document management commands.

use crate::db::Database;
use crate::state::AppState;
use mermaidman_core::{parse, store::GraphStore, types::DocId, write};
use serde::{Deserialize, Serialize};
use specta::Type;
use std::fs;

/// Result of opening a document.
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct OpenDocResult {
    pub doc_id: String,
    pub content: String,
    pub warnings: Vec<String>,
}

/// Result of saving a document.
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct SaveDocResult {
    pub success: bool,
    pub warnings: Vec<String>,
}

/// Open a document from disk.
#[tauri::command]
#[specta::specta]
pub async fn open_doc(
    state: tauri::State<'_, AppState>,
    path: String,
) -> Result<OpenDocResult, String> {
    // Read file
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;

    // Parse document
    let parsed = parse::parse_document(&content).map_err(|e| e.to_string())?;

    // Create store from parsed data
    let store = GraphStore::from_parsed(parsed.nodes, parsed.edges);

    // Generate doc ID from path
    let doc_id = DocId::from_path(&path);

    // Store in memory
    state
        .docs
        .lock()
        .unwrap()
        .insert(doc_id.clone(), store.clone());

    // Index in database
    if let Ok(db_guard) = state.get_db() {
        if let Some(ref db) = *db_guard {
            let title = std::path::Path::new(&path)
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("Untitled");

            let _ = db.index_document(&doc_id, title, &content);
        }
    }

    // Generate clean content (reconciled)
    let clean_content = write::generate_mermaidman(&store, "TD");

    Ok(OpenDocResult {
        doc_id: doc_id.0,
        content: clean_content,
        warnings: parsed.warnings,
    })
}

/// Save a document to disk.
#[tauri::command]
#[specta::specta]
pub async fn save_doc(
    state: tauri::State<'_, AppState>,
    doc_id: String,
    path: String,
) -> Result<SaveDocResult, String> {
    let doc_id = DocId(doc_id);

    // Get store from memory
    let store = state
        .docs
        .lock()
        .unwrap()
        .get(&doc_id)
        .cloned()
        .ok_or_else(|| "Document not open".to_string())?;

    // Generate Mermaidman text
    let content = write::generate_mermaidman(&store, "TD");

    // Write to file
    fs::write(&path, &content).map_err(|e| e.to_string())?;

    // Update index
    if let Ok(db_guard) = state.get_db() {
        if let Some(ref db) = *db_guard {
            let title = std::path::Path::new(&path)
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("Untitled");

            let _ = db.index_document(&doc_id, title, &content);
        }
    }

    Ok(SaveDocResult {
        success: true,
        warnings: vec![],
    })
}

/// Close a document (remove from memory).
#[tauri::command]
#[specta::specta]
pub async fn close_doc(
    state: tauri::State<'_, AppState>,
    doc_id: String,
) -> Result<(), String> {
    let doc_id = DocId(doc_id);
    state.docs.lock().unwrap().remove(&doc_id);
    Ok(())
}
