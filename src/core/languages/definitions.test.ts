import { describe, expect, it } from 'vitest';

import { createLanguageConfig } from './types';
import { languageDefinitions } from './definitions';

describe('languageDefinitions', () => {
  it('contains unique language ids', () => {
    const ids = languageDefinitions.flatMap((definition) => definition.ids);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('applies delimiters for known languages', () => {
    const options = { keepJSDocString: true, c99: false };
    const languageMap = new Map(languageDefinitions.flatMap((definition) => definition.ids.map((id) => [id, definition])));

    const javascript = createLanguageConfig();
    languageMap.get('javascript')?.apply(javascript, options);
    expect(javascript.commentDelimiters).toContainEqual(['//']);
    expect(javascript.commentDelimiters).toContainEqual(['/*', '*/']);
    expect(javascript.stringDelimiters).toContainEqual(['`']);

    const python = createLanguageConfig();
    languageMap.get('python')?.apply(python, options);
    expect(python.commentDelimiters).toContainEqual(['#']);
    expect(python.stringDelimiters).toContainEqual(['"""']);

    const html = createLanguageConfig();
    languageMap.get('html')?.apply(html, options);
    expect(html.commentDelimiters).toContainEqual(['<!--', '-->']);
    expect(html.selectionSplit?.defaultLanguageId).toBe('html');
  });
});
