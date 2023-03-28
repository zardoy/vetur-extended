import * as vscode from 'vscode'
import { registerExtensionCommand } from 'vscode-framework'
import { getStyleOutline } from '../util'

export const registerCreateCssClass = () => {
    registerExtensionCommand('createCssClass', async () => {
        const activeEditor = vscode.window.activeTextEditor
        if (!activeEditor) return

        const {
            document,
            selection: { active: position },
        } = activeEditor

        const cssClassNameRegex = /[\w\d-]+/

        const classMatch = cssClassNameRegex.exec(document.getText(document.getWordRangeAtPosition(position)))
        if (!classMatch) return

        const styleOutline = await getStyleOutline(document.uri)
        if (!styleOutline) return

        const styleRange = styleOutline.range
        const styleRangePos = document.positionAt(document.offsetAt(styleRange.start))
        const normalizedClassName = `.${classMatch[0]} {\n\t\n}\n`

        const classInsertPosition = styleRangePos.translate(1)
        await activeEditor.edit(editBuilder => {
            // TODO: find better place to insert generated class (insert elements after block etc)
            editBuilder.insert(classInsertPosition, normalizedClassName)
        })
        const locations: vscode.Location[] = (await vscode.commands.executeCommand('vscode.executeReferenceProvider', document.uri, position)) ?? []

        const cssClassLocation = locations.find(location => location.range.contains(classInsertPosition))

        if (!cssClassLocation) return

        await vscode.commands.executeCommand(
            'editor.action.peekLocations',
            document.uri,
            cssClassLocation ? position : locations[0]?.range.start ?? position,
            [cssClassLocation],
            'peek',
            'No references',
        )
        // TODO: set cursor positon inside the created empty rule if possible
        await vscode.commands.executeCommand('togglePeekWidgetFocus')
        // activeEditor.selection = new vscode.Selection(cssClassLocation.range.start.translate(1), cssClassLocation.range.start.translate(1))
    })
}
