import * as vscode from 'vscode'
import { registerExtensionCommand, getExtensionSetting } from 'vscode-framework'
import { camelCase } from 'change-case'
import { getComponentNameOutline } from '../util'

export const registerCopyComponentName = () => {
    registerExtensionCommand('copyComponentName', async () => {
        const activeEditor = vscode.window.activeTextEditor
        if (!activeEditor) return

        const componentNameOutline = await getComponentNameOutline(activeEditor?.document.uri)
        if (!componentNameOutline) return

        const { range } = componentNameOutline
        const componentName = /name:\s+?["'](\w+?)["']/.exec(activeEditor.document.getText(range))![1] ?? ''

        if (getExtensionSetting('copyComponentNameCase') === 'camelCase') {
            await vscode.env.clipboard.writeText(camelCase(componentName))
            return
        }

        await vscode.env.clipboard.writeText(componentName)
    })
}
