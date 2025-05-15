module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint/eslint-plugin"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [".eslintrc.js"],
  rules: {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",

    "@typescript-eslint/naming-convention": [
      "warn",
      {
        // 기본적으로 변수, 함수 등은 camelCase
        selector: "default",
        format: ["camelCase"],
      },
      {
        selector: "typeAlias", // 타입선언
        format: ["PascalCase"],
      },
      {
        // 변수 이름은 snake_case, camelCase, UPPER_CASE(상수)
        selector: "variable",
        format: ["snake_case", "camelCase", "UPPER_CASE"],
      },
      {
        selector: "parameter", // 매개변수
        format: ["camelCase", "snake_case"],
      },
      {
        selector: "memberLike", // Property 멤버
        format: ["camelCase"],
      },
      {
        // 함수 이름은 camelCase 또는 PascalCase
        selector: "function",
        format: ["camelCase"],
      },
      {
        selector: "property",
        format: ["snake_case"],
        leadingUnderscore: "allow",
      },
      {
        // 클래스, 인터페이스, 타입, 열거형은 PascalCase를 권장
        selector: "typeLike",
        format: ["PascalCase"],
      },
    ],
  },
};
