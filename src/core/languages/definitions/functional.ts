import type { LanguageDefinition } from '../types';
import type { MutableLanguageConfig, LanguageResolverOptions } from '../types';

abstract class BaseLanguageDefinition implements LanguageDefinition {
  abstract ids: string[];
  abstract apply(config: MutableLanguageConfig, options: LanguageResolverOptions): void;
}

class RustLanguage extends BaseLanguageDefinition {
  ids = ['rust'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['/*', '/*', '*/']);
    config.commentDelimiters.push(['//']);
    config.stringDelimiters.push(['"']);
  }
}

class RacketLanguage extends BaseLanguageDefinition {
  ids = ['racket'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['#|', '#|', '|#']);
    config.commentDelimiters.push(['#!']);
    config.commentDelimiters.push([';']);
    config.stringDelimiters.push(['"']);
  }
}

class SchemeLanguage extends BaseLanguageDefinition {
  ids = ['scheme'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['#|', '#|', '|#']);
    config.commentDelimiters.push(['#!', '!#']);
    config.commentDelimiters.push([';']);
    config.stringDelimiters.push(['"']);
  }
}

class ClojureLanguage extends BaseLanguageDefinition {
  ids = ['clojure'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(["'"]);
    config.stringDelimiters.push(['"']);
    config.commentDelimiters.push([';']);
  }
}

class LispLanguage extends BaseLanguageDefinition {
  ids = ['lisp'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(['"']);
    config.commentDelimiters.push([';']);
  }
}

class FSharpLanguage extends BaseLanguageDefinition {
  ids = ['fsharp'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['//']);
    config.commentDelimiters.push(['(*', '*)']);
    config.stringDelimiters.push(['"']);
    config.stringDelimiters.push(['"""']);
  }
}

export const functionalDefinitions: LanguageDefinition[] = [
  new RustLanguage(),
  new RacketLanguage(),
  new SchemeLanguage(),
  new ClojureLanguage(),
  new LispLanguage(),
  new FSharpLanguage()
];
