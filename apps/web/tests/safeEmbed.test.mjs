import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeEmbedUrl } from '../src/utils/safeEmbed.ts';

test('youtube watch, short and embed URLs become nocookie embeds', () => {
  const expected = { provider: 'youtube', src: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' };
  assert.deepEqual(normalizeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10'), expected);
  assert.deepEqual(normalizeEmbedUrl('https://youtu.be/dQw4w9WgXcQ'), expected);
  assert.deepEqual(normalizeEmbedUrl('https://youtube.com/embed/dQw4w9WgXcQ'), expected);
  assert.deepEqual(normalizeEmbedUrl('https://youtube.com/shorts/dQw4w9WgXcQ'), expected);
});

test('youtube ids that could break out of the embed path are rejected', () => {
  assert.equal(normalizeEmbedUrl('https://youtube.com/watch?v=abc"onload="x'), null);
  assert.equal(normalizeEmbedUrl('https://youtube.com/watch?v=short'), null);
  assert.equal(normalizeEmbedUrl('https://youtube.com/watch'), null);
  assert.equal(normalizeEmbedUrl('https://youtube.com/channel/UCxxxxxxxxxxxx'), null);
});

test('vimeo numeric ids are embedded and non-numeric ids are rejected', () => {
  const expected = { provider: 'vimeo', src: 'https://player.vimeo.com/video/123456789' };
  assert.deepEqual(normalizeEmbedUrl('https://vimeo.com/123456789'), expected);
  assert.deepEqual(normalizeEmbedUrl('https://player.vimeo.com/video/123456789'), expected);
  assert.equal(normalizeEmbedUrl('https://vimeo.com/channels/staffpicks'), null);
  assert.equal(normalizeEmbedUrl('https://player.vimeo.com/video/12ab'), null);
});

test('figma design links are wrapped in the figma embed endpoint', () => {
  const share = 'https://www.figma.com/design/AbC123/My-File';
  const result = normalizeEmbedUrl(share);
  assert.equal(result.provider, 'figma');
  assert.equal(
    result.src,
    `https://www.figma.com/embed?embed_host=mermaidman&url=${encodeURIComponent(share)}`,
  );
  assert.equal(normalizeEmbedUrl('https://figma.com/embed?embed_host=x&url=y').provider, 'figma');
  assert.equal(normalizeEmbedUrl('https://figma.com/community/plugin/1'), null);
});

test('non-http schemes, credentials, empty input and garbage are rejected', () => {
  assert.equal(normalizeEmbedUrl(''), null);
  assert.equal(normalizeEmbedUrl('   '), null);
  assert.equal(normalizeEmbedUrl('not a url'), null);
  assert.equal(normalizeEmbedUrl('javascript:alert(1)'), null);
  assert.equal(normalizeEmbedUrl('data:text/html,<script>alert(1)</script>'), null);
  assert.equal(normalizeEmbedUrl('ftp://youtube.com/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(normalizeEmbedUrl('https://user:pass@youtube.com/watch?v=dQw4w9WgXcQ'), null);
});

test('look-alike hosts are rejected', () => {
  assert.equal(normalizeEmbedUrl('https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(normalizeEmbedUrl('https://notyoutube.com/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(normalizeEmbedUrl('https://vimeo.com.evil.example/123'), null);
  assert.equal(normalizeEmbedUrl('https://evil.example/figma.com/design/x'), null);
});
