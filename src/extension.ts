import { registerGenerateJsconfigAliases } from './commands/generateJsconfigAliases'
import { registerPrintWebpackJsconfigAliases } from './commands/printWebpackJsconfigAliases'
import { registerExpandTag } from './commands/expandTag'
import { registerComponentsLinks } from './componentsLinks'
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
    registerComponentsLinks()
    registerPrintWebpackJsconfigAliases()
    registerExpandTag()
    // registerLinksProvider()
}
