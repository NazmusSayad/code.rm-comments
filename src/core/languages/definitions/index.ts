import type { LanguageDefinition } from '../types';
import { cFamilyDefinitions } from './c-family';
import { functionalDefinitions } from './functional';
import { markupStyleDefinitions } from './markup-style';
import { otherDefinitions } from './other';
import { scriptingDefinitions } from './scripting';

export const languageDefinitions: LanguageDefinition[] = [
  ...cFamilyDefinitions,
  ...scriptingDefinitions,
  ...functionalDefinitions,
  ...markupStyleDefinitions,
  ...otherDefinitions
];
