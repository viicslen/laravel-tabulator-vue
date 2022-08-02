const path = require('path');
const { defineConfig } = require('vite');
const vue = require('@vitejs/plugin-vue2');

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/components/index.js'),
            name: 'TabulatorTable',
            fileName: (format) => `tabulator-table.${format}.js`,
        },
        rollupOptions: {
            external: [
                'vue',
                'jquery',
            ],
            output: {
                exports: 'named',
                globals: {
                    jquery: 'JQuery',
                    vue: 'Vue',
                },
            },
        },
    },
    plugins: [vue()],
});
