module.exports = {
  extends: ['@commitlint/config-conventional'],
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
