import { registerCssClasesFromTemplate } from './commands/cssClasesFromTemplate'
import { registerGenerateJsconfigAliases } from './commands/generateJsconfigAliases'
import { registerPrintWebpackJsconfigAliases } from './commands/printWebpackJsconfigAliases'
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
    registerCssClasesFromTemplate()
    // registerLinksProvider()
}
