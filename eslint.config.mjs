import {defineConfig, globalIgnores} from "eslint/config";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const localPlugin = {
  rules: {
    "interface-member-spacing": {
      meta: {
        type: "layout",
        docs: {
          description: "Require a blank line between interface members",
        },
        fixable: "whitespace",
        schema: [],
      },
      create(context) {
        return {
          TSInterfaceBody(node) {
            const members = node.body;
            for (let index = 1; index < members.length; index += 1) {
              const previousMember = members[index - 1];
              const currentMember = members[index];
              if (!previousMember?.loc || !currentMember?.loc) {
                continue;
              }

              const lineDistance = currentMember.loc.start.line - previousMember.loc.end.line;
              if (lineDistance >= 2) {
                continue;
              }

              context.report({
                node: currentMember,
                message: "Interface members must be separated by a blank line.",
                fix: (fixer) => fixer.insertTextBefore(currentMember, "\n"),
              });
            }
          },
        };
      },
    },
    "max-exported-functions": {
      meta: {
        type: "suggestion",
        docs: {
          description: "Prefer class or module object when exporting many functions",
        },
        schema: [
          {
            type: "object",
            properties: {
              max: {type: "number"},
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        let exportedFunctionCount = 0;
        const [{max = 4} = {}] = context.options;

        function maybeCountFunctionExport(node) {
          if (!node || node.type !== "ExportNamedDeclaration" || !node.declaration) {
            return;
          }

          if (node.declaration.type === "FunctionDeclaration") {
            exportedFunctionCount += 1;
            return;
          }

          if (node.declaration.type !== "VariableDeclaration") {
            return;
          }

          for (const declaration of node.declaration.declarations) {
            const initType = declaration.init?.type;
            if (initType === "ArrowFunctionExpression" || initType === "FunctionExpression") {
              exportedFunctionCount += 1;
            }
          }
        }

        return {
          ExportNamedDeclaration: maybeCountFunctionExport,
          "Program:exit"(node) {
            if (exportedFunctionCount <= max) {
              return;
            }

            context.report({
              node,
              message: `File exports ${exportedFunctionCount} functions. Prefer class/module grouping when above ${max}.`,
            });
          },
        };
      },
    },
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaFeatures: {modules: true},
        ecmaVersion: "latest",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      local: localPlugin,
    },
    rules: {
      "local/interface-member-spacing": "error",
      '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      "@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/no-empty-interface": "error",
      "@typescript-eslint/no-extra-non-null-assertion": "error",
      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/no-useless-empty-export": "error",
      "@typescript-eslint/no-unnecessary-type-constraint": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/no-namespace": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/parameter-properties": ["error", {prefer: "class-property"}],
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/array-type": "error",
      "@typescript-eslint/prefer-enum-initializers": "error",
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/prefer-literal-enum-member": "error",
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/no-use-before-define": "error",
      "@typescript-eslint/no-dupe-class-members": "error",
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-unsafe-declaration-merging": "error",
      "@typescript-eslint/prefer-namespace-keyword": "error",
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'explicit',
          },
        },
      ],

      "no-extra-boolean-cast": "error",
      "no-regex-spaces": "error",
      "no-useless-catch": "error",
      "no-extra-label": "error",
      "no-useless-rename": "error",
      "no-void": "error",
      "no-with": "error",
      "prefer-arrow-callback": "error",
      "prefer-regex-literals": "error",
      "no-const-assign": "error",
      "no-constant-condition": "error",
      "no-constructor-return": "error",
      "no-empty-character-class": "error",
      "no-empty-pattern": "error",
      "no-obj-calls": "error",
      "no-inner-declarations": "error",
      "constructor-super": "error",
      "no-new-native-nonconstructor": "error",
      "no-new-symbol": "error",
      "no-loss-of-precision": "error",
      "no-self-assign": "error",
      "no-setter-return": "error",
      "no-case-declarations": "error",
      "no-undef": "error",
      "no-unreachable": "error",
      "no-this-before-super": "error",
      "no-unsafe-finally": "error",
      "no-unsafe-optional-chaining": "error",
      "no-unused-labels": "error",
      "no-unused-private-class-members": "error",
      "no-array-constructor": "error",
      "use-isnan": "error",
      "for-direction": "error",
      "require-yield": "error",
      "no-eval": "error",
      "prefer-rest-params": "error",
      "no-sequences": "error",
      "no-param-reassign": "error",
      "no-var": "error",
      "prefer-const": "error",
      "no-lonely-if": "error",
      "default-param-last": "error",
      "prefer-exponentiation-operator": "error",
      "prefer-numeric-literals": "error",
      "prefer-template": "error",
      "no-async-promise-executor": "error",
      "no-cond-assign": "error",
      "no-ex-assign": "error",
      "no-class-assign": "error",
      "no-compare-neg-zero": "error",
      "no-labels": "error",
      "no-control-regex": "error",
      "no-debugger": "error",
      eqeqeq: "error",
      "no-duplicate-case": "error",
      "no-dupe-keys": "error",
      "no-dupe-args": "error",
      "no-empty": "error",
      "no-empty-static-block": "error",
      "no-fallthrough": "error",
      "no-func-assign": "error",
      "no-global-assign": "error",
      "no-import-assign": "error",
      "no-label-var": "error",
      "no-misleading-character-class": "error",
      "no-prototype-builtins": "error",
      "no-redeclare": "error",
      "no-self-compare": "error",
      "no-shadow-restricted-names": "error",
      "no-sparse-arrays": "error",
      "no-unsafe-negation": "error",
      "default-case-last": "error",
      "getter-return": "error",
      "valid-typeof": "error",
      'lines-between-class-members': ['error', 'always', {exceptAfterSingleLine: true}],
      'no-console': 0,
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'block-scoped-var': 'error',
      'curly': ['error', 'all'],
      'no-else-return': ['error', {allowElseIf: false}],
      'no-useless-return': 'error',
      'guard-for-in': 'error',
      'no-alert': 'error',
      'no-multi-spaces': 'error',
      'no-return-await': 'error',
      'no-return-assign': 'error',
      'no-script-url': 'error',
      'wrap-iife': 'error',
      'yoda': 'error',
      'no-shadow': 1,
      'no-undef-init': 'error',
      'array-bracket-spacing': ['error', 'never'],
      'block-spacing': ['error', 'never'],
      'comma-spacing': ['error', {before: false, after: true}],
      'comma-style': ['error', 'last'],
      'func-call-spacing': ['error', 'never'],
      'implicit-arrow-linebreak': ['error', 'beside'],
      'key-spacing': ['error', {beforeColon: false, afterColon: true, mode: 'strict'}],
      'keyword-spacing': ['error', {before: true, after: true}],
      'max-len': ['error', {
        code: 120,
        tabWidth: 2,
        comments: 120,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      }],
      'multiline-ternary': ['error', 'never'],
      'no-multi-assign': 'error',
      'no-multiple-empty-lines': ['error', {max: 2}],
      'no-new-object': 'error',
      'no-trailing-spaces': 'error',
      'no-underscore-dangle': 'error',
      'object-curly-newline': ['error', {multiline: true}],
      'object-curly-spacing': ['error', 'never'],
      'object-shorthand': 'error',
      'prefer-destructuring': ['error', {object: true, array: true}],
      'prefer-spread': 'error',
      'prefer-template': 'error',
      'semi-spacing': 'error',
      'semi-style': ['error', 'last'],
      'space-before-blocks': ['error', 'always'],
      'space-before-function-paren': ['error', 'never'],
      'space-in-parens': ['error', 'never'],
      'quote-props': ['error', 'as-needed'],
      'eol-last': ['error', 'always'],
      'complexity': ['warn', 10],
      'max-lines-per-function': ['warn', 200],
      'max-lines': ['warn', {max: 400, skipBlankLines: true, skipComments: true}],
      'consistent-return': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', {prefer: 'type-imports', fixStyle: 'inline-type-imports'}],
      'no-duplicate-imports': 'error',
      'no-unneeded-ternary': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      'no-implied-eval': 'error',
    },
  }
  ,
  {
    files: ['src/lib/**/*.{ts,tsx}', 'src/config/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      "local/max-exported-functions": ["warn", {max: 4}],
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'max-lines': 'off',
    },
  },
  {
    files: [
      'src/**/*.test.{ts,tsx}',
      'src/**/tests/**/*.{ts,tsx}',
    ],
    rules: {
      'complexity': 'off',
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
]);

export default eslintConfig;
