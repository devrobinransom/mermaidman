//! SQLite database management with FTS5.

use anyhow::Result;
use mermaidman_core::types::{DocId, UID};
use rusqlite::{params, Connection};
use std::path::Path;

/// Database wrapper.
pub struct Database {
    conn: Connection,
}

impl Database {
    /// Open or create the database.
    pub fn open(path: &Path) -> Result<Self> {
        let conn = Connection::open(path)?;
        
        // Enable foreign keys
        conn.execute("PRAGMA foreign_keys = ON", [])?;
        
        let db = Self { conn };
        db.init_schema()?;
        
        Ok(db)
    }

    /// Initialize the database schema.
    fn init_schema(&self) -> Result<()> {
        // Documents table
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                path TEXT UNIQUE,
                title TEXT,
                content TEXT,
                updated_at INTEGER
            )",
            [],
        )?;

        // Full-text search
        self.conn.execute(
            "CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
                title,
                content,
                content=documents,
                content_rowid=rowid
            )",
            [],
        )?;

        // Triggers to keep FTS in sync
        self.conn.execute(
            "CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents BEGIN
                INSERT INTO documents_fts(rowid, title, content)
                VALUES (new.rowid, new.title, new.content);
            END",
            [],
        )?;

        self.conn.execute(
            "CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents BEGIN
                INSERT INTO documents_fts(documents_fts, rowid, title, content)
                VALUES('delete', old.rowid, old.title, old.content);
            END",
            [],
        )?;

        self.conn.execute(
            "CREATE TRIGGER IF NOT EXISTS documents_au AFTER UPDATE ON documents BEGIN
                INSERT INTO documents_fts(documents_fts, rowid, title, content)
                VALUES('delete', old.rowid, old.title, old.content);
                INSERT INTO documents_fts(rowid, title, content)
                VALUES (new.rowid, new.title, new.content);
            END",
            [],
        )?;

        // Nodes index
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS nodes (
                uid TEXT PRIMARY KEY,
                doc_id TEXT NOT NULL,
                mermaid_id TEXT,
                label TEXT,
                kind TEXT,
                x REAL,
                y REAL,
                meta TEXT,
                FOREIGN KEY (doc_id) REFERENCES documents(id) ON DELETE CASCADE
            )",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_nodes_doc ON nodes(doc_id)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_nodes_label ON nodes(label)",
            [],
        )?;

        // Backlinks
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS backlinks (
                source_doc TEXT NOT NULL,
                source_node TEXT NOT NULL,
                target_doc TEXT NOT NULL,
                target_node TEXT NOT NULL,
                link_text TEXT,
                PRIMARY KEY (source_doc, source_node, target_doc, target_node)
            )",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_backlinks_target ON backlinks(target_doc, target_node)",
            [],
        )?;

        Ok(())
    }

    /// Index a document for full-text search.
    pub fn index_document(&self, doc_id: &DocId, title: &str, content: &str) -> Result<()> {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)?
            .as_millis() as i64;

        self.conn.execute(
            "INSERT OR REPLACE INTO documents (id, title, content, updated_at)
             VALUES (?1, ?2, ?3, ?4)",
            params![doc_id.0, title, content, now],
        )?;

        Ok(())
    }

    /// Search documents using FTS5.
    pub fn search(&self, query: &str, limit: u32) -> Result<Vec<SearchResult>> {
        let mut stmt = self.conn.prepare(
            "SELECT d.id, d.title, snippet(documents_fts, 1, '<mark>', '</mark>', '...', 32) as snippet
             FROM documents_fts
             JOIN documents d ON documents_fts.rowid = d.rowid
             WHERE documents_fts MATCH ?1
             ORDER BY rank
             LIMIT ?2",
        )?;

        let results = stmt
            .query_map(params![query, limit], |row| {
                Ok(SearchResult {
                    doc_id: DocId(row.get(0)?),
                    title: row.get(1)?,
                    snippet: row.get(2)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(results)
    }

    /// Get backlinks to a node.
    pub fn get_backlinks(&self, target_node: &UID) -> Result<Vec<Backlink>> {
        let mut stmt = self.conn.prepare(
            "SELECT source_doc, source_node, link_text
             FROM backlinks
             WHERE target_node = ?1",
        )?;

        let results = stmt
            .query_map(params![target_node.0], |row| {
                Ok(Backlink {
                    source_doc: DocId(row.get(0)?),
                    source_node: UID(row.get(1)?),
                    link_text: row.get(2)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(results)
    }
}

/// Search result.
#[derive(Debug, Clone)]
pub struct SearchResult {
    pub doc_id: DocId,
    pub title: String,
    pub snippet: String,
}

/// Backlink entry.
#[derive(Debug, Clone)]
pub struct Backlink {
    pub source_doc: DocId,
    pub source_node: UID,
    pub link_text: Option<String>,
}
