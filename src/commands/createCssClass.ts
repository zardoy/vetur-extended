import * as vscode from 'vscode'
import { registerExtensionCommand } from 'vscode-framework'
import { getStyleOutline } from '../util'

const skipAtRules = (styleRange: vscode.Range, document: vscode.TextDocument) => {
    const rangeEnd = styleRange.end
    let currentPos = styleRange.start.translate(1) // skip <style> tag

    while (currentPos <= rangeEnd) {
        if (/\s*@.*/.test(document.lineAt(currentPos.line).text)) {
            currentPos = currentPos.translate(1)
            continue
        }
        return currentPos
    }
    return currentPos
}
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
        if (!styleOutline || styleOutline.range.isSingleLine) return

        const styleRange = styleOutline.range
        const normalizedClassName = `.${classMatch[0]} {\n\t\n}\n`

        const classInsertPosition = skipAtRules(styleRange, document)

        await activeEditor.edit(editBuilder => {
            // TODO: find better place to insert generated class (insert elements after block etc)
            editBuilder.insert(classInsertPosition, normalizedClassName)
        })
        const locations: vscode.Location[] = (await vscode.commands.executeCommand('vscode.executeReferenceProvider', document.uri, position)) ?? []

        const cssClassLocation = locations.find(location => location.range.contains(classInsertPosition))

        if (!cssClassLocation) return

        await vscode.commands.executeCommand('editor.action.peekLocations', document.uri, position, [cssClassLocation], 'peek', 'No references')
        // TODO: set cursor positon inside the created empty rule if possible
        await vscode.commands.executeCommand('togglePeekWidgetFocus')
        // activeEditor.selection = new vscode.Selection(cssClassLocation.range.start.translate(1), cssClassLocation.range.start.translate(1))
    })
}
