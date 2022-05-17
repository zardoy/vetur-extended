export type Configuration = {
    searchReferencesGlob: string;
    /**
     * Where to show completions in template attributes
     * @default "everywhere"
     * */
    showCompletions: 'disabled' | 'onlyStart' | 'everywhere';
    /**
     * Whether to enable links to files in supported import statements
     * @default true
     * */
    enableLinks: boolean;
};
