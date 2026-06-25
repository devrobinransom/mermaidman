//! Mermaid topology parsing (nodes and edges from flowchart syntax).

use crate::{Error, Result};
use nom::{
    branch::alt,
    bytes::complete::{tag, take_until},
    character::complete::{alphanumeric1, char, space0},
    combinator::{opt, recognize},
    sequence::{delimited, pair},
    IResult,
};

/// Parse mermaid topology, returning (nodes, edges).
/// Nodes: Vec<(mermaid_id, Option<label>)>
/// Edges: Vec<(source_id, target_id, Option<label>)>
pub fn parse_mermaid_topology(
    input: &str,
) -> Result<(Vec<(String, Option<String>)>, Vec<(String, String, Option<String>)>)> {
    let mut nodes = Vec::new();
    let mut edges = Vec::new();
    let mut seen_nodes = std::collections::HashSet::new();

    for line in input.lines() {
        let trimmed = line.trim();
        
        // Skip empty lines, comments, and graph declarations
        if trimmed.is_empty() 
            || trimmed.starts_with("%%") 
            || trimmed.starts_with("graph ")
            || trimmed.starts_with("flowchart ")
            || trimmed.starts_with("subgraph ")
            || trimmed == "end"
        {
            continue;
        }

        // Try to parse as edge first
        if let Ok((_, edge_data)) = parse_edge_line(trimmed) {
            let (src_id, src_label, tgt_id, tgt_label, edge_label) = edge_data;
            
            // Add source node if not seen
            if !seen_nodes.contains(&src_id) {
                seen_nodes.insert(src_id.clone());
                nodes.push((src_id.clone(), src_label));
            }
            
            // Add target node if not seen
            if !seen_nodes.contains(&tgt_id) {
                seen_nodes.insert(tgt_id.clone());
                nodes.push((tgt_id.clone(), tgt_label));
            }
            
            edges.push((src_id, tgt_id, edge_label));
            continue;
        }

        // Try to parse as node declaration
        if let Ok((_, (id, label))) = parse_node_declaration(trimmed) {
            if !seen_nodes.contains(&id) {
                seen_nodes.insert(id.clone());
                nodes.push((id, label));
            }
        }
    }

    Ok((nodes, edges))
}

/// Parse a node declaration: `A[Label]` or `A((Label))` or `A{Label}` etc.
fn parse_node_declaration(input: &str) -> IResult<&str, (String, Option<String>)> {
    let (input, id) = parse_node_id(input)?;
    let (input, label) = opt(alt((
        delimited(tag("["), take_until("]"), tag("]")),
        delimited(tag("(("), take_until("))"), tag("))")),
        delimited(tag("(["), take_until("])"), tag("])")),
        delimited(tag("("), take_until(")"), tag(")")),
        delimited(tag("{"), take_until("}"), tag("}")),
        delimited(tag("{{"), take_until("}}"), tag("}}")),
        delimited(tag(">"), take_until("]"), tag("]")),
        delimited(tag("[/"), take_until("/]"), tag("/]")),
        delimited(tag("[\\"), take_until("\\]"), tag("\\]")),
    )))(input)?;

    Ok((input, (id.to_string(), label.map(|s| s.to_string()))))
}

/// Parse a node ID (alphanumeric + underscore).
fn parse_node_id(input: &str) -> IResult<&str, &str> {
    recognize(pair(
        alt((alphanumeric1, tag("_"))),
        nom::multi::many0(alt((alphanumeric1, tag("_")))),
    ))(input)
}

/// Parse an edge line: `A --> B` or `A[Label] --> B[Label]` etc.
fn parse_edge_line(
    input: &str,
) -> IResult<&str, (String, Option<String>, String, Option<String>, Option<String>)> {
    let (input, (src_id, src_label)) = parse_node_declaration(input)?;
    let (input, _) = space0(input)?;

    // Parse arrow with optional label
    let (input, edge_label) = parse_arrow_with_label(input)?;
    let (input, _) = space0(input)?;

    let (input, (tgt_id, tgt_label)) = parse_node_declaration(input)?;

    Ok((input, (src_id, src_label, tgt_id, tgt_label, edge_label)))
}

/// Parse arrow types with optional labels.
fn parse_arrow_with_label(input: &str) -> IResult<&str, Option<String>> {
    // Arrow with label: --|text|-->
    if let Ok((rest, _)) = tag::<&str, &str, nom::error::Error<&str>>("--")(input) {
        if let Ok((rest, label)) = delimited(
            char::<&str, nom::error::Error<&str>>('|'),
            take_until("|"),
            char('|'),
        )(rest)
        {
            if let Ok((rest, _)) = tag::<&str, &str, nom::error::Error<&str>>("-->")(rest) {
                return Ok((rest, Some(label.to_string())));
            }
        }
    }

    // Simple arrows (no label)
    let arrows = [
        "-->", "---", "-.-", "-.->", "==>", "==",
        "-.->", "~~>", "--o", "--x", "<-->", "o--o",
    ];

    for arrow in arrows {
        if let Ok((rest, _)) = tag::<&str, &str, nom::error::Error<&str>>(arrow)(input) {
            return Ok((rest, None));
        }
    }

    Err(nom::Err::Error(nom::error::Error::new(
        input,
        nom::error::ErrorKind::Tag,
    )))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_topology() {
        let input = r#"graph TD
A[Start] --> B[End]"#;
        
        let (nodes, edges) = parse_mermaid_topology(input).unwrap();
        
        assert_eq!(nodes.len(), 2);
        assert_eq!(nodes[0], ("A".to_string(), Some("Start".to_string())));
        assert_eq!(nodes[1], ("B".to_string(), Some("End".to_string())));
        
        assert_eq!(edges.len(), 1);
        assert_eq!(edges[0].0, "A");
        assert_eq!(edges[0].1, "B");
    }

    #[test]
    fn test_parse_node_shapes() {
        let input = r#"graph LR
A[Rectangle]
B((Circle))
C{Diamond}
D([Stadium])
E>Asymmetric]"#;
        
        let (nodes, _) = parse_mermaid_topology(input).unwrap();
        
        assert_eq!(nodes.len(), 5);
        assert_eq!(nodes[0].1, Some("Rectangle".to_string()));
        assert_eq!(nodes[1].1, Some("Circle".to_string()));
        assert_eq!(nodes[2].1, Some("Diamond".to_string()));
    }

    #[test]
    fn test_parse_edge_with_label() {
        let input = r#"graph TD
A --|yes|--> B"#;
        
        let (_, edges) = parse_mermaid_topology(input).unwrap();
        
        assert_eq!(edges.len(), 1);
        assert_eq!(edges[0].2, Some("yes".to_string()));
    }
}
