import type { CommentDelimiter, SelectionSplitConfig, StringDelimiter } from '../types';

export type LanguageResolverOptions = {
  keepJSDocString: boolean;
  c99: boolean;
};

export type MutableLanguageConfig = {
  commentDelimiters: CommentDelimiter[];
  stringDelimiters: StringDelimiter[];
  commentLineRE: RegExp | undefined;
  indentComments: boolean;
  selectionSplit: SelectionSplitConfig | undefined;
};

export type ResolvedLanguageConfig = MutableLanguageConfig & {
  supportedLanguage: boolean;
};

export type LanguageDefinition = {
  ids: string[];
  apply: (config: MutableLanguageConfig, options: LanguageResolverOptions) => void;
};

export function createLanguageConfig(): MutableLanguageConfig {
  return {
    commentDelimiters: [],
    stringDelimiters: [],
    commentLineRE: undefined,
    indentComments: false,
    selectionSplit: undefined
  };
}
