import { registerFindReferences } from "./findReferences"
import { registerTemplateCompletion } from "./templateCompletion"

export const activate = () => {
    registerFindReferences()
    registerTemplateCompletion()
}
