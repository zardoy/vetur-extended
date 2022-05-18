//@ts-check
const { defineConfig } = require('@zardoy/vscode-utils/build/defineConfig.cjs')

module.exports = defineConfig({
    development: {
        disableExtensions: false,
    },
    // target: { desktop: true, web: true },
})
