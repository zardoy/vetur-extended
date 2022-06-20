//@ts-check
const { defineConfig } = require('@zardoy/vscode-utils/build/defineConfig.cjs')
const nodeModulesPolyfill = require('@esbuild-plugins/node-modules-polyfill')

module.exports = defineConfig({
    development: {
        disableExtensions: false,
    },
    esbuild: {
        // plugins: [nodeModulesPolyfill.default()],
    },
    target: { desktop: true, web: true },
})
