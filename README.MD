Simple code completion, go to reference from `<template>`. It based on outline and works with either [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur) or [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) installed (uses document features).

Note that I'm currently trying to create more convenient and reliable extension for Vue2: [Volar Extended](https://marketplace.visualstudio.com/items?itemName=zardoy.testPatched1).

## Why?

It was mainly created for Vue@2, where just `export default` is used within components.

Vetur is abandoned. It just doesn't work in some components.
Volar doesn't work without `defineComponent` and some switches that must be defined in js/tsconfig locally.

### My Other Extensions

- [Better Snippets](https://marketplace.visualstudio.com/items?itemName=zardoy.better-snippets) - Create snippets of any complexity for Vue!
- [TypeScript Essential Plugins](https://marketplace.visualstudio.com/items?itemName=zardoy.ts-essential-plugins) - Includes [optional](https://github.com/zardoy/typescript-vscode-plugins#vue-support) support for Vue + Volar (better completions, go to references and so on!)
- [Move Statement](https://marketplace.visualstudio.com/items?itemName=zardoy.move-statement) - Move any statements in Vue files (such as elements in `template` / `style`)!
