import * as vscode from 'vscode'
import { getComputedOutline } from './util'

export const registerPiniaCodeactions = () => {
    vscode.languages.registerCodeActionsProvider('vue', {
        async provideCodeActions(document, range, context, token) {
            const pos = range.start
            const codeActions = [] as vscode.CodeAction[]

            const piniaStoreMatch = new RegExp(/(import (.+)\s+from )(['"].*pinia.*['"].?)/).exec(document.lineAt(pos.line).text)

            if (piniaStoreMatch) {
                const computedOutline = await getComputedOutline(document.uri)
                if (!computedOutline) return

                const { range: computedRange } = computedOutline
                const snippetStirng = // eslint-disable-next-line no-template-curly-in-string
                    "\t${TM_CURRENT_LINE/import (.+)\\s+from ['\"].*?pinia.*?['\"].?/$1/}() {\n\t\treturn defineStore('$2', $3)()\n\t},$0\n"

                const workspaceEdit = new vscode.WorkspaceEdit()
                if (computedRange.isSingleLine)
                    // computed: {}; case
                    workspaceEdit.set(document.uri, [
                        new vscode.SnippetTextEdit(
                            new vscode.Range(computedRange.start, computedRange.end),
                            new vscode.SnippetString(`computed: {\n${snippetStirng}}`),
                        ),
                    ])
                else
                    workspaceEdit.set(document.uri, [
                        new vscode.SnippetTextEdit(
                            new vscode.Range(computedRange.start.translate(1), computedRange.start.translate(1)),
                            new vscode.SnippetString(snippetStirng),
                        ),
                    ])

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