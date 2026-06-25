//! In-memory graph store with UID-first indexing.

use crate::types::{Edge, Node, EID, UID};
use indexmap::IndexMap;
use serde::{Deserialize, Serialize};

/// Alias mapping between Mermaid IDs and UIDs.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct AliasMap {
    pub mermaid_id_to_uid: IndexMap<String, UID>,
    pub uid_to_mermaid_id: IndexMap<UID, String>,
}

impl AliasMap {
    /// Register an alias mapping.
    pub fn register(&mut self, mermaid_id: &str, uid: &UID) {
        self.mermaid_id_to_uid
            .insert(mermaid_id.to_string(), uid.clone());
        self.uid_to_mermaid_id
            .insert(uid.clone(), mermaid_id.to_string());
    }

    /// Get UID by Mermaid ID.
    pub fn get_uid(&self, mermaid_id: &str) -> Option<&UID> {
        self.mermaid_id_to_uid.get(mermaid_id)
    }

    /// Get Mermaid ID by UID.
    pub fn get_mermaid_id(&self, uid: &UID) -> Option<&String> {
        self.uid_to_mermaid_id.get(uid)
    }

    /// Remove alias by UID.
    pub fn remove_by_uid(&mut self, uid: &UID) {
        if let Some(mermaid_id) = self.uid_to_mermaid_id.remove(uid) {
            self.mermaid_id_to_uid.remove(&mermaid_id);
        }
    }

    /// Update Mermaid ID for a UID.
    pub fn rename(&mut self, uid: &UID, new_mermaid_id: &str) {
        if let Some(old_mermaid_id) = self.uid_to_mermaid_id.get(uid).cloned() {
            self.mermaid_id_to_uid.remove(&old_mermaid_id);
        }
        self.mermaid_id_to_uid
            .insert(new_mermaid_id.to_string(), uid.clone());
        self.uid_to_mermaid_id
            .insert(uid.clone(), new_mermaid_id.to_string());
    }
}

/// The in-memory graph store.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct GraphStore {
    pub nodes: IndexMap<UID, Node>,
    pub edges: IndexMap<EID, Edge>,
    pub alias: AliasMap,
    pub version: u32,
}

impl GraphStore {
    /// Create a new empty store.
    pub fn new() -> Self {
        Self {
            nodes: IndexMap::new(),
            edges: IndexMap::new(),
            alias: AliasMap::default(),
            version: 1,
        }
    }

    /// Create from parsed nodes and edges.
    pub fn from_parsed(nodes: Vec<Node>, edges: Vec<Edge>) -> Self {
        let mut store = Self::new();
        
        for node in nodes {
            store.alias.register(&node.mermaid_id, &node.uid);
            store.nodes.insert(node.uid.clone(), node);
        }
        
        for edge in edges {
            store.edges.insert(edge.eid.clone(), edge);
        }
        
        store
    }

    /// Get a node by UID.
    pub fn get_node(&self, uid: &UID) -> Option<&Node> {
        self.nodes.get(uid)
    }

    /// Get a node by Mermaid ID.
    pub fn get_node_by_mermaid_id(&self, mermaid_id: &str) -> Option<&Node> {
        self.alias.get_uid(mermaid_id).and_then(|uid| self.nodes.get(uid))
    }

    /// Get mutable node by UID.
    pub fn get_node_mut(&mut self, uid: &UID) -> Option<&mut Node> {
        self.nodes.get_mut(uid)
    }

    /// Get an edge by EID.
    pub fn get_edge(&self, eid: &EID) -> Option<&Edge> {
        self.edges.get(eid)
    }

    /// Get mutable edge by EID.
    pub fn get_edge_mut(&mut self, eid: &EID) -> Option<&mut Edge> {
        self.edges.get_mut(eid)
    }

    /// Insert or update a node.
    pub fn upsert_node(&mut self, node: Node) {
        self.alias.register(&node.mermaid_id, &node.uid);
        self.nodes.insert(node.uid.clone(), node);
    }

    /// Insert or update an edge.
    pub fn upsert_edge(&mut self, edge: Edge) {
        self.edges.insert(edge.eid.clone(), edge);
    }

    /// Move a node to new coordinates.
    pub fn move_node(&mut self, uid: &UID, x: f64, y: f64) {
        if let Some(node) = self.nodes.get_mut(uid) {
            node.x = Some(x);
            node.y = Some(y);
            node.updated_at = Some(now());
        }
    }

    /// Rename a node's Mermaid ID.
    pub fn rename_node(&mut self, uid: &UID, new_mermaid_id: &str) {
        self.alias.rename(uid, new_mermaid_id);
        if let Some(node) = self.nodes.get_mut(uid) {
            node.mermaid_id = new_mermaid_id.to_string();
            node.updated_at = Some(now());
        }
    }

    /// Soft-delete a node.
    pub fn delete_node(&mut self, uid: &UID) {
        if let Some(node) = self.nodes.get_mut(uid) {
            node.deleted = true;
            node.updated_at = Some(now());
        }
        self.alias.remove_by_uid(uid);
    }

    /// Soft-delete an edge.
    pub fn delete_edge(&mut self, eid: &EID) {
        if let Some(edge) = self.edges.get_mut(eid) {
            edge.deleted = true;
            edge.updated_at = Some(now());
        }
    }

    /// Get all non-deleted nodes.
    pub fn active_nodes(&self) -> impl Iterator<Item = &Node> {
        self.nodes.values().filter(|n| !n.deleted)
    }

    /// Get all non-deleted edges.
    pub fn active_edges(&self) -> impl Iterator<Item = &Edge> {
        self.edges.values().filter(|e| !e.deleted)
    }

    /// Get edges connected to a node.
    pub fn edges_for_node(&self, uid: &UID) -> Vec<&Edge> {
        self.edges
            .values()
            .filter(|e| !e.deleted && (&e.source == uid || &e.target == uid))
            .collect()
    }

    /// Get outgoing edges from a node.
    pub fn outgoing_edges(&self, uid: &UID) -> Vec<&Edge> {
        self.edges
            .values()
            .filter(|e| !e.deleted && &e.source == uid)
            .collect()
    }

    /// Get incoming edges to a node.
    pub fn incoming_edges(&self, uid: &UID) -> Vec<&Edge> {
        self.edges
            .values()
            .filter(|e| !e.deleted && &e.target == uid)
            .collect()
    }
}

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
    fn test_graph_store_basic() {
        let mut store = GraphStore::new();
        
        let node = Node::new("A");
        let uid = node.uid.clone();
        store.upsert_node(node);
        
        assert!(store.get_node(&uid).is_some());
        assert!(store.get_node_by_mermaid_id("A").is_some());
    }

    #[test]
    fn test_node_move() {
        let mut store = GraphStore::new();
        let node = Node::new("A");
        let uid = node.uid.clone();
        store.upsert_node(node);
        
        store.move_node(&uid, 100.0, 200.0);
        
        let n = store.get_node(&uid).unwrap();
        assert_eq!(n.x, Some(100.0));
        assert_eq!(n.y, Some(200.0));
    }

    #[test]
    fn test_soft_delete() {
        let mut store = GraphStore::new();
        let node = Node::new("A");
        let uid = node.uid.clone();
        store.upsert_node(node);
        
        store.delete_node(&uid);
        
        assert!(store.get_node(&uid).unwrap().deleted);
        assert_eq!(store.active_nodes().count(), 0);
    }
}
