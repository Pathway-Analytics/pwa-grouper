# sveltKit
pnpm create svelte@latest
 Skeleton project
 TypeScript?
 ESLint for code linting, 
 Prettier for code formatting, 
 Playwright for browser testing,
 Vitest for unit testing

pnpm i -D @skeletonlabs/skeleton @skeletonlabs/tw-plugin

pnpx svelte-add@latest tailwindcss

pnpm add -D @types/node

pnpm install -D @tailwindcss/forms

pnpm i -D flowbite-svelte flowbite

pnpm add svelte-kit-sst --save-dev

sveltekit.confog.js
- import adapter from '@sveltejs/adapter-auto';
+ import adapter from "svelte-kit-sst";

pnpm remove @sveltejs/adapter-auto

package.json
- "dev": "vite dev",
+    "dev": "sst bind vite dev",

pnpm install