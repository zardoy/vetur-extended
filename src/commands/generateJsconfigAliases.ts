import * as vscode from 'vscode'
import { getCurrentWorkspaceRoot, fsExists } from '@zardoy/vscode-utils/build/fs'
import { notificationConfirmAction } from '@zardoy/vscode-utils/build/ui'
import { registerExtensionCommand } from 'vscode-framework'

export const registerGenerateJsconfigAliases = () => {
    registerExtensionCommand('generateJsconfigAliases', async () => {
        if (process.env.PLATFORM === 'node') {
            const fs = await import('fs')
            const { join } = await import('path')
            const currentWorkspaceRoot = getCurrentWorkspaceRoot().uri
            if (await fsExists(vscode.Uri.joinPath(currentWorkspaceRoot, 'tsconfig.json'))) {
                const stop = await notificationConfirmAction('Workspace already has tsconfig.json', 'Continue')
                if (!stop) return
            }

            const jsConfigPath = join(currentWorkspaceRoot.fsPath, 'jsconfig.json')
            const targetFilesList = await fs.promises.readdir(join(currentWorkspaceRoot.fsPath, 'src'), { withFileTypes: true })
            const targetDirs = targetFilesList.filter(file => file.isDirectory())
            if (!fs.existsSync(jsConfigPath)) await fs.promises.writeFile(jsConfigPath, '{}', 'utf-8')
            const { modifyTsConfigJsonFile } = await import('modify-json-file')
            await modifyTsConfigJsonFile(
                jsConfigPath,
                jsconfig => {
                    //@ts-expect-error TODO
                    if (!jsconfig.include) jsconfig.include = 'src/*'
                    if (!jsconfig.compilerOptions) jsconfig.compilerOptions = {}
                    if (!jsconfig.compilerOptions.paths) jsconfig.compilerOptions.paths = {}
                    if (!jsconfig.compilerOptions.baseUrl) jsconfig.compilerOptions.baseUrl = './'
                    for (const targetDir of targetDirs) jsconfig.compilerOptions.paths[`${targetDir.name}/*`] = [`./src/${targetDir.name}/*`]

                    return jsconfig
                },
                {
                    tabSize: 4,
                },
            )
        }
    })
}
