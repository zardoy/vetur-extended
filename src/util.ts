import * as vscode from 'vscode'
import { getNormalizedVueOutline } from '@zardoy/vscode-utils/build/vue'

export const interpolationPropRegex = /(?::|@|v-)([-\d\w.])+="([^"]*)$/

export const getDefaultExportOutline = async (documentUri: vscode.Uri) => {
    const outline = await getNormalizedVueOutline(documentUri)
    const defaultExport = outline?.find(({ name }) => name === 'script')?.children.find(({ name }) => name === 'default')
    if (!defaultExport) console.warn("Can' get default outline from Vetur")

    return defaultExport
}
