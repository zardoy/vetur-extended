import * as vscode from 'vscode'
import { interpolationPropRegex, getDefaultExportOutline } from './util'

export const registerHover = () => {
    // TODO investigate empty hovers
    vscode.languages.registerHoverProvider('vue', {
        async provideHover(document, position, token) {
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
            const fieldIndex = searchOrder.findIndex(field =>
                defaultExport.children.find(({ name }) => name === field)?.children.find(({ name }) => name === propToFind),
            )
            if (fieldIndex === -1) return
            return { contents: [new vscode.MarkdownString().appendCodeblock(`(${searchOrder[fieldIndex]!})`, 'ts')] }
        },
    })
}
