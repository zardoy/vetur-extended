import parseCss from 'postcss/lib/parse'
import { ChildNode, Rule } from 'postcss'
import parser from 'postcss-selector-parser'
import v from 'vscode-html-languageservice'

const { getLanguageService, TokenType } = v

const someHtml = `
<div class="body">
<p>test</p>
</div>
`

const vueHtml = `
<div class="body">
        <LightSection
            v-for="(light, signalIndex) in Object.keys(allSignals)"
            :key="light"
            :disabled="forceDisableLight || light !== program[trafficLightState.signalIndex]![0]"
            :css-color="allSignals[light]?.cssColorOverride ?? light"
            :current-cooldown="light === program[trafficLightState.signalIndex]![0] && !allSignals[light]?.hideCooldown && trafficLightState.currentCooldown"
            :data-test="light"
            class="segment"
            role="button"
            @click="changeLight(signalIndex)"
        />
    </div>

`

const str = `
  test.some-test, dfs.some_another_test#fe {

  }
`

// console.time('parse css')
// // todo compare perf with getSCSSLanguageService from vscode-css-languageservice
// const parsed = parseCss(str)
// console.timeEnd('parse css')

// const collectedClasses = {}

// SUPER lean class matcher: p.class will match <div class="class"/> .test .a will match any .test and .a independently in file
const htmlLanguageService = getLanguageService({})
const scanner = htmlLanguageService.createScanner(vueHtml)
let token = scanner.scan()
let attribute: string | undefined
const attributes = []
console.time('scan')
while (token !== TokenType.EOS) {
    switch (token) {
        case TokenType.AttributeName:
            attribute = scanner.getTokenText().toLowerCase()
            attributes.push(attribute)
            break
        case TokenType.AttributeValue: {
            // const currentAttribute = attribute
            // attribute = null
            // if ([':is', ':ref'].includes(currentAttribute)) break
            // if (![':', 'v-'].some(str => currentAttribute.startsWith(str))) break
            // const value = scanner.getTokenText().toLowerCase()
            attributes.push(scanner.getTokenText())
            // const offset = startOffset + scanner.getTokenOffset()
            break
        }
    }
    token = scanner.scan()
}

console.timeEnd('scan')
console.log(attributes)
// const thisClasses = [] as string[]
// const selectorParser = parser(selectors => {
//     let i = 0
//     // console.log(selectors)
//     selectors.walk(selector => {
//         //@ts-ignore
//         console.log(1, selector.type, selector.value, selector.nodes)
//         if (selector.type === 'selector') {
//             const classes = selector.nodes.filter(node => node.type === 'class').map(selector => selector.value)
//             thisClasses.push(...(classes as any[]))
//             i++
//         }
//     })
// })

// const selectors = (parsed.nodes as ChildNode[]).filter(rule => 'selector' in rule && rule.selector).map(rule => (rule as Rule).selector)
// console.time('parse selector')
// const parsedSelector = selectorParser.processSync('div.some-class#test, .test .a')
// console.timeEnd('parse selector')
// console.log(thisClasses)
