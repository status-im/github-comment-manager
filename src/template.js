module.exports = `
### Jenkins Builds
| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
{{#each builds}}
{{#commitChanged ../builds @index}}
| | | | | | | |
{{/commitChanged}}
{{#if this.success}}
| :heavy_check_mark: | {{ this.commit }} | [{{ this.id }}]({{ this.url }}) | {{date this.meta.created }} | {{ this.duration }} | \`{{ this.platform }}\` | [:package: package]({{ this.pkg_url }}) |
{{else}}
| :x: | {{ this.commit }} | [{{ this.id }}]({{ this.url }}) | {{date this.meta.created }} | {{ this.duration }} | \`{{ this.platform }}\` | [:page_facing_up: build log]({{ this.pkg_url }}consoleText) |
{{/if}}
{{/each}}
`
