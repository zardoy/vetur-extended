import * as vscode from 'vscode'
import { getExtensionSetting } from 'vscode-framework'
import { getDefaultExportOutline, interpolationPropRegex } from './util'

export const registerTemplateCompletion = () => {
    vscode.languages.registerCompletionItemProvider('vue', {
        async provideCompletionItems(document, position) {
            const showCompletions = getExtensionSetting('showCompletions')
            if (showCompletions === 'disabled') return
            const lineText = document.lineAt(position).text
            const match = interpolationPropRegex.exec(lineText.slice(0, position.character))
            if (!match) return
            const existingContent = match[2]!
            // don't make too complicated!
            const wordRange = document.getWordRangeAtPosition(position) ?? new vscode.Range(position, position)
            const symbolBefore = document.getText(wordRange.with(wordRange.start.translate(0, -1), wordRange.start))
            if (['.'].includes(symbolBefore)) return
            console.time('getOutline')
            const defaultExport = await getDefaultExportOutline(document.uri)
            console.timeEnd('getOutline')
            if (!defaultExport) return
            console.debug('defaultExport', defaultExport)
            const getAllPropsFromDefaultExport = (field: string) =>
                defaultExport.children.find(({ name }) => name === field)?.children.map(({ name }) => name)
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
                    // completions: defaultExport.children.find(({ name }) => name === 'methods')?.children.map(({ name, range }) => {
                    //     const hoverInfo = await vscode.commands.executeCommand('vscode.executeHoverProvider', )
                    //     return range;
                    // }),
                },
            ]
            // TODO align with webstorm
            const typeInclude = {
                'v-model': ['data'],
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '@': ['methods'],
            }
            return completions
                .flatMap(
                    ({ kind, names }, kindIndex) =>
                        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                        names?.map((name, i) => {
                            kind = +kind as never
                            if (name === '<unknown>') return undefined!
                            if (showCompletions === 'onlyStart' && !name.startsWith(existingContent)) return undefined!
                            const completion = new vscode.CompletionItem(name, kind)
                            // TODO recheck src
                            // force sorting as in source, this workaround is needed as vscode just uses .sort()
                            completion.sortText = `!${kindIndex + 1}${i.toString().padStart(3, '0')}`
                            return completion
                        })!,
                )
                .filter(Boolean)
        },
    })
}
