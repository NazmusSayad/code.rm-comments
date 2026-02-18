import * as vscode from 'vscode';

import { COMMAND_IDS, MULTI_LINE, SINGLE_LINE } from './core/constants';
import { RemoveCommentsService } from './core/remove-comments-service';

export function activate(context: vscode.ExtensionContext) {
  const removeCommentsService = new RemoveCommentsService();

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(COMMAND_IDS.removeAllComments, (editor, edit) => {
      removeCommentsService.removeComments(editor, edit, SINGLE_LINE | MULTI_LINE);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(COMMAND_IDS.removeAllCommentsWithPrefix, async (editor, _edit, args) => {
      await removeCommentsService.removeAllCommentsWithPrefix(editor, args, SINGLE_LINE | MULTI_LINE);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(COMMAND_IDS.removeSingleLineComments, (editor, edit) => {
      removeCommentsService.removeComments(editor, edit, SINGLE_LINE);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(COMMAND_IDS.removeMultilineComments, (editor, edit) => {
      removeCommentsService.removeComments(editor, edit, MULTI_LINE);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(COMMAND_IDS.markJSDocStringAsComment, () => {
      removeCommentsService.markJSDocStringAsComment();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(COMMAND_IDS.ignoreKeepCommentSetting, () => {
      removeCommentsService.ignoreKeepCommentSetting();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(COMMAND_IDS.extractStrings, (editor, edit) => {
      removeCommentsService.extractEditorStrings(editor, edit);
    })
  );
}

export function deactivate() {}
