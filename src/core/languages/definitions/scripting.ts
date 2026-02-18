import type { LanguageDefinition } from '../types';
import type { MutableLanguageConfig, LanguageResolverOptions } from '../types';

abstract class BaseLanguageDefinition implements LanguageDefinition {
  abstract ids: string[];
  abstract apply(config: MutableLanguageConfig, options: LanguageResolverOptions): void;
}

class PythonTomlLanguage extends BaseLanguageDefinition {
  ids = ['python', 'toml'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(["'''"]);
    config.stringDelimiters.push(['"""']);
    config.stringDelimiters.push(["'"]);
    config.stringDelimiters.push(['"']);
    config.commentDelimiters.push(['#']);
  }
}

class LmpsLanguage extends BaseLanguageDefinition {
  ids = ['lmps'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(['"""']);
    config.stringDelimiters.push(["'"]);
    config.stringDelimiters.push(['"']);
    config.commentDelimiters.push(['#', undefined, undefined, '(?<!&)$']);
  }
}

class YamlLanguage extends BaseLanguageDefinition {
  ids = ['yaml'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(["'"]);
    config.stringDelimiters.push(['"']);
    config.commentDelimiters.push(['#']);
  }
}

class UiuaRLanguage extends BaseLanguageDefinition {
  ids = ['uiua', 'r'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(['"']);
    config.commentDelimiters.push(['#']);
  }
}

class ShellScriptLanguage extends BaseLanguageDefinition {
  ids = ['shellscript'];

  apply(config: MutableLanguageConfig) {
    config.commentLineRE = new RegExp('^[ \t]*#', 'g');
  }
}

class ElixirLanguage extends BaseLanguageDefinition {
  ids = ['elixir'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(['@moduledoc """', '"""']);
    config.stringDelimiters.push(['@doc """', '"""']);
    config.stringDelimiters.push(['"']);
    config.commentDelimiters.push(['#']);
  }
}

class GraphqlLanguage extends BaseLanguageDefinition {
  ids = ['graphql'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(['"""']);
    config.stringDelimiters.push(['"']);
    config.commentDelimiters.push(['#']);
  }
}

class JuliaLanguage extends BaseLanguageDefinition {
  ids = ['julia'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['#=', '=#']);
    config.commentDelimiters.push(['#']);
    config.stringDelimiters.push(['"']);
  }
}

class ErlangLanguage extends BaseLanguageDefinition {
  ids = ['erlang'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['%']);
    config.stringDelimiters.push(['"']);
  }
}

class DockerfileLanguage extends BaseLanguageDefinition {
  ids = ['dockerfile'];

  apply(config: MutableLanguageConfig) {
    config.commentLineRE = new RegExp('^#(?!\\s*(syntax|escape)\\s*=)', 'ig');
  }
}

class LuaLanguage extends BaseLanguageDefinition {
  ids = ['lua'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['--[[', ']]']);
    config.commentDelimiters.push(['--']);
    config.stringDelimiters.push(['"']);
    config.stringDelimiters.push(["'"]);
  }
}

class HashCommentLanguage extends BaseLanguageDefinition {
  ids = ['makefile', 'ini', 'properties'];

  apply(config: MutableLanguageConfig) {
    config.commentLineRE = new RegExp('^\\s*#', 'g');
  }
}

class CoffeeScriptLanguage extends BaseLanguageDefinition {
  ids = ['coffeescript'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['###', '###']);
    config.commentDelimiters.push(['#']);
    config.stringDelimiters.push(['"']);
  }
}

class TerraformLanguage extends BaseLanguageDefinition {
  ids = ['terraform'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['#']);
    config.commentDelimiters.push(['//']);
    config.commentDelimiters.push(['/*', '*/']);
  }
}

class PowerShellLanguage extends BaseLanguageDefinition {
  ids = ['powershell'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['<#', '#>']);
    config.commentDelimiters.push(['#']);
    config.stringDelimiters.push(['"']);
    config.stringDelimiters.push(["'"]);
  }
}

class PerlLanguage extends BaseLanguageDefinition {
  ids = ['perl'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(["'"]);
    config.commentDelimiters.push(['#']);
    config.commentDelimiters.push(['=begin', '=cut']);
    config.stringDelimiters.push(['"']);
  }
}

class RubyLanguage extends BaseLanguageDefinition {
  ids = ['ruby'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['#']);
    config.commentDelimiters.push(['=begin', '=cut']);
    config.stringDelimiters.push(['"']);
  }
}

class Perl6Language extends BaseLanguageDefinition {
  ids = ['perl6'];

  apply(config: MutableLanguageConfig) {
    config.stringDelimiters.push(['"']);
    config.stringDelimiters.push(["'"]);
    config.stringDelimiters.push(['｢', '｣']);
    config.stringDelimiters.push(['“', '”']);
    config.commentDelimiters.push(['#`(', '(', ')']);
    config.commentDelimiters.push(['#`{', '{', '}']);
    config.commentDelimiters.push(['#`[', '[', ']']);
    config.commentDelimiters.push(['#`<', '<', '>']);
    config.commentDelimiters.push(['#']);
    config.commentDelimiters.push(['=begin', '=cut']);
  }
}

class VisualBasicLanguage extends BaseLanguageDefinition {
  ids = ['vb'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(["'"]);
    config.stringDelimiters.push(['"']);
  }
}

class ZigLanguage extends BaseLanguageDefinition {
  ids = ['zig'];

  apply(config: MutableLanguageConfig) {
    config.commentDelimiters.push(['//']);
    config.stringDelimiters.push(['"']);
    config.stringDelimiters.push(["'"]);
    config.stringDelimiters.push(['\\\\', '\n']);
  }
}

export const scriptingDefinitions: LanguageDefinition[] = [
  new PythonTomlLanguage(),
  new LmpsLanguage(),
  new YamlLanguage(),
  new UiuaRLanguage(),
  new ShellScriptLanguage(),
  new ElixirLanguage(),
  new GraphqlLanguage(),
  new JuliaLanguage(),
  new ErlangLanguage(),
  new DockerfileLanguage(),
  new LuaLanguage(),
  new HashCommentLanguage(),
  new CoffeeScriptLanguage(),
  new TerraformLanguage(),
  new PowerShellLanguage(),
  new PerlLanguage(),
  new RubyLanguage(),
  new Perl6Language(),
  new VisualBasicLanguage(),
  new ZigLanguage()
];
