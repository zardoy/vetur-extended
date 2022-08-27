import * as vscode from 'vscode'
import { getActiveRegularEditor, rangeToSelection } from '@zardoy/vscode-utils'
import { registerExtensionCommand, showQuickPick } from 'vscode-framework'
import { getDefaultExportOutline } from '../util'

export default () => {
    registerExtensionCommand('focusVuexMapper', async ({ command }) => {
        const editor = getActiveRegularEditor()
        if (!editor) return
        const { document } = editor
        const defaultExport = await getDefaultExportOutline(document.uri)
        if (!defaultExport) return
        const vuexMappers = {
            mapState: 'computed',
            mapGetters: 'computed',
            mapMutations: 'methods',
            mapActions: 'methods',
        }
        const vuexMappersPositions = Object.fromEntries(
            Object.entries(vuexMappers).map(([type, option]) => {
                const containingOutline = defaultExport.children.find(({ name }) => name === option)
                const pos = containingOutline?.children.find(
                    ({ name, range }) =>
                        // find vuexMapper
                        name === '<unknown>' && document.getText(range).startsWith(`...${type}`),
                )?.range.end
                return [type, [pos, containingOutline]] as const
            }),
        )
        const selectedType = await showQuickPick(
            Object.entries(vuexMappersPositions).map(([type, [pos]]) => ({
                label: type,
                description: pos ? `L: ${pos.line}` : 'will be created',
                value: type,
            })),
            {
                title: command,
            },
        )
        if (!selectedType) return
        const [pos, containingOutline] = vuexMappersPositions[selectedType]!
        if (pos) {
            editor.selection = new vscode.Selection(pos, pos)
        } else {
            const insertMapperSnippet = `...${selectedType}$1($2)`
            const insertSnippet = `\n${containingOutline ? insertMapperSnippet : `${vuexMappers[selectedType]}: {\n\t${insertMapperSnippet}\n}`}`
            // assumes that { on its own line
            const focusPos = document.lineAt((containingOutline ?? defaultExport).range.end.translate(-1)).range.end
            await editor.insertSnippet(new vscode.SnippetString(insertSnippet), focusPos)
        }
    })
}
