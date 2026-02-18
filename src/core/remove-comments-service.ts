import * as vscode from 'vscode';

import { collectKeepRegexes, getExtensionConfig } from './config';
import { findOpenTextDocument } from './document';
import { isRecord, isString } from './guards';
import { Parser } from './parser';
import type { ExtractedStringRange } from './types';

export class RemoveCommentsService {
  private keepJSDocString = true;
  private useKeepCommentSetting = true;
  private extractStrings = false;
  private extractedStrings: ExtractedStringRange[] = [];

  removeComments(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, comments: number, prefix?: string) {
    const documentLanguageId = editor.document.languageId;
    const config = getExtensionConfig();
    const keepConfig = config.get<unknown>('keep');
    const keepCommentRegex = this.useKeepCommentSetting ? collectKeepRegexes(keepConfig, documentLanguageId) : [];

    let extractStringsCB = (_startPosition: vscode.Position, _endPosition: vscode.Position) => {};
    if (this.extractStrings) {
      extractStringsCB = (startPosition: vscode.Position, endPosition: vscode.Position) => {
        this.extractedStrings.push([startPosition, endPosition]);
      };
    }

    const parser = new Parser(
      documentLanguageId,
      comments,
      prefix,
      this.keepJSDocString,
      keepCommentRegex,
      extractStringsCB
    );
    if (!parser.supportedLanguage) {
      vscode.window.showInformationMessage(`Cannot remove comments: unknown language (${documentLanguageId})`);
      this.resetTransientState();
      return;
    }

    parser.setRemoveBlankLineCount(config.get('removeBlankLines.before', 0), config.get('removeBlankLines.after', 0));
    parser.setC99(config.get('c99', false));
    parser.removeComments(editor, edit);

    if (this.extractedStrings.length > 0) {
      this.saveExtractedStrings(editor);
    }

    this.resetTransientState();
  }

  async removeAllCommentsWithPrefix(editor: vscode.TextEditor, args: unknown, comments: number) {
    let prefix: string | undefined;
    if (isRecord(args) && isString(args.prefix)) {
      prefix = args.prefix;
    } else {
      prefix = await vscode.window.showInputBox({ title: 'Comment Prefix' });
    }

    if (prefix === undefined || prefix.length === 0) {
      return;
    }

    editor.edit((editBuilder) => {
      this.removeComments(editor, editBuilder, comments, prefix);
    });
  }

  markJSDocStringAsComment() {
    this.keepJSDocString = false;
  }

  ignoreKeepCommentSetting() {
    this.useKeepCommentSetting = false;
  }

  extractEditorStrings(editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    this.extractStrings = true;
    this.removeComments(editor, edit, 0);
  }

  private saveExtractedStrings(editor: vscode.TextEditor) {
    const config = getExtensionConfig();
    const stringsFilePath = config.get<string>('extractStrings.filePath');
    const lineJoin = config.get('extractStrings.lineJoin', '@@@@');

    if (!stringsFilePath) {
      vscode.window.showErrorMessage('Setting rm-comments.extractStrings.filePath is not defined');
      return;
    }

    const stringsFileURI = vscode.Uri.file(stringsFilePath);
    const stringsDocument = findOpenTextDocument(stringsFileURI);
    if (!stringsDocument) {
      vscode.window
        .showErrorMessage(`Please visit file, and keep tab: ${stringsFileURI.fsPath}`, 'Open file')
        .then((result) => {
          if (!result) {
            return;
          }
          vscode.commands.executeCommand('vscode.open', stringsFileURI);
        });
      return;
    }

    const document = editor.document;
    const fileBasename = document.uri.path.replace(/^.*\//, '');
    let strings = '';
    const newlineRE = new RegExp(/\r?\n/g);
    for (const textRange of this.extractedStrings) {
      let text = document.getText(new vscode.Range(textRange[0], textRange[1]));
      text = text.replace(newlineRE, lineJoin);
      strings += `${fileBasename}::${textRange[0].line + 1}:${textRange[0].character + 1} ${text}\n`;
    }

    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.insert(stringsFileURI, new vscode.Position(stringsDocument.lineCount - 1, 0), strings);
    vscode.workspace.applyEdit(workspaceEdit);
  }

  private resetTransientState() {
    this.keepJSDocString = true;
    this.useKeepCommentSetting = true;
    this.extractStrings = false;
    this.extractedStrings = [];
  }
}
