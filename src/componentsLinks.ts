/* eslint-disable no-await-in-loop */
import * as vscode from 'vscode'
import { getExtensionSetting } from 'vscode-framework'
import { firstExists } from '@zardoy/vscode-utils/build/fs'
import { Utils } from 'vscode-uri'

export const registerComponentsLinks = () => {
    vscode.languages.registerDocumentLinkProvider('vue', {
        async provideDocumentLinks(document, token) {
            if (!getExtensionSetting('enableLinks')) return

            const text = document.getText()
            const matches: RegExpMatchArray[] = [...text.matchAll(/(\s*import .+ from )(['"].+['"])/g)]
            const links: vscode.DocumentLink[] = []
            for (const match of matches) {
                if (!['./', '../'].some(predicate => match[2]!.slice(1).startsWith(predicate))) continue

                const startIdx = match.index! + match[1]!.length
                const endIdx = startIdx + match[2]!.length
                let path = match[2]!.slice(1, -1)
                const questionmarkIndex = /\?/.exec(path)?.index
                if (questionmarkIndex) path = path.slice(0, questionmarkIndex)

                const importUri = vscode.Uri.joinPath(Utils.dirname(document.uri), path)
                const targetUri = await firstExists(
                    ['/index.vue', '', '.vue'].map(ext => {
                        const uri = importUri.with({
                            path: `${importUri.path}${ext}`,
                        })
                        return { uri, name: uri }
                    }),
                )
                if (targetUri === undefined) continue

                links.push({
                    range: new vscode.Range(document.positionAt(startIdx), document.positionAt(endIdx)),
                    target: targetUri,
                })
            }

            return links
        },
    })
}
