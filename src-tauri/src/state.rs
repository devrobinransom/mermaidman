//! Application state management.

use crate::db::Database;
use anyhow::Result;
use mermaidman_core::store::GraphStore;
use mermaidman_core::types::DocId;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Mutex;

/// Application state shared across Tauri commands.
pub struct AppState {
    /// Open documents in memory.
    pub docs: Mutex<HashMap<DocId, GraphStore>>,
    /// Database connection.
    pub db: Mutex<Option<Database>>,
    /// App data directory.
    pub data_dir: Mutex<Option<PathBuf>>,
}

impl AppState {
    /// Create a new empty app state.
    pub fn new() -> Self {
        Self {
            docs: Mutex::new(HashMap::new()),
            db: Mutex::new(None),
            data_dir: Mutex::new(None),
        }
    }

    /// Initialize the database.
    pub fn init_db(&self) -> Result<()> {
        let data_dir = dirs::data_dir()
            .ok_or_else(|| anyhow::anyhow!("Could not find data directory"))?
            .join("mermaidman");

        std::fs::create_dir_all(&data_dir)?;

        let db_path = data_dir.join("mermaidman.db");
        let database = Database::open(&db_path)?;

        *self.db.lock().unwrap() = Some(database);
        *self.data_dir.lock().unwrap() = Some(data_dir);

        Ok(())
    }

    /// Get the database handle.
    pub fn get_db(&self) -> Result<std::sync::MutexGuard<Option<Database>>> {
        Ok(self.db.lock().unwrap())
    }

    /// Get the data directory.
    pub fn get_data_dir(&self) -> Result<PathBuf> {
        self.data_dir
            .lock()
            .unwrap()
            .clone()
            .ok_or_else(|| anyhow::anyhow!("Data directory not initialized"))
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}
