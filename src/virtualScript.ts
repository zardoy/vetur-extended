import * as vscode from 'vscode'
import { getNormalizedVueOutline } from '@zardoy/vscode-utils/build/vue'

export default () => {
    vscode.languages.registerCodeActionsProvider('javascript', {
        async provideCodeActions(document, range, context, token) {
            // if (document.languageId === 'vue')
            // const outline = await getNormalizedVueOutline(document.uri)
            // const scriptRange = outline?.find(({ name }) => name === 'script')?.range
            // if (!scriptRange) return
            // const scriptContent = document.getText(scriptRange)
            const scriptContent = document.getText()
            // await vscode.commands.executeCommand('revealInExplorer', vscode.Uri.joinPath(getCurrentWorkspaceRoot().uri, 'src'));
            const { dispose } = vscode.workspace.registerTextDocumentContentProvider('virtual-ts-script', {
                async provideTextDocumentContent(uri) {
                    return scriptContent
                },
            })
            const virtualDocument = await vscode.workspace.openTextDocument(vscode.Uri.parse('virtual-ts-script:dummy.ts'))
            // await vscode.window.showTextDocument(virtualDocument)
            await new Promise<void>((resolve, reject) => {
              setTimeout(resolve, 5000)
            })
            const codeActions: vscode.CodeAction[] = await vscode.commands.executeCommand('vscode.executeCodeActionProvider', virtualDocument.uri, range)
            console.log('codeActions', codeActions)
            dispose()
            return codeActions
        },
    })
    // vscode.window.onDidChangeActiveTextEditor(() => )
}
