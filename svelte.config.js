import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
  kit: {
	// csp: {
	// 	mode: 'hash', // Use 'hash' for better security
	// 	directives: {
	// 	  'default-src': ['self'], // Default policy for all resources
	// 	  'script-src': ['self'], // Allow scripts from 'self'
	// 	  'style-src': ['self', 'unsafe-inline'], // Allow styles from 'self' and inline styles
	// 	  'object-src': ['none'], // Disallow <object>, <embed>, <applet>
	// 	  'img-src': ['self', 'data:'], // Allow images from 'self' and data URIs
	// 	  'connect-src': ['self'], // Allow fetch/XHR/WebSocket connections to 'self'
	// 	}
	// },
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'popup.html',
      precompress: false,
      strict: true
    }),
    appDir: 'app',
	
  },
};

export default config;