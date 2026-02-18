export const SINGLE_LINE = 1;
export const MULTI_LINE = 2;
export const ENCODING_MARKER = '-*-';
export const CONFIG_NAMESPACE = 'rm-comments';

export const COMMAND_IDS = {
  extractStrings: 'rm-comments.extractStrings',
  ignoreKeepCommentSetting: 'rm-comments.ignoreKeepCommentSetting',
  markJSDocStringAsComment: 'rm-comments.markJSDocStringAsComment',
  removeAllComments: 'rm-comments.removeAllComments',
  removeAllCommentsWithPrefix: 'rm-comments.removeAllCommentsWithPrefix',
  removeSingleLineComments: 'rm-comments.removeSingleLineComments',
  removeMultilineComments: 'rm-comments.removeMultilineComments'
} as const;
