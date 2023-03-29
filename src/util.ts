import * as vscode from 'vscode'
import { getNormalizedVueOutline } from '@zardoy/vscode-utils/build/vue'

export const interpolationPropRegex = /(?::|@|v-)([-\d\w.])+="([^"]*)$/

export const getDefaultExportOutline = async (documentUri: vscode.Uri) => {
    const outline = await getNormalizedVueOutline(documentUri)
    const defaultExport = outline?.find(({ name }) => name === 'script')?.children.find(({ name }) => name === 'default')
    if (!defaultExport) console.warn("Can't get default outline from Vetur")

    return defaultExport
}

export const getComponentNameOutline = async (documentUri: vscode.Uri) => {
    const outline = await getNormalizedVueOutline(documentUri)
    const componentNameOutline = outline
        ?.find(({ name }) => name === 'script')
        ?.children.find(({ name }) => name === 'default')
        ?.children.find(({ name }) => name === 'name')

    if (!componentNameOutline) console.warn("Can't get component name outline")

    return componentNameOutline
}

export const getComputedOutline = async (documentUri: vscode.Uri) => {
    const outline = await getNormalizedVueOutline(documentUri)

    const computedOutline = outline
        ?.find(({ name }) => name === 'script')
        ?.children.find(({ name }) => name === 'default')
        ?.children.find(({ name }) => name === 'computed')

    if (!computedOutline) console.warn("Can' get computed outline")

    return computedOutline
}
export const getTemplateOutline = async (documentUri: vscode.Uri) => {
    const outline = await getNormalizedVueOutline(documentUri)
    const templateOutline = outline?.find(({ name }) => name === 'template')

    if (!templateOutline) console.warn("Can' get template outline")

    return templateOutline
}

export const getStyleOutline = async (documentUri: vscode.Uri) => {
    const outline = await getNormalizedVueOutline(documentUri)

    const templateOutline = outline?.find(({ name }) => name === 'style' || name === 'style scoped')

    if (!templateOutline) console.warn("Can' get style outline")

    return templateOutline
}
