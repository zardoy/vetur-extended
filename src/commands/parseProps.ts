import * as vscode from 'vscode'
import { registerExtensionCommand } from 'vscode-framework'
import { Utils } from 'vscode-uri'

export const parseProps = () => {
    registerExtensionCommand('parseProps', async () => {
        const activeEditor = vscode.window.activeTextEditor
        if (!activeEditor || activeEditor.viewColumn === undefined) return
        const componentsPath = vscode.Uri.joinPath(Utils.dirname(activeEditor.document.uri), 'PATH')

        try {
            const componentsToParse = await vscode.workspace.fs.readDirectory(componentsPath)
            const componentsNames = componentsToParse.map(([name]) => name)

            console.log('componentsToParse', componentsToParse)

            const generateInterfaces = async (componentsToParse: string[]) => {
                const results: string[] = []
                for (const component of componentsToParse) {
                    const path = `/${component}/index.js`

                    const uri = vscode.Uri.joinPath(Utils.dirname(activeEditor.document.uri), path)

                    // eslint-disable-next-line unicorn/no-await-expression-member, no-await-in-loop
                    const contents = (await vscode.workspace.fs.readFile(uri)).toString()

                    const propsData = /props:{(.*?)},(?:computed|methods|data|provide):/g.exec(contents)![1]!
                    const propsNames = [...propsData.matchAll(/([\w\d]+):{+/g)].map(item => item[1])
                    const componentName = /\/(Tc.*)\//.exec(path)?.[1] ?? 'fake'

                    // eslint-disable-next-line unicorn/no-array-reduce
                    const interfaceValues = propsNames.reduce((acc, name) => {
                        acc = `${acc!}\n\t${name!}: any`
                        return acc
                    }, '')
                    const generatedInterface = `interface ${componentName}Props {\t${interfaceValues!}\n}`

                    console.log('generatedInterface', generatedInterface)
                    results.push(generatedInterface)
                }

                await vscode.env.clipboard.writeText(results.join('\n'))
            }

            const generateReturnTypes = async (componentsToParse: string[]) => {
                const returnTypes: string[] = []
                for (const componentName of componentsToParse)
                    returnTypes.push(`declare const ${componentName}: new () => {\n\t$props: ${componentName}Props\n}`)
                await vscode.env.clipboard.writeText(returnTypes.join('\n'))
            }

            const generateGlobalComponents = async (componentsToParse: string[]) => {
                const globalComponents: string[] = []
                for (const componentName of componentsToParse) globalComponents.push(`${componentName}: typeof ${componentName}`)
                await vscode.env.clipboard.writeText(globalComponents.join('\n'))
            }

            await generateInterfaces(componentsNames)
            // await generateReturnTypes(componentsNames)
            // await generateGlobalComponents(componentsNames)
        } catch {}
    })
}
