import * as vscode from 'vscode';

export type KeepRegex = { regex?: string; flags?: string };
export type CommentDelimiter = [string, string?, string?, string?];
export type StringDelimiter = [string, string?];

export type SelectionSplitSection = {
  start: string;
  stop: string;
  languageId: string;
};

export type SelectionSplitConfig = {
  defaultLanguageId: string;
  sections: SelectionSplitSection[];
};

export type SectionBreak = { offset: number; languageId: string | undefined };

export type ExtractedStringRange = [vscode.Position, vscode.Position];
