import type { LanguageDefinition } from '../types';
import type { MutableLanguageConfig, LanguageResolverOptions } from '../types';

abstract class BaseLanguageDefinition implements LanguageDefinition {
  abstract ids: string[];
  abstract apply(config: MutableLanguageConfig, options: LanguageResolverOptions): void;
}

class LatexLanguage extends BaseLanguageDefinition {
  ids = ['latex'];

  apply(config: MutableLanguageConfig) {
    config.commentLineRE = new RegExp('^%', 'g');
  }
}

class GroovyLanguage extends BaseLanguageDefinition {
  ids = ['groovy'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(['"""']);
    config.stringDelimiters.push(["'''"]);
    config.commentDelimiters.push(['/*', '*/']);
    config.stringDelimiters.push(['"']);
    config.stringDelimiters.push(["'"]);
    config.commentDelimiters.push(['//']);
  }
}

class AlLanguage extends BaseLanguageDefinition {
  ids = ['al'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(['"']);
    config.stringDelimiters.push(["'"]);
    config.commentDelimiters.push(['//']);
  }
}

class VhdlLanguage extends BaseLanguageDefinition {
  ids = ['vhdl'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['/*', '*/']);
    config.stringDelimiters.push(['"']);
    config.commentDelimiters.push(['--']);
  }
}

class AdaHaskellLanguage extends BaseLanguageDefinition {
  ids = ['ada', 'haskell'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(['"']);
    config.commentDelimiters.push(['--']);
  }
}

class SqlLanguage extends BaseLanguageDefinition {
  ids = ['sql'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(['"']);
    config.stringDelimiters.push(["'"]);
    config.commentDelimiters.push(['--']);
    config.commentDelimiters.push(['/*', '*/']);
  }
}

class PlSqlSparkLanguage extends BaseLanguageDefinition {
  ids = ['plsql', 'spark'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(["'"]);
    config.commentDelimiters.push(['--']);
    config.commentDelimiters.push(['/*', '*/']);
  }
}

class PascalLanguage extends BaseLanguageDefinition {
  ids = ['pascal', 'objectpascal'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['//']);
    config.commentDelimiters.push(['(*', '*)']);
    config.commentDelimiters.push(['{', '}']);
    config.stringDelimiters.push(["'"]);
  }
}

class CobolLanguage extends BaseLanguageDefinition {
  ids = ['acucobol', 'opencobol', 'bitlang-cobol', 'cobol'];

  apply(config: MutableLanguageConfig) {
    config.commentLineRE = new RegExp('^......[*/]', 'g');
  }
}

export const otherDefinitions: LanguageDefinition[] = [
  new LatexLanguage(),
  new GroovyLanguage(),
  new AlLanguage(),
  new VhdlLanguage(),
  new AdaHaskellLanguage(),
  new SqlLanguage(),
  new PlSqlSparkLanguage(),
  new PascalLanguage(),
  new CobolLanguage()
];
