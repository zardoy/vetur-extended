import * as vscode from 'vscode'

export const registerTemplateCompletion = () => {
    vscode.languages.registerCompletionItemProvider('vue', {
        async provideCompletionItems(document, position) {
            // TODO! caching
            const lineText = document.lineAt(position).text
            const match = /(?::|@|v-)(\w+)="([^"]*)$/.exec(lineText.slice(0, position.character))
            if (!match) return
            console.time('getInfo')
            const result: vscode.DocumentSymbol[] = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri)
            console.timeEnd('getInfo')
            const defaultExport = result[0]?.children.find(({ name }) => name === 'script')?.children.find(({ name }) => name === 'default')
            if (!defaultExport) return
            const getAllPropsFromDefaultExport = (field: string) => defaultExport.children.find(({ name }) => name === field)?.children.map(({ name }) => name)
            const completions = [
                {
                    kind: vscode.CompletionItemKind.Variable,
                    names: getAllPropsFromDefaultExport('data'),
                },
                {
                    kind: vscode.CompletionItemKind.Event,
                    names: getAllPropsFromDefaultExport('computed'),
                },
                {
                    kind: vscode.CompletionItemKind.Property,
                    names: getAllPropsFromDefaultExport('props'),
                },
                {
                    kind: vscode.CompletionItemKind.Method,
                    names: getAllPropsFromDefaultExport('methods'),
                },
            ]
            // TODO align with webstorm
            const typeInclude = {
                'v-model': ['data'],
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@': ['methods'],
            }
            return completions
                .flatMap(({ kind, names }, kindIndex) =>
                    names!.map((name, i) => {
                        kind = +kind as never
                        if (!name.startsWith(match[2]!)) return undefined!
                        const completion = new vscode.CompletionItem(name, kind)
                        // TODO recheck src
                        // force sorting as in source, this workaround is needed as vscode just uses .sort()
                        completion.sortText = `!${kindIndex + 1}${i.toString().padStart(3, '0')}`
                        return completion
                    }),
                )
                .filter(Boolean)
        },
    })
}
