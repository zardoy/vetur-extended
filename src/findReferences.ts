import * as vscode from 'vscode'
import escapeStringRegexp from 'escape-string-regexp'
import { getExtensionSetting } from 'vscode-framework'

export const registerFindReferences = () => {
    vscode.languages.registerReferenceProvider('vue', {
        async provideReferences(document, position, { includeDeclaration }) {
            // ignoring includeDeclaration for now
            if (!/^\s*export default {$/.test(document.lineAt(position.translate(-1)).text)) return
            const match = /^(\s*name: ?)(['"])(.+)\2$/.exec(document.getText(document.lineAt(position).range))
            if (!match) return
            const offset = match[1]!.length
            const componentName = match[3]!
            if (position.character <= offset) return
            const files = await vscode.workspace.findFiles(getExtensionSetting('searchReferencesGlob') || 'src/**/*.vue', undefined)
            // TODO
            const explicitUsagesOnly = true
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
                            if (inTemplate) {
                                console.log('check', line)
                                // TODO! use iterator
                                const match = new RegExp(`<${escapeStringRegexp(componentName)}`).exec(line)
                                if (!match) continue
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

            return hits.filter(({ ranges }) => ranges.length > 0).flatMap(({ uri, ranges }) => ranges.map(range => ({ uri, range })))
        },
    })
}
