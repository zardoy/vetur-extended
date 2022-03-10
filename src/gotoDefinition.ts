import * as vscode from 'vscode'
import { getDefaultExportOutline, interpolationPropRegex } from './util'

export const registerGotoDefinition = () => {
    vscode.languages.registerDefinitionProvider('vue', {
        async provideDefinition(document, position, token) {
            const lineText = document.lineAt(position).text
            const match = interpolationPropRegex.exec(lineText.slice(0, position.character))
            if (!match) return
            // TODO use slice method (special case for v-for) & ===
            const wordPos = document.getWordRangeAtPosition(position)
            const propToFind = document.getText(wordPos)
            const defaultExport = await getDefaultExportOutline(document.uri)
            if (!defaultExport) return
            const searchOrder = ['computed', 'data', 'methods', 'props']
            // TODO compare range and selectingRange
            return (
                searchOrder
                    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                    .map(field => defaultExport.children.find(({ name }) => name === field)?.children.find(({ name }) => name === propToFind)!)
                    .filter(Boolean)
                    .map(({ range }) => ({ targetRange: range, targetUri: document.uri }))
            )
        },
    })
}
