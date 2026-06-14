/**
 * Markdown → messenger-text converters.
 *
 * Ported (converter half only) from the `messenger-send` skill's `messenger.mjs`.
 * The skill's *senders* (`sendTelegram`/`sendWhatsApp`) are deliberately omitted:
 * they need bot tokens + a recipient chat id and POST to Telegram/Meta, which is
 * impossible and unsafe in this static, no-backend client app. We keep only the
 * pure, browser-safe converters and add `toPlainText`.
 *
 * Write the order message ONCE in standard Markdown; render the right flavor per
 * destination:
 *   - `toWhatsAppText`  → `*bold*` / `_italic_` / ```mono```, `[l](u)` → `l (u)`
 *     (used in the `wa.me?text=` deep link — WhatsApp renders these markers).
 *   - `toPlainText`     → emphasis markers stripped (used in the `t.me?text=`
 *     deep link — Telegram drops the prefilled text into the compose box as a
 *     draft and does NOT auto-format `*bold*`, so it must be clean plain text).
 */

type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string }
  | { type: 'bold'; children: InlineToken[] }
  | { type: 'italic'; children: InlineToken[] }
  | { type: 'strike'; children: InlineToken[] }
  | { type: 'link'; text: string; url: string };

type Block =
  | { type: 'codeblock'; value: string }
  | { type: 'heading'; children: InlineToken[] }
  | { type: 'line'; children: InlineToken[] };

/** Inline tokenizer → flat/nested token list. Order matters: bold before italic. */
function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let buf = '';
  let i = 0;
  const flush = (): void => {
    if (buf) tokens.push({ type: 'text', value: buf });
    buf = '';
  };
  while (i < text.length) {
    // inline code: `...`
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        flush();
        tokens.push({ type: 'code', value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    // bold: ** ... ** or __ ... __
    if (text.startsWith('**', i) || text.startsWith('__', i)) {
      const marker = text.slice(i, i + 2);
      const end = text.indexOf(marker, i + 2);
      if (end !== -1 && end > i + 2) {
        flush();
        tokens.push({ type: 'bold', children: tokenizeInline(text.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }
    // strikethrough: ~~ ... ~~
    if (text.startsWith('~~', i)) {
      const end = text.indexOf('~~', i + 2);
      if (end !== -1 && end > i + 2) {
        flush();
        tokens.push({ type: 'strike', children: tokenizeInline(text.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }
    // italic: * ... * or _ ... _
    if (text[i] === '*' || text[i] === '_') {
      const marker = text[i];
      const end = text.indexOf(marker, i + 1);
      if (end !== -1 && end > i + 1) {
        flush();
        tokens.push({ type: 'italic', children: tokenizeInline(text.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }
    // link: [text](url)
    if (text[i] === '[') {
      const m = /^\[([^\]]*)\]\(([^)\s]+)\)/.exec(text.slice(i));
      if (m) {
        flush();
        tokens.push({ type: 'link', text: m[1], url: m[2] });
        i += m[0].length;
        continue;
      }
    }
    buf += text[i];
    i += 1;
  }
  flush();
  return tokens;
}

/** Block-level parse: fenced code, headings, and plain lines. */
function parseBlocks(md: string): Block[] {
  const lines = String(md).replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const fence = /^```(\w*)\s*$/.exec(lines[i]);
    if (fence) {
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1; // skip closing fence
      blocks.push({ type: 'codeblock', value: code.join('\n') });
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(lines[i]);
    if (heading) {
      blocks.push({ type: 'heading', children: tokenizeInline(heading[2]) });
      i += 1;
      continue;
    }
    blocks.push({ type: 'line', children: tokenizeInline(lines[i]) });
    i += 1;
  }
  return blocks;
}

// ── WhatsApp text renderer ──────────────────────────────────────────────────
// WhatsApp formatting: *bold*, _italic_, ~strike~, ```monospace```. No link
// markup — URLs auto-link, so a [label](url) becomes "label (url)". Symbols are
// literal; no escaping needed.

function renderWa(tokens: InlineToken[]): string {
  return tokens
    .map((t) => {
      switch (t.type) {
        case 'text':
          return t.value;
        case 'code':
          return '```' + t.value + '```';
        case 'bold':
          return '*' + renderWa(t.children) + '*';
        case 'italic':
          return '_' + renderWa(t.children) + '_';
        case 'strike':
          return '~' + renderWa(t.children) + '~';
        case 'link': {
          const label = renderWa(tokenizeInline(t.text));
          return label ? `${label} (${t.url})` : t.url;
        }
      }
    })
    .join('');
}

/** Convert standard Markdown → WhatsApp-flavored text. */
export function toWhatsAppText(md: string): string {
  return parseBlocks(md)
    .map((b) => {
      if (b.type === 'codeblock') return '```\n' + b.value + '\n```';
      if (b.type === 'heading') return '*' + renderWa(b.children) + '*';
      return renderWa(b.children);
    })
    .join('\n');
}

// ── Plain-text renderer ─────────────────────────────────────────────────────
// Strips every emphasis marker — for the clipboard copy a user pastes into a
// Telegram chat, which does not re-format pasted `*bold*`.

function renderPlain(tokens: InlineToken[]): string {
  return tokens
    .map((t) => {
      switch (t.type) {
        case 'text':
        case 'code':
          return t.value;
        case 'bold':
        case 'italic':
        case 'strike':
          return renderPlain(t.children);
        case 'link': {
          const label = renderPlain(tokenizeInline(t.text));
          return label ? `${label} (${t.url})` : t.url;
        }
      }
    })
    .join('');
}

/** Convert standard Markdown → plain text (no formatting markers). */
export function toPlainText(md: string): string {
  return parseBlocks(md)
    .map((b) => (b.type === 'codeblock' ? b.value : renderPlain(b.children)))
    .join('\n');
}
