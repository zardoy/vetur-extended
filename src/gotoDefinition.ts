import * as vscode from 'vscode'
import { pascalCase, camelCase } from 'change-case'
import { getExtensionCommandId, getExtensionSetting, getExtensionSettingId } from 'vscode-framework'
import { documentsImportsCache } from './componentsLinks'
import { getDefaultExportOutline, interpolationPropRegex } from './util'

export const registerGotoDefinition = () => {
    // attribute definition
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
    // component definition
    vscode.languages.registerDefinitionProvider('vue', {
        provideDefinition(document, position, token) {
            const componentRange = document.getWordRangeAtPosition(position, /<\/?([-\d\w])+/) // (?=(\s|\/?>))
            if (!componentRange) return
            const rangeText = document.getText(componentRange)
            const componentName = /<\/?(([-\d\w])+)/.exec(rangeText)![1]!
            const importsCache = documentsImportsCache.get(document.uri.toString())
            if (!importsCache) {
                console.warn('no importsCache!')
                return
            }

            // console.log('lookup', componentName, importsCache)
            const uri = importsCache.get(componentName) ?? importsCache.get(pascalCase(componentName)) ?? importsCache.get(camelCase(componentName))
            if (!uri) return
            const startPos = new vscode.Position(0, 0)
            const range = new vscode.Range(startPos, startPos.with(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY))
            // const previewRange = new vscode.Range(startPos.with(1), startPos.with(6));
            return [{ range, targetRange: range, uri, targetUri: uri }]
        },
    })
    const setReferenceButtonVisibility = () => {
        const isMenuButtonEnabled = getExtensionSetting('enableFindReferencesButton')
        void vscode.commands.executeCommand('setContext', getExtensionCommandId('findComponentReferences'), isMenuButtonEnabled)
    }

    setReferenceButtonVisibility()

    vscode.workspace.onDidChangeConfiguration(({ affectsConfiguration }) => {
        if (affectsConfiguration(getExtensionSettingId('enableFindReferencesButton'))) setReferenceButtonVisibility()
    })
}
