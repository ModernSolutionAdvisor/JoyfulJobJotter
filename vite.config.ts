import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({

	plugins: [
		tailwindcss(),
		sveltekit(),
	],
	// build: {
	// 	target: 'esnext',
	// 	rollupOptions: {
	// 	  output: {
	// 		format: 'iife',
	// 		entryFileNames: '[name].js',
	// 		chunkFileNames: '[name]-[hash].js',
	// 		assetFileNames: '[name][extname]',
	// 	  },
	// 	},
	//   },
});
