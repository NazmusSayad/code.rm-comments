import { describe, expect, it } from 'vitest';

import { resolveLanguageConfig } from './resolve-language-config';

describe('resolveLanguageConfig', () => {
  it('keeps unknown as supported', () => {
    const languageConfig = resolveLanguageConfig('unknown', {
      keepJSDocString: true,
      c99: false
    });

    expect(languageConfig.supportedLanguage).toBe(true);
  });

  it('builds JavaScript React delimiters with JSDoc support', () => {
    const languageConfig = resolveLanguageConfig('javascriptreact', {
      keepJSDocString: true,
      c99: false
    });

    expect(languageConfig.commentDelimiters).toContainEqual(['{/*', '*/}']);
    expect(languageConfig.commentDelimiters).toContainEqual(['/*', '*/']);
    expect(languageConfig.commentDelimiters).toContainEqual(['//']);
    expect(languageConfig.stringDelimiters).toContainEqual(['/**', '*/']);
    expect(languageConfig.stringDelimiters).toContainEqual(['`']);
    expect(languageConfig.stringDelimiters).toContainEqual(["'"]);
    expect(languageConfig.stringDelimiters).toContainEqual(['"']);
  });

  it('respects C99 flag for C language', () => {
    const withoutC99 = resolveLanguageConfig('c', {
      keepJSDocString: false,
      c99: false
    });
    const withC99 = resolveLanguageConfig('c', {
      keepJSDocString: false,
      c99: true
    });

    expect(withoutC99.commentDelimiters).toEqual([['/*', '*/']]);
    expect(withC99.commentDelimiters).toEqual([
      ['/*', '*/'],
      ['//']
    ]);
  });

  it('uses section split for svelte and keeps xml comments', () => {
    const languageConfig = resolveLanguageConfig('svelte', {
      keepJSDocString: false,
      c99: false
    });

    expect(languageConfig.selectionSplit?.sections[0]).toEqual({
      start: '<script[^>]* lang="ts"[^>]*>',
      stop: '</script>',
      languageId: 'typescript'
    });
    expect(languageConfig.commentDelimiters).toContainEqual(['<!--', '-->']);
  });

  it('marks unsupported language as unsupported', () => {
    const languageConfig = resolveLanguageConfig('madeup-language', {
      keepJSDocString: false,
      c99: false
    });

    expect(languageConfig.supportedLanguage).toBe(false);
  });
});
