export type Configuration = {
    searchReferencesGlob: string
    /**
     * Where to show completions in template attributes
     * @default "everywhere"
     * */
    showCompletions: 'disabled' | 'onlyStart' | 'everywhere'
}
