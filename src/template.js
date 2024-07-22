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
{{#if this.success }}
  {{#if this.pkg_url }}
| :heavy_check_mark: | {{ this.commit }} | [{{ this.id }}]({{ this.url }}) | {{formatDate this.meta.created }} | {{ shortenDuration this.duration }} | \`{{ this.platform }}\` | [{{ fileIcon this.pkg_url }}\`{{ fileExt this.pkg_url }}\`]({{ this.pkg_url }}) {{ genQRCodeUrl this.pkg_url }}|
  {{else}}
| :interrobang: | {{ this.commit }} | [{{ this.id }}]({{ this.url }}) | {{formatDate this.meta.created }} | {{ shortenDuration this.duration }} | \`{{ this.platform }}\` | [{{ fileIcon "log" }}\`log\`]({{ this.url }}consoleText) |
  {{/if}}
{{else}}
  {{#if this.pkg_url }}
| :heavy_multiplication_x: | {{ this.commit }} | [{{ this.id }}]({{ this.url }}) | {{formatDate this.meta.created }} | {{ shortenDuration this.duration }} | \`{{ this.platform }}\` | [{{ fileIcon this.pkg_url }}\`{{ fileExt this.pkg_url }}\`]({{ this.pkg_url }}) {{ genQRCodeUrl this.pkg_url }}|
  {{else}}
| :x: | {{ this.commit }} | [{{ this.id }}]({{ this.url }}) | {{formatDate this.meta.created }} | {{ shortenDuration this.duration }} | \`{{ this.platform }}\` | [{{ fileIcon "log" }}\`log\`]({{ this.url }}consoleText) |
  {{/if}}
{{/if}}
`.trim()

export default {
  main,
  partials: {
    buildRow,
    buildsTable
  }
}
