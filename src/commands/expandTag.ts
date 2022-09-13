import * as vscode from 'vscode'
import { getActiveRegularEditor } from '@zardoy/vscode-utils'
import { findCurrentOutlineItem } from '@zardoy/vscode-utils/build/outline'
import { equals } from 'rambda'
import { getExtensionCommandId, getExtensionSetting, registerExtensionCommand } from 'vscode-framework'

type TranslatePos = [line: number, character: number]
const getTextSafe = (
    document: vscode.TextDocument,
    originalPosition: vscode.Position,
    expandBefore: TranslatePos | undefined = [0, 0],
    expandAfter: TranslatePos = [0, 0],
) => {
    const positionTranslateSafe = (pos: vscode.Position, translate: TranslatePos) => {
        const newTranslate = [...translate]
        if (pos.line + translate[0] < 0) newTranslate[0] = 0
        if (pos.character + translate[1] < 0) newTranslate[1] = 0
        return pos.translate(...newTranslate)
    }

    const positionBefore = positionTranslateSafe(originalPosition, expandBefore)
    const positionAfter = positionTranslateSafe(originalPosition, expandAfter)
    return document.getText(new vscode.Range(positionBefore, positionAfter))
}

const outlineBasedLangs = ['vue', 'svelte']
const allSupportedLangs = new Set([...outlineBasedLangs, 'typescriptreact', 'javascriptreact'])

export const registerExpandTag = () => {
    registerExtensionCommand('expandTag', async () => {
        const activeEditor = getActiveRegularEditor()
        if (!activeEditor) return
        const position = activeEditor.selection.end
        const { document } = activeEditor
        if (!outlineBasedLangs.includes(document.languageId)) return
        const outline: vscode.DocumentSymbol[] = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri)
        const outlineItem = findCurrentOutlineItem(outline, position)
        if (!outlineItem) return
        const tagName = /^([-\w]+)/i.exec(outlineItem.name)?.[1]
        if (!tagName) return
        const tagEndPos = outlineItem.range.end
        const removeStartOffset = / ?\/ ?>/.exec(getTextSafe(document, tagEndPos, [0, -3]))?.[0]?.length ?? 2
        const newCursorPosition = tagEndPos.translate(0, -removeStartOffset + 1)
        await activeEditor.edit(builder => {
            builder.delete(new vscode.Range(tagEndPos.translate(0, -removeStartOffset), tagEndPos.translate(0, -1)))
            builder.insert(tagEndPos, `</${tagName}>`)
        })
        activeEditor.selection = new vscode.Selection(newCursorPosition, newCursorPosition)
    })

    if (!getExtensionSetting('enableAutoExpandTag')) return

    vscode.workspace.onDidChangeTextDocument(async ({ document, contentChanges }) => {
        const activeEditor = getActiveRegularEditor()
        if (document.uri !== activeEditor?.document.uri || !allSupportedLangs.has(activeEditor.document.languageId)) return
        if (
            !equals(
                contentChanges.map(({ text }) => text),
                [' '],
            )
        )
            return
        const pos = contentChanges[0]!.range.end
        const textBefore = getTextSafe(document, pos, [0, -1])
        const textAfter = getTextSafe(document, pos, [0, 2])
        // <div / >
        if (textBefore !== '/' || textAfter !== ' >') return
        await activeEditor.edit(
            builder => {
                builder.delete(new vscode.Selection(pos, pos.translate(0, 1)))
            },
            {
                undoStopAfter: false,
                undoStopBefore: false,
            },
        )
        await vscode.commands.executeCommand(getExtensionCommandId('expandTag'))
    })
}
