import * as vscode from 'vscode'
import { getActiveRegularEditor } from '@zardoy/vscode-utils'
import { registerActiveDevelopmentCommand } from 'vscode-framework'
import parseCss from 'postcss/lib/parse'
import { ChildNode, Rule } from 'postcss'
import parser from 'postcss-selector-parser'
import { getLanguageService, TokenType } from 'vscode-html-languageservice'

const normalizedLine = (line: string) => (line.endsWith('\r') ? line.slice(0, -1) : line)

export const registerLinksProvider = () => {
    registerActiveDevelopmentCommand(() => {
        /* CSS Links */
        // const activeEditor = getActiveRegularEditor()
        // if (!activeEditor) return
        // const text = activeEditor.document.getText()
        // let inStyles = false
        // let styles = ''
        // let startLine: number
        // for (const [i, line] of text.split('\n').entries()) {
        //     if (line.startsWith('<style') && normalizedLine(line).endsWith('>')) {
        //         inStyles = true
        //         startLine = i + 1
        //         continue
        //     }
        //     if (normalizedLine(line) === '</style>') break
        //     if (!inStyles) continue
        //     styles += `${line}\n`
        // }
        // const startingOffset = activeEditor.document.offsetAt(new vscode.Position(startLine!, 0))
        // console.time('parse css')
        // // todo compare perf with getSCSSLanguageService from vscode-css-languageservice
        // const parsed = parseCss(styles)
        // console.timeEnd('parse css')
        // const sourceMetadata = parsed.nodes.find(rule => rule.selector === '.popup-confirmation__header')!.source
        // activeEditor.selections = [
        //     new vscode.Selection(
        //         activeEditor.document.positionAt(startingOffset + sourceMetadata.start.offset),
        //         activeEditor.document.positionAt(startingOffset + sourceMetadata.end.offset + 1),
        //     ),
        // ]
        // console.log(sourceMetadata)
        // const collectedClasses: { [className: string]: Array<{ range: vscode.Range }> } = {}
        // // const selectorParser = parser(selectors => {
        // //     selectors.walk(selector => {
        // //         selector.type === 'class'
        // //     })
        // // })
        // const selectors = (parsed.nodes as ChildNode[])
        //     .filter(rule => 'selector' in rule && rule.selector)
        //     .map(rule => {
        //         const selectorParser = parser(selectors => {
        //             selectors.walk(selector => {
        //                 // selector.sourceIndex
        //                 selector.type === 'class'
        //             })
        //         })
        //         const { selector } = rule as Rule
        //         const parsedSelector = selectorParser.processSync(selector)
        //     })
        // console.time('parse selector')
        // console.timeEnd('parse selector')
        // console.log(parsedSelector)
        /* interpolation links */
        const htmlLanguageService = getLanguageService({})
        const scanner = htmlLanguageService.createScanner(vueHtml)
        let token = scanner.scan()
        let attribute: string | undefined
        console.time('scan')
        while (token !== TokenType.EOS) {
            switch (token) {
                case TokenType.AttributeName: {
                    attribute = scanner.getTokenText().toLowerCase()
                    break
                }

                case TokenType.AttributeValue: {
                    const currentAttribute = attribute!
                    attribute = undefined
                    if ([':is', ':ref'].includes(currentAttribute)) break
                    if (![':', 'v-'].some(str => currentAttribute.startsWith(str))) break
                    const value = scanner.getTokenText().toLowerCase()
                    const offset = startOffset + scanner.getTokenOffset()
                    break
                }

                default:
            }

            token = scanner.scan()
        }
    })
    console.timeEnd('scan')
    if (true) return
    vscode.languages.registerDocumentLinkProvider('vue', {
        provideDocumentLinks(document, token) {
            const text = document.getText()
            let inStyles = false
            for (let line of text.split('\n')) {
                if (line.endsWith('\r')) line = line.slice(0, -1)
                if (line.startsWith('<style') && line.endsWith('>')) {
                    inStyles = true
                    continue
                }

                if (line === '</style>') break

                if (!inStyles) continue
            }

            return []
        },
    })
}
