use mermaidman_core::parse::parse_document;

const SHARED_BASIC: &str = include_str!("../../../fixtures/parser/shared-basic.mmd");

#[test]
fn parses_shared_basic_fixture() {
    let parsed = parse_document(SHARED_BASIC).expect("shared fixture should parse");

    assert_eq!(parsed.nodes.len(), 4);
    assert_eq!(parsed.edges.len(), 3);

    let start = parsed
        .nodes
        .iter()
        .find(|node| node.mermaid_id == "A")
        .expect("A node");
    assert_eq!(start.label.as_deref(), Some("Start"));
    assert_eq!(start.uid.0, "n_a");
    assert_eq!(start.x, Some(100.0));
    assert_eq!(start.y, Some(100.0));

    let decision = parsed
        .nodes
        .iter()
        .find(|node| node.mermaid_id == "B")
        .expect("B node");
    assert_eq!(decision.label.as_deref(), Some("Ready?"));

    assert!(parsed.edges.iter().any(|edge| {
        edge.source.0 == "n_a" && edge.target.0 == "n_b"
    }));
    assert!(parsed.edges.iter().any(|edge| {
        edge.source.0 == "n_b" && edge.target.0 == "n_c"
    }));
    assert!(parsed.edges.iter().any(|edge| {
        edge.source.0 == "n_b" && edge.target.0 == "n_d"
    }));
}
