import * as vscode from 'vscode';

import { range, regexpEscape } from '../utils';
import { ENCODING_MARKER, MULTI_LINE, SINGLE_LINE } from './constants';
import { isString } from './guards';
import { resolveLanguageConfig } from './languages/resolve-language-config';
import type {
  CommentDelimiter,
  KeepRegex,
  SectionBreak,
  SelectionSplitConfig,
  StringDelimiter
} from './types';

export class Parser {
  commentDelimiters: CommentDelimiter[];
  stringDelimiters: StringDelimiter[];
  singleLineComments: boolean;
  multiLineComments: boolean;
  prefix: string | undefined;
  supportedLanguage: boolean;
  commentLineRE: RegExp | undefined;
  indentComments: boolean;
  commentIndent: string | undefined;
  indentCommentContinuationLine: boolean;
  previousLineCommentLine: boolean;
  keepCommentLine: boolean;
  nestedBlockComment: boolean;
  blockCommentLevel: number;
  selectionSplit: SelectionSplitConfig | undefined;
  keepJSDocString: boolean;
  keepCommentRegex: KeepRegex[];
  extractStringsCB: (start: vscode.Position, end: vscode.Position) => void;
  blockCommentEndResult: RegExpExecArray | undefined;
  languageId: string;
  removeEmptyNBefore: number;
  removeEmptyNAfter: number;
  c99: boolean;

  constructor(
    languageID: string,
    comments: number,
    prefix: string | undefined,
    keepJSDocString: boolean,
    keepCommentRegex: KeepRegex[],
    extractStringsCB: (start: vscode.Position, end: vscode.Position) => void
  ) {
    this.commentDelimiters = [];
    this.stringDelimiters = [];
    this.singleLineComments = (comments & SINGLE_LINE) !== 0;
    this.multiLineComments = (comments & MULTI_LINE) !== 0;
    this.prefix = prefix;
    this.supportedLanguage = true;
    this.commentLineRE = undefined;
    this.indentComments = false;
    this.commentIndent = undefined;
    this.indentCommentContinuationLine = false;
    this.previousLineCommentLine = false;
    this.keepCommentLine = false;
    this.nestedBlockComment = false;
    this.blockCommentLevel = 0;
    this.selectionSplit = undefined;
    this.keepJSDocString = keepJSDocString;
    this.keepCommentRegex = keepCommentRegex;
    this.extractStringsCB = extractStringsCB;
    this.blockCommentEndResult = undefined;
    this.languageId = languageID;
    this.setDelimiter(languageID);
    this.removeEmptyNBefore = 0;
    this.removeEmptyNAfter = 0;
    this.c99 = false;
  }

  getIndent(text: string) {
    return text.replace(/(^[ \t]*).*/, '$1');
  }

  isCommentLine(text: string) {
    if (this.commentLineRE === undefined) {
      return false;
    }
    if (text.length === 0) {
      return false;
    }

    this.indentCommentContinuationLine = false;
    if (this.indentComments && this.previousLineCommentLine) {
      const lineIndent = this.getIndent(text);
      if (this.commentIndent && lineIndent.startsWith(this.commentIndent) && lineIndent.length > this.commentIndent.length) {
        this.indentCommentContinuationLine = true;
        return true;
      }
    }

    this.commentLineRE.lastIndex = 0;
    const result = this.commentLineRE.test(text);
    if (result) {
      this.commentIndent = this.getIndent(text);
    }

    return result;
  }

  findBlockCommentEnd(text: string, reEnd: RegExp) {
    let result: RegExpExecArray | null;
    while ((result = reEnd.exec(text)) !== null) {
      if (this.nestedBlockComment && result[1]) {
        this.blockCommentLevel++;
        continue;
      }
      if (result[2] !== undefined) {
        this.blockCommentLevel--;
        if (this.blockCommentLevel === 0) {
          this.nestedBlockComment = false;
          this.blockCommentEndResult = result;
          return true;
        }
      }
    }

    return false;
  }

  keepComment(document: vscode.TextDocument, range: vscode.Range, charIdxOpenDelim: number) {
    let text = '';
    if (range.start.line === range.end.line) {
      text += document.lineAt(range.start.line).text.substring(range.start.character, range.end.character);
    } else {
      text += document.lineAt(range.start.line).text.substring(range.start.character);
      for (let lineNr = range.start.line + 1; lineNr < range.end.line; ++lineNr) {
        text += '\t';
        text += document.lineAt(lineNr).text;
      }
      text += '\t';
      text += document.lineAt(range.end.line).text.substring(0, range.end.character);
    }

    if (this.prefix) {
      return !text.startsWith(this.prefix);
    }

    if (charIdxOpenDelim === 0 && this.isEncodingLine(text)) {
      return true;
    }

    for (const keepRegex of this.keepCommentRegex) {
      const regex = keepRegex.regex;
      if (!isString(regex) || regex.length === 0) {
        continue;
      }
      if (new RegExp(regex, keepRegex.flags).test(text)) {
        return true;
      }
    }

    return false;
  }

  *splitSelections(document: vscode.TextDocument, selections: readonly vscode.Selection[]) {
    let sectionBreaks: SectionBreak[] = [];
    if (this.selectionSplit !== undefined) {
      sectionBreaks = [{ offset: 0, languageId: this.selectionSplit.defaultLanguageId }];
      const text = document.getText();
      let offset = 0;
      while (true) {
        const section = this.selectionSplit.sections.reduce(
          (acc, config) => {
            const startRE = new RegExp(config.start, 'g');
            startRE.lastIndex = offset;
            const result = startRE.exec(text);
            if (result === null) {
              return acc;
            }
            if (acc.offset === undefined || result.index < acc.offset) {
              return { offset: result.index, result, config, startRE };
            }
            return acc;
          },
          {
            offset: undefined as number | undefined,
            result: undefined as RegExpExecArray | undefined,
            config: undefined as SelectionSplitConfig['sections'][number] | undefined,
            startRE: undefined as RegExp | undefined
          }
        );
        if (section.offset === undefined) {
          break;
        }

        const config = section.config;
        if (!config || !section.startRE || !section.result) {
          break;
        }

        let languageId = config.languageId.replace(/\$\{(\d+):\?([^:]+):([^}]+)\}/g, (_m, p1, p2, p3) => {
          return section.result?.[Number(p1)] !== undefined ? p2 : p3;
        });
        if (!languageId) {
          break;
        }

        offset = section.startRE.lastIndex;
        section.startRE.lastIndex = 0;
        languageId = section.result[0].replace(section.startRE, languageId);
        if (section.offset > sectionBreaks[sectionBreaks.length - 1].offset) {
          sectionBreaks.push({ offset: section.offset, languageId });
        } else {
          sectionBreaks[sectionBreaks.length - 1].languageId = languageId;
        }

        const stopRE = new RegExp(config.stop, 'g');
        stopRE.lastIndex = offset;
        const result = stopRE.exec(text);
        if (result !== null) {
          sectionBreaks.push({ offset: result.index, languageId: this.selectionSplit.defaultLanguageId });
          offset = stopRE.lastIndex;
        }
      }

      if (sectionBreaks[sectionBreaks.length - 1].offset !== text.length) {
        sectionBreaks.push({ offset: text.length, languageId: undefined });
      }
    }

    for (const selection of selections) {
      if (selection.isEmpty) {
        continue;
      }
      if (this.selectionSplit === undefined) {
        yield [selection, this.languageId] as const;
        continue;
      }

      const selectionStartOffset = document.offsetAt(selection.start);
      const selectionEndOffset = document.offsetAt(selection.end);
      for (let sectionNr = 1; sectionNr < sectionBreaks.length; ++sectionNr) {
        const languageId = sectionBreaks[sectionNr - 1].languageId;
        const sectionStartOffset = sectionBreaks[sectionNr - 1].offset;
        const sectionEndOffset = sectionBreaks[sectionNr].offset;
        if (sectionEndOffset <= selectionStartOffset || selectionEndOffset <= sectionStartOffset) {
          continue;
        }
        yield [
          new vscode.Selection(
            document.positionAt(Math.max(selectionStartOffset, sectionStartOffset)),
            document.positionAt(Math.min(selectionEndOffset, sectionEndOffset))
          ),
          languageId
        ] as const;
      }
    }
  }

  isEncodingLine(text: string) {
    text = text.trim();
    return text.startsWith(ENCODING_MARKER) && text.endsWith(ENCODING_MARKER);
  }

  setRemoveBlankLineCount(removeEmptyNBefore: number, removeEmptyNAfter: number) {
    this.removeEmptyNBefore = removeEmptyNBefore;
    this.removeEmptyNAfter = removeEmptyNAfter;
  }

  setC99(enable: boolean) {
    this.c99 = enable;
  }

  removeComments(editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    let selections = [...editor.selections];
    if (selections.length === 1 && selections[0].isEmpty) {
      selections = [
        new vscode.Selection(new vscode.Position(0, 0), editor.document.positionAt(editor.document.getText().length))
      ];
    }
    let insideComment = false;
    let insideCommentLanguageID = undefined;
    let removeRanges: vscode.Range[] = [];
    let reEnd = new RegExp('_');
    let rangeStart: vscode.Position | undefined = new vscode.Position(0, 0);
    let rangeCommentTextStart: vscode.Position | undefined = new vscode.Position(0, 0);
    const document = editor.document;

    for (const [selection, languageId] of this.splitSelections(document, selections)) {
      if (insideComment) {
        if (languageId !== insideCommentLanguageID) {
          continue;
        }
      } else {
        insideCommentLanguageID = undefined;
        removeRanges = [];
        reEnd = new RegExp('_');
        rangeStart = undefined;
        rangeCommentTextStart = undefined;
      }

      if (selection.isEmpty) {
        continue;
      }

      this.setDelimiter(languageId);
      const startLine = selection.start.line;
      const endLine = selection.end.line;
      let insideString = false;
      let charIdxOpenDelim = -1;
      this.previousLineCommentLine = false;
      this.commentIndent = undefined;
      this.keepCommentLine = false;

      loopLine:
      for (let lineNr = startLine; lineNr <= endLine; ++lineNr) {
        const line = document.lineAt(lineNr);
        let text = line.text;
        if (lineNr === 0 && text.startsWith('#!')) {
          continue loopLine;
        }

        let charStartIdx = 0;
        if (lineNr === endLine) {
          text = text.substring(0, selection.end.character);
          if (text === '') {
            continue loopLine;
          }
        }
        if (lineNr === startLine) {
          charStartIdx = selection.start.character;
        }

        if (insideString || insideComment) {
          reEnd.lastIndex = 0;
          if (insideString) {
            const result = reEnd.exec(text);
            if (result === null) {
              continue loopLine;
            }
            if (!rangeStart) {
              continue loopLine;
            }
            this.extractStringsCB(rangeStart, new vscode.Position(lineNr, reEnd.lastIndex));
          } else {
            if (!this.findBlockCommentEnd(text, reEnd)) {
              continue loopLine;
            }
            if (!rangeStart || !rangeCommentTextStart || !this.blockCommentEndResult) {
              continue loopLine;
            }
            if (
              this.multiLineComments &&
              !this.keepComment(
                document,
                new vscode.Range(rangeCommentTextStart, new vscode.Position(lineNr, this.blockCommentEndResult.index)),
                charIdxOpenDelim
              )
            ) {
              removeRanges.push(
                new vscode.Range(
                  rangeStart,
                  new vscode.Position(rangeStart.line, document.lineAt(rangeStart.line).text.length)
                )
              );
              if (rangeStart.line + 1 !== lineNr) {
                removeRanges.push(new vscode.Range(new vscode.Position(rangeStart.line + 1, 0), new vscode.Position(lineNr, 0)));
              }
              removeRanges.push(new vscode.Range(new vscode.Position(lineNr, 0), new vscode.Position(lineNr, reEnd.lastIndex)));
            }
          }
          rangeStart = undefined;
          rangeCommentTextStart = undefined;
          charIdxOpenDelim = -1;
          insideComment = false;
          insideCommentLanguageID = undefined;
          insideString = false;
          charStartIdx = reEnd.lastIndex;
        } else if (this.isCommentLine(text)) {
          if (!this.indentCommentContinuationLine) {
            this.keepCommentLine = this.keepComment(
              document,
              new vscode.Range(new vscode.Position(lineNr, this.commentLineRE!.lastIndex), new vscode.Position(lineNr, text.length)),
              0
            );
          }
          if (this.singleLineComments && !this.keepCommentLine) {
            removeRanges.push(new vscode.Range(new vscode.Position(lineNr, charStartIdx), new vscode.Position(lineNr, text.length)));
          }
          this.previousLineCommentLine = true;
          continue loopLine;
        }

        this.previousLineCommentLine = false;
        this.commentIndent = undefined;
        this.keepCommentLine = false;

        loopChar:
        for (let charIdx = charStartIdx; charIdx < text.length; ++charIdx) {
          for (const strDelim of this.stringDelimiters) {
            if (text.startsWith(strDelim[0], charIdx)) {
              if (strDelim[0] === '/**' && text.startsWith('/***', charIdx)) {
                break;
              }
              rangeStart = new vscode.Position(lineNr, charIdx);
              if (strDelim[1] === '\n') {
                this.extractStringsCB(rangeStart, new vscode.Position(lineNr, text.length));
                continue loopLine;
              }
              charIdx += strDelim[0].length;
              reEnd = new RegExp(`(\\\\.|.)*?${regexpEscape(strDelim[1] ? strDelim[1] : strDelim[0])}`, 'y');
              reEnd.lastIndex = charIdx;
              const result = reEnd.exec(text);
              if (result) {
                if (!rangeStart) {
                  continue loopLine;
                }
                this.extractStringsCB(rangeStart, new vscode.Position(lineNr, reEnd.lastIndex));
                charIdx = reEnd.lastIndex - 1;
                continue loopChar;
              }
              insideString = true;
              continue loopLine;
            }
          }

          for (const commDelim of this.commentDelimiters) {
            if (text.startsWith(commDelim[0], charIdx)) {
              charIdxOpenDelim = charIdx;
              rangeCommentTextStart = new vscode.Position(lineNr, charIdx + commDelim[0].length);
              let pos = charIdx;
              while (pos > 0 && text.charAt(pos - 1) <= ' ') {
                pos--;
              }
              rangeStart = new vscode.Position(lineNr, pos);
              charIdx += commDelim[0].length;

              if (commDelim[1] === undefined && commDelim[3] === undefined) {
                if (
                  this.singleLineComments &&
                  !this.keepComment(
                    document,
                    new vscode.Range(rangeCommentTextStart, new vscode.Position(lineNr, text.length)),
                    charIdxOpenDelim
                  )
                ) {
                  removeRanges.push(new vscode.Range(rangeStart, new vscode.Position(lineNr, text.length)));
                }
                continue loopLine;
              }

              let [openDelim, closeDelim] = [commDelim[0], commDelim[1] ?? commDelim[0]];
              if (commDelim[2]) {
                this.nestedBlockComment = true;
                [openDelim, closeDelim] = [commDelim[1] ?? commDelim[0], commDelim[2]];
              }
              if (commDelim[3]) {
                [openDelim, closeDelim] = [commDelim[0], commDelim[3]];
                reEnd = new RegExp(`(${regexpEscape(openDelim)})|(${closeDelim})`, 'g');
              } else {
                reEnd = new RegExp(`(${regexpEscape(openDelim)})|(${regexpEscape(closeDelim)})`, 'g');
              }
              reEnd.lastIndex = charIdx;
              this.blockCommentLevel = 1;
              if (!rangeCommentTextStart) {
                continue loopLine;
              }
              if (this.findBlockCommentEnd(text, reEnd)) {
                if (!this.blockCommentEndResult || !rangeStart) {
                  continue loopLine;
                }
                if (
                  this.singleLineComments &&
                  !this.keepComment(
                    document,
                    new vscode.Range(rangeCommentTextStart, new vscode.Position(lineNr, this.blockCommentEndResult.index)),
                    charIdxOpenDelim
                  )
                ) {
                  removeRanges.push(new vscode.Range(rangeStart, new vscode.Position(lineNr, reEnd.lastIndex)));
                }
                charIdx = reEnd.lastIndex - 1;
                continue loopChar;
              }
              insideComment = true;
              insideCommentLanguageID = languageId;
              continue loopLine;
            }
          }
        }
      }

      if (insideComment) {
        continue;
      }

      const emptyLineTestRE = new RegExp('^\\s*$');
      const linesMultilineBlockDeleted = new Set<number>();
      const linesDeletePending = new Map<number, vscode.Range>();
      const deleteEmptyLines = (lineNrs: number[], currentStartLine: number, currentLastLine: number) => {
        for (const lineNrDel of lineNrs) {
          if (lineNrDel < currentStartLine || lineNrDel > currentLastLine || linesDeletePending.has(lineNrDel)) {
            break;
          }
          const line = document.lineAt(lineNrDel);
          if (!emptyLineTestRE.test(line.text)) {
            break;
          }
          linesDeletePending.set(lineNrDel, line.rangeIncludingLineBreak);
        }
      };

      while (removeRanges.length > 0) {
        const firstRange = removeRanges.shift();
        if (!firstRange) {
          break;
        }
        const rangesThisLine = [firstRange];
        const lineNr = rangesThisLine[0].start.line;
        while (removeRanges.length > 0 && removeRanges[0].start.line === lineNr) {
          const nextRange = removeRanges.shift();
          if (!nextRange) {
            break;
          }
          rangesThisLine.push(nextRange);
        }

        if (rangesThisLine[0].end.line !== lineNr) {
          edit.delete(rangesThisLine[0]);
          range(rangesThisLine[0].start.line, rangesThisLine[0].end.line).forEach((value) => linesMultilineBlockDeleted.add(value));
          continue;
        }

        const line = document.lineAt(lineNr);
        if (
          emptyLineTestRE.test(
            rangesThisLine.reduceRight(
              (text, currentRange) => text.substring(0, currentRange.start.character) + text.substring(currentRange.end.character),
              line.text
            )
          )
        ) {
          edit.delete(line.rangeIncludingLineBreak);
          let lastLine = endLine;
          if (selection.end.character === 0) {
            lastLine -= 1;
          }
          deleteEmptyLines(range(lineNr - this.removeEmptyNBefore, lineNr).reverse(), startLine, lastLine);
          deleteEmptyLines(range(lineNr + 1, lineNr + this.removeEmptyNAfter + 1), startLine, lastLine);
          continue;
        }

        rangesThisLine.forEach((currentRange) => {
          edit.delete(currentRange);
        });
      }

      linesMultilineBlockDeleted.forEach((lineNumber) => linesDeletePending.delete(lineNumber));
      for (const pendingRange of linesDeletePending.values()) {
        edit.delete(pendingRange);
      }
    }
  }

  setDelimiter(languageID: string | undefined) {
    const languageConfig = resolveLanguageConfig(languageID, {
      keepJSDocString: this.keepJSDocString,
      c99: this.c99
    });

    this.supportedLanguage = languageConfig.supportedLanguage;
    this.commentDelimiters = languageConfig.commentDelimiters;
    this.stringDelimiters = languageConfig.stringDelimiters;
    this.commentLineRE = languageConfig.commentLineRE;
    this.indentComments = languageConfig.indentComments;
    this.selectionSplit = languageConfig.selectionSplit;

    return this.supportedLanguage;
  }
}
