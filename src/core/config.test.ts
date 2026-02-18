import { beforeEach, describe, expect, it, vi } from 'vitest';

const getConfigurationMock = vi.hoisted(() => vi.fn());

vi.mock('vscode', () => {
  return {
    workspace: {
      getConfiguration: getConfigurationMock
    }
  };
});

import { collectKeepRegexes, getExtensionConfig } from './config';

describe('getExtensionConfig', () => {
  beforeEach(() => {
    getConfigurationMock.mockReset();
  });

  it('reads the rm-comments configuration root', () => {
    getConfigurationMock.mockReturnValue({});

    expect(getExtensionConfig()).toEqual({});
    expect(getConfigurationMock).toHaveBeenCalledWith('rm-comments', null);
  });
});

describe('collectKeepRegexes', () => {
  it('returns empty list when keep config is false', () => {
    expect(collectKeepRegexes(false, 'javascript')).toEqual([]);
  });

  it('returns empty list when keep config is not a record', () => {
    expect(collectKeepRegexes('invalid', 'javascript')).toEqual([]);
    expect(collectKeepRegexes(null, 'javascript')).toEqual([]);
  });

  it('collects regexes for the matching language id', () => {
    const keepConfig = {
      javascript: {
        region: { regex: '^\\s*#(end)?region' },
        todo: { regex: '^\\s*TODO', flags: 'i' }
      }
    };

    expect(collectKeepRegexes(keepConfig, 'javascript')).toEqual([
      { regex: '^\\s*#(end)?region', flags: undefined },
      { regex: '^\\s*TODO', flags: 'i' }
    ]);
  });

  it('collects regexes for comma-separated language lists', () => {
    const keepConfig = {
      'javascript,typescript': {
        region: { regex: '^region' }
      }
    };

    expect(collectKeepRegexes(keepConfig, 'typescript')).toEqual([{ regex: '^region', flags: undefined }]);
  });

  it('collects regexes for the all language key', () => {
    const keepConfig = {
      all: {
        region: { regex: '^region' }
      }
    };

    expect(collectKeepRegexes(keepConfig, 'go')).toEqual([{ regex: '^region', flags: undefined }]);
  });

  it('collects regexes from both all and specific language keys', () => {
    const keepConfig = {
      all: {
        global: { regex: '^global' }
      },
      javascript: {
        local: { regex: '^local' }
      }
    };

    expect(collectKeepRegexes(keepConfig, 'javascript')).toEqual([
      { regex: '^global', flags: undefined },
      { regex: '^local', flags: undefined }
    ]);
  });

  it('skips entries with empty regex', () => {
    const keepConfig = {
      javascript: {
        empty: { regex: '', flags: 'i' }
      }
    };

    expect(collectKeepRegexes(keepConfig, 'javascript')).toEqual([]);
  });

  it('ignores invalid regex entries', () => {
    const keepConfig = {
      javascript: {
        region: false,
        todo: { regex: 123 },
        fixme: { regex: '^fixme', flags: 5 }
      }
    };

    expect(collectKeepRegexes(keepConfig, 'javascript')).toEqual([{ regex: '^fixme', flags: undefined }]);
  });

  it('returns empty list when no matching language id', () => {
    const keepConfig = {
      python: {
        region: { regex: '^region' }
      }
    };

    expect(collectKeepRegexes(keepConfig, 'javascript')).toEqual([]);
  });
});
