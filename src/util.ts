import * as vscode from 'vscode'

export const interpolationPropRegex = /(?::|@|v-)(\w+)="([^"]*)$/

// TODO! caching
export const getDefaultExportOutline = async (documentUri: vscode.Uri) => {
    const result: vscode.DocumentSymbol[] = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', documentUri)
    const defaultExport = result[0]?.children.find(({ name }) => name === 'script')?.children.find(({ name }) => name === 'default')
    if (!defaultExport) console.warn("Can' get default outline from Vetur")

    return defaultExport
}
