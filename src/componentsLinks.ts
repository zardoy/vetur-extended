/* eslint-disable no-await-in-loop */
import * as vscode from 'vscode'
import { getExtensionSetting } from 'vscode-framework'
import { firstExists } from '@zardoy/vscode-utils/build/fs'
import { Utils } from 'vscode-uri'

export const importsCache = new Map<string, vscode.Uri>()

export const registerComponentsLinks = () => {
    vscode.languages.registerDocumentLinkProvider('vue', {
        async provideDocumentLinks(document, token) {
            if (!getExtensionSetting('enableLinks')) return

            const text = document.getText()
            const matches: RegExpMatchArray[] = [...text.matchAll(/(import (.+) from )(['"].+['"])/g)]
            const links: vscode.DocumentLink[] = []
            for (const match of matches) {
                const importingPath = match[3]!;
                if (!['./', '../'].some(predicate => importingPath.slice(1).startsWith(predicate))) continue

                const startIdx = match.index! + match[1]!.length
                const endIdx = startIdx + importingPath.length
                let path = importingPath.slice(1, -1)
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
                const importingIdentifier = match[2]!
                if (/(\w|\d)+/.test(importingIdentifier)) importsCache.set(importingIdentifier, targetUri)

                links.push({
                    range: new vscode.Range(document.positionAt(startIdx), document.positionAt(endIdx)),
                    target: targetUri,
                })
            }

            return links
        },
    })
}
