import { defineConfig, globalIgnores } from "eslint/config";
import next from "@next/eslint-plugin-next";
import ts from "typescript-eslint";
import hooks from "eslint-plugin-react-hooks";
export default defineConfig([
  ...ts.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "@next/next": next, "react-hooks": hooks },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
      ...hooks.configs.recommended.rules,
    },
  },
  globalIgnores([
    ".next/**",
    "src/generated/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);
