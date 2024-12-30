import antfu from '@antfu/eslint-config'
import oxlint from 'eslint-plugin-oxlint'

export default antfu(
  {
    typescript: true,
    stylistic: true,
    formatters: {
      css: true,
      html: true,
      markdown: true,
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      // 正则表达式宽松规则
      'regexp/no-unused-capturing-group': 'off',
      'regexp/no-super-linear-backtracking': 'off',
      'regexp/no-useless-quantifier': 'off',
      // switch 语句必须有 default
      'default-case': 'error',
      //  禁止在条件语句中出现赋值操作符
      'no-unsafe-finally': 'error',
      // 不能有尾随的空格
      'no-trailing-spaces': 'warn',
      // 在函数体周围使用大括号 (不能缺省)
      'arrow-body-style': ['off', 'always'],
      'no-html-link-for-pages': 'off',
      // 禁止在条件语句中出现常量表达式
      'no-constant-condition': ['error', { checkLoops: false }],
      // 允许使用 console
      'no-console': 'off',
      'style/brace-style': ['warn', '1tbs'],
      // 引用时必须按照顺序
      'import/order': [
        'warn',
        {
          groups: [
            'type',
            'builtin',
            'object',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            {
              pattern: '~/**',
              group: 'external',
              position: 'after',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      '**/dist/*',
      '**/node_modules',
      '**/*.yaml',
      '**/*-lock.json',
    ],
  },
  [oxlint.configs['flat/recommended']],
)
