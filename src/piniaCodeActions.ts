import * as vscode from 'vscode'
import { getExtensionSetting } from 'vscode-framework'
import { getComputedOutline } from './util'

export const registerPiniaCodeactions = () => {
    vscode.languages.registerCodeActionsProvider(['vue', 'javascript', 'typescript'], {
        async provideCodeActions(document, range, context, token) {
            if (!getExtensionSetting('enablePiniaStoreRegistrationCodeAction')) return

            const pos = range.start
            const codeActions = [] as vscode.CodeAction[]
            const piniaStorePathRegex = getExtensionSetting('piniaStorePathRegex')

            const piniaStoreMatch = new RegExp(`(import (.+)\\s+from )(['"]${piniaStorePathRegex}['"].?)`).exec(document.lineAt(pos.line).text)

            if (piniaStoreMatch) {
                const computedOutline = await getComputedOutline(document.uri)
                if (!computedOutline) return
                // const str = `\${TM_CURRENT_LINE/import (.+)\\s+from ['"]${piniaStorePathRegex}['"].?/$1/}`
                const { range: computedRange } = computedOutline

                const customNameTransform = getExtensionSetting('piniaStoreComputedNameTransform')
                const computedName = customNameTransform
                    ? piniaStoreMatch[2]!.replace(new RegExp(customNameTransform?.pattern), customNameTransform?.replacement)
                    : piniaStoreMatch[2]!

                const snippetStirng = `\t\${1:${computedName}}() {\n\t\treturn defineStore('\${2:${piniaStoreMatch[2]!}}', \${3:${piniaStoreMatch[2]!}})()\n\t},$0\n`

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
