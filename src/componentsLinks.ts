/* eslint-disable no-await-in-loop */
import * as vscode from 'vscode'
import { getExtensionSetting } from 'vscode-framework'
import { firstExists } from '@zardoy/vscode-utils/build/fs'
import { readWebpackAliases } from '@zardoy/vscode-utils/build/readWebpackAliases'
import { Utils } from 'vscode-uri'

export const documentsImportsCache = new Map</* stringified uri */ string, Map<string, vscode.Uri>>()

export const registerComponentsLinks = () => {
    vscode.workspace.onDidCloseTextDocument(document => {
        documentsImportsCache.delete(document.uri.toString())
    })

    vscode.languages.registerDocumentLinkProvider('vue', {
        async provideDocumentLinks(document) {
            if (!getExtensionSetting('enableLinks')) return
            // eslint-disable-next-line unicorn/no-await-expression-member
            const webpackAliases = getExtensionSetting('enableWebpackAliases') ? (await readWebpackAliases())?.aliases ?? [] : []

            const text = document.getText()
            const matches: RegExpMatchArray[] = [
                ...text.matchAll(/(import (.+)\s+from )(['"].+['"])/g),
                ...text.matchAll(/(\s*(?:let|const)\s*(\w+).+?import\((?:\/\*.*?\*\/\s*)?)(['"].+['"])\)\)/g),
            ]

            const links: vscode.DocumentLink[] = []
            for (const match of matches) {
                const importRaw = match[3]!
                let importPath = importRaw.slice(1, -1)
                const questionmarkIndex = /\?/.exec(importPath)?.index
                if (questionmarkIndex) importPath = importPath.slice(0, questionmarkIndex)
                let aliasedUri: vscode.Uri | undefined

                for (const { name, uri } of webpackAliases)
                    if (importPath === name || importPath.startsWith(`${name}/`))
                        aliasedUri = vscode.Uri.joinPath(uri, importPath.slice(name.length + 1))

                if (!aliasedUri && !['./', '../'].some(predicate => importPath.startsWith(predicate))) continue

                const startIdx = match.index! + match[1]!.length
                const endIdx = startIdx + importRaw.length
                const importUri = aliasedUri ?? vscode.Uri.joinPath(Utils.dirname(document.uri), importPath)
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
                // links can be updated in random order if several editors are opened
                if (/(\w|\d)+/.test(importingIdentifier)) {
                    const stringUri = document.uri.toString()
                    if (!documentsImportsCache.has(stringUri)) documentsImportsCache.set(stringUri, new Map())
                    documentsImportsCache.get(stringUri)!.set(importingIdentifier, targetUri)
                }

                links.push({
                    range: new vscode.Range(document.positionAt(startIdx), document.positionAt(endIdx)),
                    target: targetUri,
                })
            }

            return links
        },
    })
}
