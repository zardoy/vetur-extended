import * as vscode from 'vscode'

export const interpolationPropRegex = /(?::|@|v-)(\w|-)+="([^"]*)$/

// TODO! caching
let veturMode: boolean | undefined
export const getNormalizedOutline = async (documentUri: vscode.Uri) => {
    if (veturMode === undefined) {
        const updateMode = () => {
            // support volar
            veturMode = !!vscode.extensions.getExtension('octref.vetur')
        }

        vscode.extensions.onDidChange(updateMode)
        updateMode()
    }

    const outline: vscode.DocumentSymbol[] = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', documentUri)
    return veturMode ? outline[0]?.children : outline
}

export const getDefaultExportOutline = async (documentUri: vscode.Uri) => {
    const outline = await getNormalizedOutline(documentUri)
    const defaultExport = outline?.find(({ name }) => name === 'script')?.children.find(({ name }) => name === 'default')
    if (!defaultExport) console.warn("Can' get default outline from Vetur")

    return defaultExport
}
