import * as vscode from 'vscode'
import { join } from 'path'
import fs from 'fs'
import { modifyTsConfigJsonFile } from 'modify-json-file'
import { getCurrentWorkspaceRoot, fsExists } from '@zardoy/vscode-utils/build/fs'
import { notificationConfirmAction } from '@zardoy/vscode-utils/build/ui'
import { registerExtensionCommand } from 'vscode-framework'

export const registerGenerateJsconfigAliases = () => {
    registerExtensionCommand('generateJsconfigAliases', async () => {
        const currentWorkspaceRoot = getCurrentWorkspaceRoot().uri
        if (await fsExists(vscode.Uri.joinPath(currentWorkspaceRoot, 'tsconfig.json'))) {
            const stop = await notificationConfirmAction('Workspace already has tsconfig.json', 'Continue')
            if (!stop) return
        }

        const jsConfigPath = join(currentWorkspaceRoot.fsPath, 'jsconfig.json')
        const targetFilesList = await fs.promises.readdir(join(currentWorkspaceRoot.fsPath, 'src'), { withFileTypes: true })
        const targetDirs = targetFilesList.filter(file => file.isDirectory())
        if (!fs.existsSync(jsConfigPath)) await fs.promises.writeFile(jsConfigPath, '{}', 'utf-8')
        await modifyTsConfigJsonFile(
            jsConfigPath,
            jsconfig => {
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
    })
}
