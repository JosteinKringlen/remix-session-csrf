import { defineConfig } from 'tsup';

export default defineConfig((opts) => ({
    entry: ['src/react.tsx', 'src/server.ts'],
    target: 'es2022',
    external: ['react'],
    sourcemap: true,
    dts: true,
    format: ['esm', 'cjs'],
    clean: !opts.watch,
    esbuildOptions: (opts) => {
        opts.jsx = 'automatic';
    },
}));
