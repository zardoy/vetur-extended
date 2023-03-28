import { registerCssClasesFromTemplate } from './commands/cssClasesFromTemplate'
import { registerGenerateJsconfigAliases } from './commands/generateJsconfigAliases'
import { registerPrintWebpackJsconfigAliases } from './commands/printWebpackJsconfigAliases'
import { registerExpandTag } from './commands/expandTag'
import { registerComponentsLinks } from './componentsLinks'
import { registerFindReferences } from './findReferences'
import { registerGotoDefinition } from './gotoDefinition'
import { registerHover } from './hover'
import { registerTemplateCompletion } from './templateCompletion'
import { registerPiniaCodeactions } from './piniaCodeActions'
import focusVuexMapper from './commands/focusVuexMapper'
import { registerCopyComponentName } from './commands/copyComponentName'
import { registerCreateCssClass } from './commands/createCssClass'

export const activate = () => {
    registerFindReferences()
    registerTemplateCompletion()
    registerGotoDefinition()
    registerHover()
    registerGenerateJsconfigAliases()
    registerComponentsLinks()
    registerPrintWebpackJsconfigAliases()
    registerExpandTag()
    registerCssClasesFromTemplate()
    focusVuexMapper()
    registerCopyComponentName()
    registerPiniaCodeactions()
    registerCreateCssClass()
}
