/* eslint-disable no-await-in-loop */
import * as vscode from 'vscode'
import { getExtensionSetting } from 'vscode-framework'
import { Utils } from 'vscode-uri'

const fileExists = async (uri: vscode.Uri): Promise<boolean> => {
    try {
        await vscode.workspace.fs.stat(uri)
        return true
    } catch {
        return false
    }
}

export const registerComponentsLinks = () => {
    vscode.languages.registerDocumentLinkProvider('vue', {
        async provideDocumentLinks(document, token) {
            if (!getExtensionSetting('enableLinks')) return

            const text = document.getText()
            const matches: RegExpMatchArray[] = [...text.matchAll(/( from )('.+')/g)]
            const links: vscode.DocumentLink[] = []
            for (const match of matches) {
                if (!['./', '../'].some(predicate => match[2]!.slice(1).startsWith(predicate))) continue

                const startIdx = match.index! + match[1]!.length
                const endIdx = startIdx + match[2]!.length
                let path = match[2]!.slice(1, -1)
                const questionmarkIndex = /\?/.exec(path)?.index
                if (questionmarkIndex) path = path.slice(0, questionmarkIndex)

                const uri = vscode.Uri.joinPath(Utils.dirname(document.uri), path)
                const variantsToCheck = ['/index.vue', '', '.vue'].map(ext =>
                    uri.with({
                        path: `${uri.path}${ext}`,
                    }),
                )
                const existingVariants = await Promise.all(variantsToCheck.map(async variant => (async () => fileExists(variant))()))
                const variantIndex = existingVariants.findIndex(existingVariant => existingVariant)
                if (variantIndex === -1) continue

                links.push({
                    range: new vscode.Range(document.positionAt(startIdx), document.positionAt(endIdx)),
                    target: variantsToCheck[variantIndex]!,
                })
            }

            return links
        },
    })
}
