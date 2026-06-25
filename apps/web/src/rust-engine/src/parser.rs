use nom::{
    branch::alt,
    bytes::complete::{tag, take_until, take_while1},
    character::complete::{char, one_of, space0, space1},
    combinator::{map, opt},
    multi::{many0, separated_list1},
    sequence::{delimited, pair, preceded},
    IResult,
};
use lazy_static::lazy_static;
use regex::Regex;
use serde_json::Value;
use std::collections::HashMap;
use crate::models::{Node, Edge, NodeDirective, EdgeDirective, Spatial};

// Regexes are compiled once, not per line (this parse runs on every keystroke).
lazy_static! {
    static ref NODE_DIRECTIVE_RE: Regex =
        Regex::new(r"^%%\s*@node:\s*([A-Za-z0-9_]+)\s*(\{.*\})\s*$").unwrap();
    static ref EDGE_DIRECTIVE_RE: Regex =
        Regex::new(r"^%%\s*@edge:\s*([A-Za-z0-9_]+)\s*(\{.*\})\s*$").unwrap();
    // Middle-label link form, e.g. `A -- yes --> B` or `A == big ==> B`.
    // Captures the trailing connector + the label so we can normalize it to the
    // canonical pipe form `A -->|yes| B` before structural parsing.
    static ref MIDDLE_LABEL_RE: Regex =
        Regex::new(r"[<ox]?[-.=~]{2,}\s+(\S(?:[^|]*?\S)?)\s+([<ox]?[-.=~]{2,}[>ox]?)").unwrap();
}

// --- Directive parsing (unchanged behavior, hoisted regexes) ---

fn parse_spatial_directive(input: &str) -> IResult<&str, Spatial> {
    let (input, _) = tag("%%")(input)?;
    let (input, _) = space0(input)?;
    let (input, _) = tag("@node:")(input)?;
    let (input, _) = space1(input)?;
    let (input, id) = nom::character::complete::alphanumeric1(input)?;
    let (input, _) = space0(input)?;
    let (input, _) = tag("{")(input)?;
    let (input, _) = space0(input)?;
    let (input, _) = tag("x:")(input)?;
    let (input, _) = space0(input)?;
    let (input, x_str) = nom::combinator::recognize(pair(
        opt(char('-')),
        nom::character::complete::digit1,
    ))(input)?;
    let (input, _) = space0(input)?;
    let (input, _) = tag(",")(input)?;
    let (input, _) = space0(input)?;
    let (input, _) = tag("y:")(input)?;
    let (input, _) = space0(input)?;
    let (input, y_str) = nom::combinator::recognize(pair(
        opt(char('-')),
        nom::character::complete::digit1,
    ))(input)?;
    let (input, _) = space0(input)?;
    let (input, _) = tag("}")(input)?;

    Ok((input, Spatial {
        id: id.to_string(),
        x: x_str.parse().unwrap_or(0),
        y: y_str.parse().unwrap_or(0),
    }))
}

fn json_number_to_i32(value: &Value) -> Option<i32> {
    value.as_i64().map(|v| v as i32).or_else(|| value.as_f64().map(|v| v.round() as i32))
}

fn parse_node_directive_line(input: &str) -> Option<NodeDirective> {
    if let Some(caps) = NODE_DIRECTIVE_RE.captures(input) {
        let id = caps.get(1)?.as_str().to_string();
        let body = caps.get(2)?.as_str();
        if let Ok(value) = serde_json::from_str::<Value>(body) {
            let uid = value.get("uid").and_then(|v| v.as_str()).map(|s| s.to_string());
            let x = value.get("x").and_then(json_number_to_i32);
            let y = value.get("y").and_then(json_number_to_i32);
            return Some(NodeDirective { id, uid, x, y, meta: Some(value) });
        }
    }
    if let Ok((_, spatial)) = parse_spatial_directive(input) {
        return Some(NodeDirective {
            id: spatial.id,
            uid: None,
            x: Some(spatial.x),
            y: Some(spatial.y),
            meta: None,
        });
    }
    None
}

fn parse_edge_directive_line(input: &str) -> Option<EdgeDirective> {
    let caps = EDGE_DIRECTIVE_RE.captures(input)?;
    let eid = caps.get(1).map(|m| m.as_str().to_string());
    let body = caps.get(2)?.as_str();
    let value = serde_json::from_str::<Value>(body).ok()?;
    let source = value.get("source").and_then(|v| v.as_str()).map(|s| s.to_string());
    let target = value.get("target").and_then(|v| v.as_str()).map(|s| s.to_string());
    let label = value.get("label").and_then(|v| v.as_str()).map(|s| s.to_string());
    Some(EdgeDirective { eid, source, target, label, meta: Some(value) })
}

// --- Topology parsing (nom) ---

#[derive(Clone, Debug)]
struct Decl {
    id: String,
    label: Option<String>,
    shape: Option<String>,
}

fn node_id(input: &str) -> IResult<&str, &str> {
    take_while1(|c: char| c.is_ascii_alphanumeric() || c == '_')(input)
}

/// Parse a node shape delimiter, returning (shape_name, inner_label).
/// Order matters: longer / more specific delimiters are tried first.
fn shape(input: &str) -> IResult<&str, (&'static str, &str)> {
    alt((
        map(delimited(tag("((("), take_until(")))"), tag(")))")), |l| ("doublecircle", l)),
        map(delimited(tag("(("), take_until("))"), tag("))")), |l| ("circle", l)),
        map(delimited(tag("(["), take_until("])"), tag("])")), |l| ("stadium", l)),
        map(delimited(tag("[["), take_until("]]"), tag("]]")), |l| ("subroutine", l)),
        map(delimited(tag("[("), take_until(")]"), tag(")]")), |l| ("cylinder", l)),
        // `[/ .. /]` parallelogram vs `[/ .. \]` trapezoid (different closers)
        map(delimited(tag("[/"), take_until("/]"), tag("/]")), |l| ("parallelogram", l)),
        map(delimited(tag("[/"), take_until("\\]"), tag("\\]")), |l| ("trapezoid", l)),
        map(delimited(tag("[\\"), take_until("\\]"), tag("\\]")), |l| ("parallelogram_alt", l)),
        map(delimited(tag("[\\"), take_until("/]"), tag("/]")), |l| ("trapezoid_alt", l)),
        map(delimited(tag("{{"), take_until("}}"), tag("}}")), |l| ("hexagon", l)),
        map(delimited(tag("{"), take_until("}"), tag("}")), |l| ("rhombus", l)),
        map(delimited(tag(">"), take_until("]"), tag("]")), |l| ("asymmetric", l)),
        map(delimited(tag("["), take_until("]"), tag("]")), |l| ("rect", l)),
        map(delimited(tag("("), take_until(")"), tag(")")), |l| ("round", l)),
    ))(input)
}

fn node_decl(input: &str) -> IResult<&str, Decl> {
    let (input, id) = node_id(input)?;
    let (input, sh) = opt(shape)(input)?;
    Ok((input, Decl {
        id: id.to_string(),
        label: sh.map(|(_, l)| l.trim().to_string()),
        shape: sh.map(|(s, _)| s.to_string()),
    }))
}

/// `A & B & C` — a group of nodes that share the same link.
fn node_group(input: &str) -> IResult<&str, Vec<Decl>> {
    separated_list1(delimited(space0, char('&'), space0), node_decl)(input)
}

#[derive(Clone, Debug)]
struct Link {
    line: String,
    head_start: Option<String>,
    head_end: Option<String>,
    length: usize,
    label: Option<String>,
}

fn head_name(c: char) -> String {
    match c {
        '>' | '<' => "arrow",
        'o' => "circle",
        'x' => "cross",
        _ => "open",
    }
    .to_string()
}

fn classify_line(body: &str) -> &'static str {
    if body.contains('=') {
        "thick"
    } else if body.contains('~') {
        "invisible"
    } else if body.contains('.') {
        "dotted"
    } else {
        "solid"
    }
}

fn pipe_label(input: &str) -> IResult<&str, String> {
    map(delimited(char('|'), take_until("|"), char('|')), |s: &str| {
        s.trim().to_string()
    })(input)
}

/// A link operator: optional start head, a run of line chars, optional end head,
/// and an optional `|label|`. Middle-label forms are normalized to pipe form
/// before this runs (see `normalize_middle_labels`).
fn link(input: &str) -> IResult<&str, Link> {
    let (input, lhead) = opt(one_of("<ox"))(input)?;
    let (input, body) = take_while1(|c| c == '-' || c == '.' || c == '=' || c == '~')(input)?;
    let (input, rhead) = opt(one_of(">ox"))(input)?;
    let (input, label) = opt(pipe_label)(input)?;

    let length = body.chars().filter(|c| *c == '-' || *c == '=' || *c == '~').count();
    Ok((input, Link {
        line: classify_line(body).to_string(),
        head_start: lhead.map(head_name),
        head_end: rhead.map(head_name),
        length: length.max(1),
        label,
    }))
}

/// A full statement: a node group, then zero or more (link, node group) pairs.
/// Supports chaining (`A --> B --> C`) and grouping (`A & B --> C & D`).
type Statement = (Vec<Decl>, Vec<(Link, Vec<Decl>)>);

fn statement(input: &str) -> IResult<&str, Statement> {
    let (input, _) = space0(input)?;
    let (input, first) = node_group(input)?;
    let (input, rest) = many0(pair(
        preceded(space0, link),
        preceded(space0, node_group),
    ))(input)?;
    Ok((input, (first, rest)))
}

/// Rewrite middle-label links (`A -- yes --> B`) to pipe form (`A -->|yes| B`)
/// so the structural parser only has to handle one label syntax.
fn normalize_middle_labels(line: &str) -> String {
    // Don't touch lines that already use pipe labels.
    if line.contains('|') {
        return line.to_string();
    }
    MIDDLE_LABEL_RE
        .replace_all(line, |caps: &regex::Captures| {
            let label = &caps[1];
            let closer = &caps[2];
            format!("{}|{}|", closer, label)
        })
        .to_string()
}

// --- Orchestration ---

pub fn parse_logic(input: &str) -> (String, Vec<Node>, Vec<Edge>) {
    let mut nodes_map: HashMap<String, Node> = HashMap::new();
    let mut order: Vec<String> = Vec::new();
    let mut edges: Vec<Edge> = Vec::new();
    let mut node_directives: HashMap<String, NodeDirective> = HashMap::new();
    let mut edge_directives_by_pair: HashMap<(String, String), EdgeDirective> = HashMap::new();

    let upsert_decl = |nodes_map: &mut HashMap<String, Node>,
                       order: &mut Vec<String>,
                       decl: &Decl| {
        let entry = nodes_map.entry(decl.id.clone()).or_insert_with(|| {
            order.push(decl.id.clone());
            Node {
                id: decl.id.clone(),
                label: None,
                x: None,
                y: None,
                shape: None,
                uid: None,
                meta: None,
            }
        });
        if decl.label.is_some() {
            entry.label = decl.label.clone();
        }
        if decl.shape.is_some() {
            entry.shape = decl.shape.clone();
        }
    };

    for raw_line in input.lines() {
        let trimmed = raw_line.trim();
        if trimmed.is_empty() {
            continue;
        }

        // 1. Directives
        if trimmed.starts_with("%%") {
            if let Some(directive) = parse_node_directive_line(trimmed) {
                node_directives.insert(directive.id.clone(), directive);
            } else if let Some(directive) = parse_edge_directive_line(trimmed) {
                if let (Some(source), Some(target)) =
                    (directive.source.clone(), directive.target.clone())
                {
                    edge_directives_by_pair.insert((source, target), directive);
                }
            }
            continue;
        }

        // 2. Header (graph / flowchart + direction) — skip, kept verbatim in source.
        if trimmed.starts_with("graph ")
            || trimmed.starts_with("flowchart ")
            || trimmed == "graph"
            || trimmed == "flowchart"
        {
            continue;
        }

        // 3. Statement (nodes + edges, with chaining and grouping)
        let normalized = normalize_middle_labels(trimmed);
        if let Ok((_, (first, rest))) = statement(&normalized) {
            // Register every declared node (preserving shapes/labels).
            for decl in &first {
                upsert_decl(&mut nodes_map, &mut order, decl);
            }
            let mut prev_group = first;
            for (lnk, next_group) in rest {
                for decl in &next_group {
                    upsert_decl(&mut nodes_map, &mut order, decl);
                }
                // Cartesian product across grouped endpoints.
                for src in &prev_group {
                    for tgt in &next_group {
                        edges.push(Edge {
                            source: src.id.clone(),
                            target: tgt.id.clone(),
                            label: lnk.label.clone(),
                            line: Some(lnk.line.clone()),
                            head_end: lnk.head_end.clone(),
                            head_start: lnk.head_start.clone(),
                            length: Some(lnk.length),
                            eid: None,
                            meta: None,
                        });
                    }
                }
                prev_group = next_group;
            }
        }
    }

    // Garbage collection: only attach directive metadata to nodes that exist.
    let mut final_nodes = Vec::with_capacity(order.len());
    for id in &order {
        if let Some(mut node) = nodes_map.remove(id) {
            if let Some(directive) = node_directives.get(id) {
                if let Some(x) = directive.x {
                    node.x = Some(x);
                }
                if let Some(y) = directive.y {
                    node.y = Some(y);
                }
                node.uid = directive.uid.clone();
                node.meta = directive.meta.clone();
            }
            final_nodes.push(node);
        }
    }

    // Attach edge directives by (source, target) pair.
    for edge in edges.iter_mut() {
        if let Some(directive) =
            edge_directives_by_pair.get(&(edge.source.clone(), edge.target.clone()))
        {
            edge.eid = directive.eid.clone();
            edge.meta = directive.meta.clone();
            if edge.label.is_none() {
                edge.label = directive.label.clone();
            }
        }
    }

    (input.to_string(), final_nodes, edges)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parse(src: &str) -> (Vec<Node>, Vec<Edge>) {
        let (_, n, e) = parse_logic(src);
        (n, e)
    }

    fn node<'a>(nodes: &'a [Node], id: &str) -> &'a Node {
        nodes.iter().find(|n| n.id == id).expect("node present")
    }

    #[test]
    fn parses_all_node_shapes() {
        let src = "graph TD\n\
            A[rect]\n\
            B(round)\n\
            C([stadium])\n\
            D[[sub]]\n\
            E[(db)]\n\
            F((circle))\n\
            G>asym]\n\
            H{rhombus}\n\
            I{{hex}}\n\
            J[/para/]\n\
            K[\\paraalt\\]\n\
            L[/trap\\]\n\
            M[\\trapalt/]\n\
            N(((dbl)))\n";
        let (nodes, _) = parse(src);
        assert_eq!(node(&nodes, "A").shape.as_deref(), Some("rect"));
        assert_eq!(node(&nodes, "B").shape.as_deref(), Some("round"));
        assert_eq!(node(&nodes, "C").shape.as_deref(), Some("stadium"));
        assert_eq!(node(&nodes, "D").shape.as_deref(), Some("subroutine"));
        assert_eq!(node(&nodes, "E").shape.as_deref(), Some("cylinder"));
        assert_eq!(node(&nodes, "F").shape.as_deref(), Some("circle"));
        assert_eq!(node(&nodes, "G").shape.as_deref(), Some("asymmetric"));
        assert_eq!(node(&nodes, "H").shape.as_deref(), Some("rhombus"));
        assert_eq!(node(&nodes, "I").shape.as_deref(), Some("hexagon"));
        assert_eq!(node(&nodes, "J").shape.as_deref(), Some("parallelogram"));
        assert_eq!(node(&nodes, "K").shape.as_deref(), Some("parallelogram_alt"));
        assert_eq!(node(&nodes, "L").shape.as_deref(), Some("trapezoid"));
        assert_eq!(node(&nodes, "M").shape.as_deref(), Some("trapezoid_alt"));
        assert_eq!(node(&nodes, "N").shape.as_deref(), Some("doublecircle"));
        assert_eq!(node(&nodes, "N").label.as_deref(), Some("dbl"));
    }

    #[test]
    fn parses_link_types() {
        let cases = [
            ("A --> B", "solid", Some("arrow"), None),
            ("A --- B", "solid", None, None),
            ("A -.-> B", "dotted", Some("arrow"), None),
            ("A -.- B", "dotted", None, None),
            ("A ==> B", "thick", Some("arrow"), None),
            ("A === B", "thick", None, None),
            ("A ~~~ B", "invisible", None, None),
            ("A --o B", "solid", Some("circle"), None),
            ("A --x B", "solid", Some("cross"), None),
            ("A <--> B", "solid", Some("arrow"), Some("arrow")),
            ("A o--o B", "solid", Some("circle"), Some("circle")),
            ("A x--x B", "solid", Some("cross"), Some("cross")),
        ];
        for (src, line, head_end, head_start) in cases {
            let (_, edges) = parse(src);
            assert_eq!(edges.len(), 1, "one edge for `{src}`");
            let e = &edges[0];
            assert_eq!(e.source, "A");
            assert_eq!(e.target, "B");
            assert_eq!(e.line.as_deref(), Some(line), "line for `{src}`");
            assert_eq!(e.head_end.as_deref(), head_end, "head_end for `{src}`");
            assert_eq!(e.head_start.as_deref(), head_start, "head_start for `{src}`");
        }
    }

    #[test]
    fn parses_edge_labels_both_forms() {
        let (_, pipe) = parse("A -->|yes| B");
        assert_eq!(pipe[0].label.as_deref(), Some("yes"));
        let (_, middle) = parse("A -- maybe --> B");
        assert_eq!(middle[0].label.as_deref(), Some("maybe"));
        assert_eq!(middle[0].head_end.as_deref(), Some("arrow"));
        let (_, thick) = parse("A == heavy ==> B");
        assert_eq!(thick[0].label.as_deref(), Some("heavy"));
        assert_eq!(thick[0].line.as_deref(), Some("thick"));
    }

    #[test]
    fn parses_chaining_and_grouping() {
        let (nodes, edges) = parse("A --> B --> C");
        assert_eq!(edges.len(), 2);
        assert!(edges.iter().any(|e| e.source == "A" && e.target == "B"));
        assert!(edges.iter().any(|e| e.source == "B" && e.target == "C"));
        assert_eq!(nodes.len(), 3);

        let (_, grouped) = parse("A & B --> C & D");
        assert_eq!(grouped.len(), 4);
        for (s, t) in [("A", "C"), ("A", "D"), ("B", "C"), ("B", "D")] {
            assert!(grouped.iter().any(|e| e.source == s && e.target == t), "{s}->{t}");
        }
    }

    #[test]
    fn link_length_tracks_dashes() {
        let (_, short) = parse("A --> B");
        let (_, long) = parse("A ----> B");
        assert!(long[0].length.unwrap() > short[0].length.unwrap());
    }

    #[test]
    fn directives_round_trip_uid_and_position() {
        let src = "graph TD\nA[Start] --> B[End]\n\
            %% @node: A {\"uid\":\"n_1\",\"x\":100,\"y\":50}\n\
            %% @edge: e_1 {\"eid\":\"e_1\",\"source\":\"A\",\"target\":\"B\",\"label\":\"go\"}\n";
        let (nodes, edges) = parse(src);
        let a = node(&nodes, "A");
        assert_eq!(a.uid.as_deref(), Some("n_1"));
        assert_eq!(a.x, Some(100));
        assert_eq!(a.y, Some(50));
        assert_eq!(edges[0].eid.as_deref(), Some("e_1"));
        assert_eq!(edges[0].label.as_deref(), Some("go"));
    }

    #[test]
    fn edge_implicitly_declares_nodes() {
        let (nodes, _) = parse("graph TD\nA[Start] --> B[Process]\nB --> C[End]");
        assert_eq!(nodes.len(), 3);
        assert_eq!(node(&nodes, "A").label.as_deref(), Some("Start"));
        assert_eq!(node(&nodes, "C").label.as_deref(), Some("End"));
    }

    #[test]
    fn ignores_blank_and_header_lines() {
        let (nodes, edges) = parse("flowchart LR\n\n  A --> B\n");
        assert_eq!(nodes.len(), 2);
        assert_eq!(edges.len(), 1);
    }
}
