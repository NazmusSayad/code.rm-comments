import { languageDefinitions } from './definitions';
import { createLanguageConfig, type LanguageResolverOptions } from './types';

export function resolveLanguageConfig(languageIdInput: string | undefined, options: LanguageResolverOptions) {
  const languageId = (languageIdInput ?? 'unknown').toLowerCase();
  const languageConfig = createLanguageConfig();

  if (languageId === 'unknown') {
    return {
      ...languageConfig,
      supportedLanguage: true
    };
  }

  const definition = languageDefinitions.find((entry) => entry.ids.includes(languageId));
  if (definition) {
    definition.apply(languageConfig, options);
    return {
      ...languageConfig,
      supportedLanguage: true
    };
  }

  return {
    ...languageConfig,
    supportedLanguage: false
  };
}
