import type { LanguageDefinition } from '../types';
import type { MutableLanguageConfig, LanguageResolverOptions } from '../types';

abstract class BaseLanguageDefinition implements LanguageDefinition {
  abstract ids: string[];
  abstract apply(config: MutableLanguageConfig, options: LanguageResolverOptions): void;

  protected applySlashCommentLanguage(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['/*', '*/']);
    config.commentDelimiters.push(['//']);
    config.stringDelimiters.push(['"']);
  }

  protected applyJavaScriptLanguage(config: MutableLanguageConfig, keepJSDocString: boolean) {
    if (keepJSDocString) {
      config.stringDelimiters.push(['/**', '*/']);
    }
    config.stringDelimiters.push(['`']);
    config.stringDelimiters.push(["'"]);
    this.applySlashCommentLanguage(config);
  }
}

class JavaScriptReactLanguage extends BaseLanguageDefinition {
  ids = ['javascriptreact', 'typescriptreact'];

  apply(config: MutableLanguageConfig, options: LanguageResolverOptions) {
    config.commentDelimiters.push(['{/*', '*/}']);
    this.applyJavaScriptLanguage(config, options.keepJSDocString);
  }
}

class JavaScriptLanguage extends BaseLanguageDefinition {
  ids = ['javascript', 'typescript'];

  apply(config: MutableLanguageConfig, options: LanguageResolverOptions) {
    this.applyJavaScriptLanguage(config, options.keepJSDocString);
  }
}

class DartHaxeLanguage extends BaseLanguageDefinition {
  ids = ['dart', 'haxe'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(["'"]);
    this.applySlashCommentLanguage(config);
  }
}

class GoLanguage extends BaseLanguageDefinition {
  ids = ['go'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(['`']);
    this.applySlashCommentLanguage(config);
  }
}

class DefaultSlashCommentLanguage extends BaseLanguageDefinition {
  ids = [
    'cpp',
    'csharp',
    'objective-c',
    'objective-cpp',
    'java',
    'kotlin',
    'scala',
    'shaderlab',
    'solidity',
    'swift',
    'verilog',
    'systemverilog',
    'jsonc'
  ];

  apply(config: MutableLanguageConfig) {
    this.applySlashCommentLanguage(config);
  }
}

class CLanguage extends BaseLanguageDefinition {
  ids = ['c'];

  apply(config: MutableLanguageConfig, options: LanguageResolverOptions) {
    config.commentDelimiters.push(['/*', '*/']);
    if (options.c99) {
      config.commentDelimiters.push(['//']);
    }
    config.stringDelimiters.push(['"']);
  }
}

export const cFamilyDefinitions: LanguageDefinition[] = [
  new JavaScriptReactLanguage(),
  new JavaScriptLanguage(),
  new DartHaxeLanguage(),
  new GoLanguage(),
  new DefaultSlashCommentLanguage(),
  new CLanguage()
];
