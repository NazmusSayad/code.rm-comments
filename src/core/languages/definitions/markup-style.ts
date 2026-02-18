import type { LanguageDefinition } from '../types';
import type { MutableLanguageConfig, LanguageResolverOptions } from '../types';

abstract class BaseLanguageDefinition implements LanguageDefinition {
  abstract ids: string[];
  abstract apply(config: MutableLanguageConfig, options: LanguageResolverOptions): void;
}

class CfmlLanguage extends BaseLanguageDefinition {
  ids = ['cfml'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['//']);
    config.commentDelimiters.push(['/*', '*/']);
  }
}

class LessScssStylusLanguage extends BaseLanguageDefinition {
  ids = ['less', 'scss', 'stylus'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['//']);
    config.stringDelimiters.push(['"']);
    config.stringDelimiters.push(["'"]);
    config.commentDelimiters.push(['/*', '*/']);
  }
}

class CssLanguage extends BaseLanguageDefinition {
  ids = ['css', 'tailwindcss'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(['"']);
    config.stringDelimiters.push(["'"]);
    config.commentDelimiters.push(['/*', '*/']);
  }
}

class SassLanguage extends BaseLanguageDefinition {
  ids = ['sass'];

  apply(config: MutableLanguageConfig) {
    config.commentLineRE = new RegExp('^(//|/\\*)', 'g');
    config.indentComments = true;
    config.commentDelimiters.push(['//']);
    config.commentDelimiters.push(['/*', '*/']);
  }
}

class SvelteLanguage extends BaseLanguageDefinition {
  ids = ['svelte'];

  apply(config: MutableLanguageConfig) {
    config.selectionSplit = {
      defaultLanguageId: 'html',
      sections: [
        {
          start: '<script[^>]* lang="ts"[^>]*>',
          stop: '</script>',
          languageId: 'typescript'
        },
        {
          start: '<style[^>/]*>',
          stop: '</style>',
          languageId: 'css'
        },
        {
          start: '<script[^>]*>',
          stop: '</script>',
          languageId: 'javascript'
        }
      ]
    };
    config.commentDelimiters.push(['<!--', '-->']);
  }
}

class HtmlLanguage extends BaseLanguageDefinition {
  ids = ['html'];

  apply(config: MutableLanguageConfig) {
    config.selectionSplit = {
      defaultLanguageId: 'html',
      sections: [
        {
          start: '<style[^>/]*>',
          stop: '</style>',
          languageId: 'css'
        },
        {
          start: '<script[^>]*>',
          stop: '</script>',
          languageId: 'javascript'
        }
      ]
    };
    config.commentDelimiters.push(['<!--', '-->']);
  }
}

class XmlLanguage extends BaseLanguageDefinition {
  ids = ['xml'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['<!--', '-->']);
  }
}

class BladeLanguage extends BaseLanguageDefinition {
  ids = ['blade'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['{{--', '--}}']);
    config.commentDelimiters.push(['/*', '*/']);
    config.commentDelimiters.push(['//']);
    config.commentDelimiters.push(['#']);
    config.stringDelimiters.push(["'"]);
  }
}

class PhpLanguage extends BaseLanguageDefinition {
  ids = ['php'];

  apply(config: MutableLanguageConfig) {
    config.selectionSplit = {
      defaultLanguageId: 'unknown',
      sections: [
        {
          start: '<\\?php',
          stop: '\\?>',
          languageId: 'php'
        }
      ]
    };
    config.commentDelimiters.push(['/*', '*/']);
    config.commentDelimiters.push(['//']);
    config.commentDelimiters.push(['#']);
    config.stringDelimiters.push(["'"]);
  }
}

class JadePugLanguage extends BaseLanguageDefinition {
  ids = ['jade', 'pug'];

  apply(config: MutableLanguageConfig) {
    config.commentLineRE = new RegExp('^[ \t]*(//|//-)$', 'g');
    config.indentComments = true;
    config.commentDelimiters.push(['//']);
    config.commentDelimiters.push(['//-']);
    config.stringDelimiters.push(['"']);
    config.stringDelimiters.push(["'"]);
  }
}

class VueLanguage extends BaseLanguageDefinition {
  ids = ['vue'];

  apply(config: MutableLanguageConfig) {
    config.selectionSplit = {
      defaultLanguageId: 'html',
      sections: [
        {
          start: '<template( lang="([^"]+)")?>',
          stop: '</template>',
          languageId: '${2:?$2:html}'
        },
        {
          start: '<script[^>]*>',
          stop: '</script>',
          languageId: 'javascript'
        },
        {
          start: '<style( lang="([^"]+)")?>',
          stop: '</style>',
          languageId: '${2:?$2:css}'
        }
      ]
    };
  }
}

export const markupStyleDefinitions: LanguageDefinition[] = [
  new CfmlLanguage(),
  new LessScssStylusLanguage(),
  new CssLanguage(),
  new SassLanguage(),
  new SvelteLanguage(),
  new HtmlLanguage(),
  new XmlLanguage(),
  new BladeLanguage(),
  new PhpLanguage(),
  new JadePugLanguage(),
  new VueLanguage()
];
