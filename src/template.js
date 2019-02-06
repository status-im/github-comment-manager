const main = `
### Jenkins Builds
{{#if archived.length }}
<details>
<summary>Click to see older builds ({{ archived.length }})</summary>

{{> buildsTable archived }}
</details>

{{/if}}
{{> buildsTable visible }}
`
const buildsTable = `
| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
{{#each this}}
{{#commitChanged ../this @index}}
| | | | | | | |
{{/commitChanged}}
{{> buildRow }}
{{/each}}
`.trim()
const buildRow = `
{{#if this.success}}
| :heavy_check_mark: | {{ this.commit }} | [{{ this.id }}]({{ this.url }}) | {{date this.meta.created }} | {{ shortenDuration this.duration }} | \`{{ this.platform }}\` | [:package: {{fileExt this.pkg_url }}]({{ this.pkg_url }}) |
{{else}}
| :x: | {{ this.commit }} | [{{ this.id }}]({{ this.url }}) | {{date this.meta.created }} | {{ shortenDuration this.duration }} | \`{{ this.platform }}\` | [:page_facing_up: build log]({{ this.url }}consoleText) |
{{/if}}
`.trim()
module.exports = { main, partials: {buildRow, buildsTable} }
