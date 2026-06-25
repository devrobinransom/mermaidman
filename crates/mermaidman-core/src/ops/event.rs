//! Event-sourced operation model.

use crate::types::{Edge, Node, EID, UID};
use serde::{Deserialize, Serialize};

/// Operation kinds for event sourcing.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum OpKind {
    NodeCreate,
    NodeUpdate,
    NodeMove,
    NodeDelete,
    EdgeCreate,
    EdgeUpdate,
    EdgeDelete,
    BlobAdd,
    BlobRemove,
}

/// A single operation event.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Operation {
    /// Unique operation ID.
    pub id: String,
    /// Operation kind.
    pub kind: OpKind,
    /// Timestamp in milliseconds.
    pub timestamp: u64,
    /// Operation payload.
    pub data: OpData,
}

/// Operation payload variants.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum OpData {
    NodeCreate(NodeCreateOp),
    NodeUpdate(NodeUpdateOp),
    NodeMove(NodeMoveOp),
    NodeDelete(NodeDeleteOp),
    EdgeCreate(EdgeCreateOp),
    EdgeUpdate(EdgeUpdateOp),
    EdgeDelete(EdgeDeleteOp),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeCreateOp {
    pub node: Node,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeUpdateOp {
    pub uid: UID,
    pub before: serde_json::Value,
    pub after: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeMoveOp {
    pub uid: UID,
    pub before_x: f64,
    pub before_y: f64,
    pub after_x: f64,
    pub after_y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeDeleteOp {
    pub node: Node,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EdgeCreateOp {
    pub edge: Edge,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EdgeUpdateOp {
    pub eid: EID,
    pub before: serde_json::Value,
    pub after: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EdgeDeleteOp {
    pub edge: Edge,
}

/// Operations log for undo/redo.
#[derive(Debug, Clone, Default)]
pub struct OpsLog {
    /// Operations that can be undone.
    pub undo_stack: Vec<Operation>,
    /// Operations that can be redone.
    pub redo_stack: Vec<Operation>,
    /// Maximum stack size.
    pub max_size: usize,
}

impl OpsLog {
    /// Create a new ops log with default max size.
    pub fn new() -> Self {
        Self {
            undo_stack: Vec::new(),
            redo_stack: Vec::new(),
            max_size: 100,
        }
    }

    /// Create with custom max size.
    pub fn with_max_size(max_size: usize) -> Self {
        Self {
            undo_stack: Vec::new(),
            redo_stack: Vec::new(),
            max_size,
        }
    }

    /// Push a new operation.
    pub fn push(&mut self, op: Operation) {
        // Clear redo stack on new operation
        self.redo_stack.clear();
        
        self.undo_stack.push(op);
        
        // Trim if over max size
        if self.undo_stack.len() > self.max_size {
            self.undo_stack.remove(0);
        }
    }

    /// Pop for undo.
    pub fn pop_undo(&mut self) -> Option<Operation> {
        let op = self.undo_stack.pop()?;
        self.redo_stack.push(op.clone());
        Some(op)
    }

    /// Pop for redo.
    pub fn pop_redo(&mut self) -> Option<Operation> {
        let op = self.redo_stack.pop()?;
        self.undo_stack.push(op.clone());
        Some(op)
    }

    /// Check if undo is available.
    pub fn can_undo(&self) -> bool {
        !self.undo_stack.is_empty()
    }

    /// Check if redo is available.
    pub fn can_redo(&self) -> bool {
        !self.redo_stack.is_empty()
    }

    /// Get recent operations.
    pub fn recent(&self, limit: usize) -> &[Operation] {
        let start = self.undo_stack.len().saturating_sub(limit);
        &self.undo_stack[start..]
    }
}

/// Create a node move operation.
pub fn make_move_op(uid: UID, before_x: f64, before_y: f64, after_x: f64, after_y: f64) -> Operation {
    Operation {
        id: uuid::Uuid::new_v4().to_string(),
        kind: OpKind::NodeMove,
        timestamp: now(),
        data: OpData::NodeMove(NodeMoveOp {
            uid,
            before_x,
            before_y,
            after_x,
            after_y,
        }),
    }
}

/// Create a node create operation.
pub fn make_node_create_op(node: Node) -> Operation {
    Operation {
        id: uuid::Uuid::new_v4().to_string(),
        kind: OpKind::NodeCreate,
        timestamp: now(),
        data: OpData::NodeCreate(NodeCreateOp { node }),
    }
}

/// Create a node delete operation.
pub fn make_node_delete_op(node: Node) -> Operation {
    Operation {
        id: uuid::Uuid::new_v4().to_string(),
        kind: OpKind::NodeDelete,
        timestamp: now(),
        data: OpData::NodeDelete(NodeDeleteOp { node }),
    }
}

/// Create an edge create operation.
pub fn make_edge_create_op(edge: Edge) -> Operation {
    Operation {
        id: uuid::Uuid::new_v4().to_string(),
        kind: OpKind::EdgeCreate,
        timestamp: now(),
        data: OpData::EdgeCreate(EdgeCreateOp { edge }),
    }
}

/// Create an edge delete operation.
pub fn make_edge_delete_op(edge: Edge) -> Operation {
    Operation {
        id: uuid::Uuid::new_v4().to_string(),
        kind: OpKind::EdgeDelete,
        timestamp: now(),
        data: OpData::EdgeDelete(EdgeDeleteOp { edge }),
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
    fn test_ops_log_undo_redo() {
        let mut log = OpsLog::new();
        
        let op = make_move_op(
            UID::from_str("n_001"),
            0.0, 0.0,
            100.0, 50.0,
        );
        
        log.push(op);
        
        assert!(log.can_undo());
        assert!(!log.can_redo());
        
        let undone = log.pop_undo().unwrap();
        assert_eq!(undone.kind, OpKind::NodeMove);
        
        assert!(!log.can_undo());
        assert!(log.can_redo());
        
        let redone = log.pop_redo().unwrap();
        assert_eq!(redone.kind, OpKind::NodeMove);
    }

    #[test]
    fn test_ops_log_clears_redo_on_new_op() {
        let mut log = OpsLog::new();
        
        log.push(make_move_op(UID::from_str("n_001"), 0.0, 0.0, 100.0, 50.0));
        log.pop_undo();
        
        assert!(log.can_redo());
        
        // New operation should clear redo
        log.push(make_move_op(UID::from_str("n_002"), 0.0, 0.0, 200.0, 100.0));
        
        assert!(!log.can_redo());
    }
}
