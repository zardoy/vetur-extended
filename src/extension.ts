import * as vscode from 'vscode'
import { registerActiveDevelopmentCommand } from 'vscode-framework'
import { registerGenerateJsconfigAliases } from './commands/generateJsconfigAliases'
import { registerFindReferences } from './findReferences'
import { registerGotoDefinition } from './gotoDefinition'
import { registerHover } from './hover'
// import { registerLinksProvider } from './links'
import { registerTemplateCompletion } from './templateCompletion'

export const activate = () => {
    registerFindReferences()
    registerTemplateCompletion()
    registerGotoDefinition()
    registerHover()
    registerGenerateJsconfigAliases()
    // registerLinksProvider()
    registerActiveDevelopmentCommand(async () => {
        const editor = vscode.window.activeTextEditor
        if (!editor) return
        const { document } = editor
        const componentRange = document.getWordRangeAtPosition(editor.selection.end, /<\/?([-\d\w])+/) // (?=(\s|\/?>))
        if (!componentRange) return
        // const prefixText = document.getText(wordRange.with(wordRange.start.translate(0, -2), wordRange.start))
        const rangeText = document.getText(componentRange)
        const componentName = /<\/?(([-\d\w])+)/.exec(rangeText)?.[1]
        console.log('componentName', componentName)
        // console.time('highlights')
        // const highlights: vscode.DocumentHighlight[] = await vscode.commands.executeCommand(
        //     'vscode.executeDocumentHighlights',
        //     editor.document.uri,
        //     editor.selection.end,
        // )
        // console.timeEnd('highlights')
        // console.log(
        //     'highlights',
        //     highlights.map(highlight => [vscode.DocumentHighlightKind[highlight.kind! ?? -1], highlight.range.start, highlight.range.end]),
        // )
    })
}
