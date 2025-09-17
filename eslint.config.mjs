import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/app/cart/page-backup.tsx",
      "src/app/cart/page-old.tsx",
      "src/app/cart/page-old2.tsx",
      "src/app/cart/page-broken.tsx",
      "src/app/cart/page-clean-start.tsx",
      "src/app/cart/page-without-coupons.tsx",
      "src/app/checkout/page-backup.tsx",
      "src/app/checkout/page-mobile-optimized.tsx",
      "src/app/checkout/page-mobile.tsx",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
