import * as vscode from 'vscode'
import { registerExtensionCommand } from 'vscode-framework'
import * as html from 'vscode-html-languageservice'
import { getNormalizedVueOutline } from '@zardoy/vscode-utils/build/vue'

export const registerCssClasesFromTemplate = () => {
    registerExtensionCommand('copyStylesWithClasesFromTemplate', async () => {
        const activeEditor = vscode.window.activeTextEditor
        if (!activeEditor || activeEditor.viewColumn === undefined) return

        const outline = await getNormalizedVueOutline(activeEditor.document.uri)
        const templateOutline = outline?.find(item => item.name === 'template')
        if (!templateOutline) return
        const templateText = activeEditor.document.getText(templateOutline.range)
        const insertText = parseHTMLContent(templateText)
        await vscode.env.clipboard.writeText(insertText.join('\n'))
    })
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const parseHTMLContent = (content: string) => {
    const languageService = html.getLanguageService()
    const parsed = languageService.parseHTMLDocument({
        getText: () => content,
        languageId: 'html',
        lineCount: content.split('\n').length,
        offsetAt: () => 0,
        positionAt: () => 0 as any,
        uri: '/',
        version: 1,
    })
    const classes: string[] = []
    const extractClasses = (node: html.Node) => {
        const className = node.attributes?.class?.slice(1, -1)
        if (className)
            classes.push(
                ...className
                    .split(/ |\n\r?/)
                    .map(str => str.trim())
                    .filter(Boolean),
            )

        for (const child of node.children) extractClasses(child)
    }

    extractClasses(parsed.roots[0]!)
    return classes.map(className => `.${className} {\n\t\n}`)
}
