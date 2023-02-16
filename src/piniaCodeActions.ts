import * as vscode from 'vscode'
import { getComputedOutline } from './util'

export const registerPiniaCodeactions = () => {
    vscode.languages.registerCodeActionsProvider('vue', {
        async provideCodeActions(document, range, context, token) {
            const pos = range.start
            const codeActions = [] as vscode.CodeAction[]

            const piniaStoreMatch = new RegExp(/(import (.+)\s+from )(['"].*pinia.*['"])/).exec(document.lineAt(pos.line).text)

            if (piniaStoreMatch) {
                const computedOutline = await getComputedOutline(document.uri)
                if (!computedOutline) return

                const { range: computedRange } = computedOutline

                const computedStoreTemplate = `\t${piniaStoreMatch[2]!}() {\n\t\t\treturn defineStore('${piniaStoreMatch[2]!}', ${piniaStoreMatch[2]!})()\n\t\t},\n\t`

                const workspaceEdit = new vscode.WorkspaceEdit()
                if (computedRange.isSingleLine)
                    // computed: {}; case
                    workspaceEdit.insert(document.uri, computedRange.end.translate(undefined, -1), `\n\t${computedStoreTemplate}`)
                else workspaceEdit.insert(document.uri, computedRange.start.translate(1), computedStoreTemplate)

                codeActions.push({
                    title: 'Register pinia store in computed',
                    kind: vscode.CodeActionKind.QuickFix,
                    isPreferred: true,
                    edit: workspaceEdit,
                })
            }

            return codeActions
        },
    })
}
