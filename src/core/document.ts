import * as vscode from 'vscode';

export function findOpenTextDocument(fileURI: vscode.Uri) {
  for (const document of vscode.workspace.textDocuments) {
    if (document.isClosed) {
      continue;
    }
    if (document.uri.scheme !== 'file') {
      continue;
    }
    if (document.uri.fsPath === fileURI.fsPath) {
      return document;
    }
  }

  return undefined;
}
