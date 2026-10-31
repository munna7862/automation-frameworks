module.exports = {
  extends: ['@commitlint/config-conventional'],
  // Dependabot bodies embed markdown tables with long URLs that break body-max-line-length
  ignores: [(message) => message.includes('Signed-off-by: dependabot[bot]')],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'playwright',
        'selenium',
        'wdio',
        'mobile',
        'k6',
        'jmeter',
        'ci',
        'docs',
        'planning',
        'security',
        'utils',
        'test-data',
        'infra',
        'portal',
        'deps',
        'governance'
      ]
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [0]
  }
};
