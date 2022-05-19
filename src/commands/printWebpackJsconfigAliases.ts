import { getTsconfigWithWebpackAliases } from '@zardoy/vscode-utils/build/readWebpackAliases'
import { registerExtensionCommand } from 'vscode-framework'

export const registerPrintWebpackJsconfigAliases = () => {
    registerExtensionCommand('printWebpackJsconfigAliases', async () => {
        console.log('paths', (await getTsconfigWithWebpackAliases()).compilerOptions?.paths)
    })
}
