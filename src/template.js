module.exports = `
### Jenkins Builds
| :grey_question: | Commit | Build | Finished | Duration | Platform | Result |
|-|-|-|-|-|-|-|
{% for b in builds -%}
{%- if b.success -%}
| :heavy_check_mark: | {{ b.commit }} | [#{{ b.id }}]({{ b.url }}) | {{ b.meta.created | date }} | {{ b.duration }} | \`{{ b.platform }}\` | [:package: package]({{ b.pkg_url }}) |
{% else -%}
| :x: | {{ b.commit }} | [#{{ b.id }}]({{ b.url }}) | {{ b.meta.created | date }} | {{ b.duration }} | \`{{ b.platform }}\` | [:page_facing_up: build log]({{ b.pkg_url }}consoleText) |
{% endif -%}
{%- endfor -%}
`
