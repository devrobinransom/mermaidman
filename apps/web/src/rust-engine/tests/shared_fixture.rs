use mermaidman_engine::parser::parse_logic;

const SHARED_BASIC: &str = include_str!("../../../../../../fixtures/parser/shared-basic.mmd");

#[test]
fn parses_shared_basic_fixture() {
    let (_, nodes, edges) = parse_logic(SHARED_BASIC);

    assert_eq!(nodes.len(), 4);
    assert_eq!(edges.len(), 3);

    let start = nodes.iter().find(|node| node.id == "A").expect("A node");
    assert_eq!(start.label.as_deref(), Some("Start"));
    assert_eq!(start.uid.as_deref(), Some("n_a"));
    assert_eq!(start.x, Some(100));
    assert_eq!(start.y, Some(100));

    let decision = nodes.iter().find(|node| node.id == "B").expect("B node");
    assert_eq!(decision.label.as_deref(), Some("Ready?"));
    assert_eq!(decision.shape.as_deref(), Some("rhombus"));

    assert!(edges.iter().any(|edge| edge.source == "A" && edge.target == "B"));
    assert!(edges.iter().any(|edge| edge.source == "B" && edge.target == "C"));
    assert!(edges.iter().any(|edge| edge.source == "B" && edge.target == "D"));
}
