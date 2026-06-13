import { describe, expect, it } from 'vitest';
import { toPlainText, toWhatsAppText } from './messenger';

describe('toWhatsAppText', () => {
  it('maps bold/italic/strike/code to WhatsApp markers', () => {
    expect(toWhatsAppText('**bold**')).toBe('*bold*');
    expect(toWhatsAppText('__bold__')).toBe('*bold*');
    expect(toWhatsAppText('*italic*')).toBe('_italic_');
    expect(toWhatsAppText('_italic_')).toBe('_italic_');
    expect(toWhatsAppText('~~gone~~')).toBe('~gone~');
    expect(toWhatsAppText('`code`')).toBe('```code```');
  });

  it('renders a heading as a bold line', () => {
    expect(toWhatsAppText('# Order')).toBe('*Order*');
  });

  it('flattens a link to "label (url)"', () => {
    expect(toWhatsAppText('[shop](https://x.co)')).toBe('shop (https://x.co)');
  });

  it('keeps multi-line structure', () => {
    expect(toWhatsAppText('# Order\n**Total: E£10**')).toBe('*Order*\n*Total: E£10*');
  });
});

describe('toPlainText', () => {
  it('strips every emphasis marker', () => {
    expect(toPlainText('**bold** and *italic* and ~~gone~~')).toBe('bold and italic and gone');
    expect(toPlainText('`code`')).toBe('code');
    expect(toPlainText('# Order')).toBe('Order');
  });

  it('flattens a link to "label (url)"', () => {
    expect(toPlainText('[shop](https://x.co)')).toBe('shop (https://x.co)');
  });
});
