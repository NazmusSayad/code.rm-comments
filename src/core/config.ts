import * as vscode from 'vscode';

import { CONFIG_NAMESPACE } from './constants';
import { isRecord, isString } from './guards';
import type { KeepRegex } from './types';

export const getExtensionConfig = () => vscode.workspace.getConfiguration(CONFIG_NAMESPACE, null);

export function collectKeepRegexes(keepConfig: unknown, languageId: string) {
  const keepRegexes: KeepRegex[] = [];
  if (keepConfig === false || !isRecord(keepConfig)) {
    return keepRegexes;
  }

  for (const [configuredLanguageIds, configuredRegexes] of Object.entries(keepConfig)) {
    const appliesToLanguage = configuredLanguageIds
      .split(',')
      .some((candidateLanguageId) => candidateLanguageId === 'all' || candidateLanguageId === languageId);

    if (!appliesToLanguage || !isRecord(configuredRegexes)) {
      continue;
    }

    for (const configuredRegex of Object.values(configuredRegexes)) {
      if (!isRecord(configuredRegex)) {
        continue;
      }
      const regex = isString(configuredRegex.regex) ? configuredRegex.regex : undefined;
      if (!regex || regex.length === 0) {
        continue;
      }

      keepRegexes.push({
        regex,
        flags: isString(configuredRegex.flags) ? configuredRegex.flags : undefined
      });
    }
  }

  return keepRegexes;
}
