// import { sentrySvelteKit } from "@sentry/sveltekit";
// import { sentryVitePlugin } from "@sentry/vite-plugin";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [
    //     sentrySvelteKit({
    //         sourceMapsUploadOptions: {
    //             org: process.env.SENTRY_ORG,
    //             project: process.env.SENTRY_PROJECT
    //         }
    //     }), 
        // sentryVitePlugin({
        //     org: process.env.SENTRY_ORG,
        //     project: process.env.SENTRY_PROJECT
        // }),
        sveltekit()
    ],

    test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},

    build: {
        sourcemap: true
    }
});