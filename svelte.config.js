// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    kit: {
        // Use adapter-static

		appDir: 'internal',
        adapter: adapter({
            // Default options:
            pages: 'build', // Output directory for the static files
            assets: 'build', // Output directory for assets (relative to pages)
            fallback: null, // Important for extensions: usually no fallback needed unless you build a complex SPA-like options page
            precompress: false, // Compression not typically needed for extensions
            strict: true // Recommended to catch potential issues
        }),
		// alias: {
		// 	// Define your aliases here instead of in tsconfig.json
		// 	'$lib': './src/lib',
		// 	'async_hooks': './src/lib/mocks/async-hooks'
		//   }

		// ,
        // IMPORTANT: Define paths for your extension pages
        // This tells SvelteKit which pages to pre-render into HTML files.
        // Add routes for your popup, options page, etc.
        prerender: {
            entries: [
                // Example: Assuming you have src/routes/popup/+page.svelte
                '/popup',
                '/'
                // Example: Assuming you have src/routes/options/+page.svelte
                // '/options',
				// Example: Assuming you have src/routes/journal/+page.svelte
				// '/journal',
                // Add any other distinct HTML pages your extension needs
                //'*' // Can sometimes work, but explicit is better. Be careful with dynamic routes.
            ]
        },
		csrf: {
			checkOrigin: false,
		  },
		  csp: {
			mode: 'hash',
			directives: {
			  'script-src': ['self', 'unsafe-inline', 'http://localhost:*', 'http://127.0.0.1:*'],
			  'style-src': ['self', 'unsafe-inline'],
			}
		}
        // Optional: If your extension assets need a specific base path (usually not needed for simple extensions)
        // paths: {
        //     base: '' // Default is usually fine
        // }
    }
};

export default config;