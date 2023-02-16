export type Configuration = {
    searchReferencesGlob: string
    /**
     * Where to show completions in template attributes
     * @default "everywhere"
     * */
    showCompletions: 'disabled' | 'onlyStart' | 'everywhere'
    /**
     * Whether to enable links to files in supported import statements
     * @default true
     * */
    enableLinks: boolean
    /**
     * (component definitions) Try to resolve imports using aliases from root webpack config
     * @default true
     * */
    enableWebpackAliases: boolean
    /**
     * Whether to enable component references button
     * @default true
     */
    enableFindReferencesButton: boolean
    /**
     *  Type space after / in <div /> to expand the tag
     *  @default true
     */
    enableAutoExpandTag: boolean
    /**
     *  Whether to enable code action for quick store registration in computed field
     *  @default true
     */
    enablePiniaStoreRegistrationCodeAction: boolean
    /**
     *
     *  @default ".*?\/stores/.*"
     */
    piniaStorePathRegex: string
    /**
     *  Copied component name case
     *  @default "preserve"
     */
    copyComponentNameCase: 'preserve' | 'camelCase'
}
