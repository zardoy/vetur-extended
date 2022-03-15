import * as vscode from 'vscode'
import escapeStringRegexp from 'escape-string-regexp'
import { getExtensionSetting, registerExtensionCommand } from 'vscode-framework'

export const registerFindReferences = () => {
    vscode.languages.registerReferenceProvider('vue', {
        async provideReferences(document, position, { includeDeclaration }) {
            // ignoring includeDeclaration for now
            if (!/^\s*export default {$/.test(document.lineAt(position.translate(-1)).text)) return
            const match = /^(\s*name: ?)(['"])(.+)\2,?$/.exec(document.getText(document.lineAt(position).range))
            if (!match) return
            const offset = match[1]!.length
            const componentName = match[3]!
            if (position.character <= offset) return
            const files = await vscode.workspace.findFiles(getExtensionSetting('searchReferencesGlob') || 'src/**/*.vue', undefined)
            // TODO
            console.log('Looking for usages:', componentName)
            const explicitUsagesOnly = true
            console.time('Get usages')
            const hits = await Promise.all(
                files.map(async uri =>
                    (async () => {
                        // eslint-disable-next-line unicorn/no-await-expression-member
                        const contents = (await vscode.workspace.fs.readFile(uri)).toString()
                        const ranges = [] as vscode.Range[]
                        let inTemplate = false
                        for (let [lineIndex, line] of contents.split('\n').entries()) {
                            // win \n\r
                            if (line.endsWith('\r')) line = line.slice(0, -1)
                            if (line === '<template>') {
                                inTemplate = true
                                continue
                            }

                            if (line === '</template>') break
                            if (!inTemplate) continue;
                                // TODO! use iterator
                                const matches = line.matchAll(new RegExp(`<${escapeStringRegexp(componentName)}`, 'g'))
                                for (const match of matches) {
                                    if (match.index === undefined) continue
                                    const startPos = new vscode.Position(lineIndex, match.index + 1)
                                    ranges.push(new vscode.Range(startPos, startPos.translate(0, componentName.length)))
                                }

                        }

                        return {
                            uri,
                            ranges,
                        }
                    })(),
                ),
            )
            console.timeEnd('Get usages')

            return hits.filter(({ ranges }) => ranges.length > 0).flatMap(({ uri, ranges }) => ranges.map(range => ({ uri, range })))
        },
    })

    registerExtensionCommand('findComponentReferences', async () => {
        const activeEditor = vscode.window.activeTextEditor
        if (activeEditor === undefined || activeEditor.viewColumn === undefined) return
        const result: vscode.DocumentSymbol[] = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', activeEditor.document.uri)
        const range = result[0]?.children
            .find(({ name }) => name === 'script')
            ?.children.find(({ name }) => name === 'default')
            ?.children.find(({ name }) => name === 'name')?.range
        if (!range) return
        activeEditor.selections = [new vscode.Selection(range.end, range.end)]
        await vscode.commands.executeCommand('editor.action.referenceSearch.trigger')
    })
}
