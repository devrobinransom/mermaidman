import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  markdownContentForExport,
  mermaidContentForExport,
  selectActiveFile,
} from '../src/utils/exportCore.ts';

const files = {
  a: { id: 'a', content: 'graph TD\nA-->B' },
  b: { id: 'b', content: 'graph LR\nX-->Y' },
};

test('selectActiveFile returns the active file when it exists', () => {
  assert.equal(selectActiveFile(files, 'b'), files.b);
});

test('selectActiveFile falls back to the first file for null or unknown ids', () => {
  assert.equal(selectActiveFile(files, null), files.a);
  assert.equal(selectActiveFile(files, 'missing'), files.a);
});

test('selectActiveFile is undefined when there are no files', () => {
  assert.equal(selectActiveFile({}, 'a'), undefined);
});

test('mermaidContentForExport returns raw content, or empty string with no files', () => {
  assert.equal(mermaidContentForExport(files, 'b'), 'graph LR\nX-->Y');
  assert.equal(mermaidContentForExport({}, null), '');
});

test('markdownContentForExport wraps content in a mermaid fence, or is empty', () => {
  assert.equal(markdownContentForExport(files, 'a'), '```mermaid\ngraph TD\nA-->B\n```');
  assert.equal(markdownContentForExport({}, 'a'), '');
});
