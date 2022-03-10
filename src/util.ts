import * as vscode from 'vscode'

export const interpolationPropRegex = /(?::|@|v-)(\w+)="([^"]*)$/

export const getDefaultExportOutline = async (documentUri: vscode.Uri) => {
    const result: vscode.DocumentSymbol[] = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', documentUri)
    const defaultExport = result[0]?.children.find(({ name }) => name === 'script')?.children.find(({ name }) => name === 'default')
    return defaultExport
}
