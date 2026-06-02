import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { sentrySvelteKit } from '@sentry/sveltekit';

const sentryPlugins =
  process.env.SENTRY_AUTH_TOKEN
    ? [
        sentrySvelteKit({
          sourceMapsUploadOptions: {
            org: process.env.SENTRY_ORG ?? 'prosapiam',
            project: process.env.SENTRY_PROJECT ?? 'prosapiam',
          },
        }),
      ]
    : [];

export default defineConfig({
	plugins: [...sentryPlugins, sveltekit()],
  build: {
    sourcemap: true,
  },
});
