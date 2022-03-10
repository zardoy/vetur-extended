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
            // TODOr
            const types = {
                [vscode.CompletionItemKind.Property]: defaultExport?.children.find(({ name }) => name === 'props')?.children.map(({ name }) => name),
                [vscode.CompletionItemKind.Variable]: defaultExport?.children.find(({ name }) => name === 'data')?.children.map(({ name }) => name),
                [vscode.CompletionItemKind.Event]: defaultExport?.children.find(({ name }) => name === 'computed')?.children.map(({ name }) => name),
                [vscode.CompletionItemKind.Method]: defaultExport?.children.find(({ name }) => name === 'methods')?.children.map(({ name }) => name),
            }
            const kindSort = [
                vscode.CompletionItemKind.Variable,
                vscode.CompletionItemKind.Event,
                vscode.CompletionItemKind.Property,
                vscode.CompletionItemKind.Method,
            ]
            // TODO align with webstorm
            const typeInclude = {
                'v-model': ['data'],
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@': ['methods']
            }
            return Object.entries(types)
                .flatMap(([kind, names]) => names!.map((name, i) => {
                    kind = +kind as never;
                    if (!name.startsWith(match[2]!)) return undefined!
                    const completion = new vscode.CompletionItem(name, kind);
                    // TODO recheck src
                    // force sorting as in source, this workaround is needed as vscode just uses .sort()
                    completion.sortText = `${kindSort.indexOf(kind) + 1}${i.toString().padStart(3, '0')}`
                    return completion;
                }))
                .filter(Boolean)
        },
    })
}
