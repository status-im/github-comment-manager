module.exports = `
### Jenkins Builds
| :grey_question: | Commit | When | Platform | Build | Duration | Result |
|-|-|-|-|-|-|-|
{% for b in builds -%}
{% if b.success -%}
| :heavy_check_mark: | {{ b.commit }} | {{ b.when }} | \`{{ b.platform }}\` | [{{ b.pr }}#{{ b.id }}]({{ b.url }}) | {{ b.duration }} | [:package: {{ b.platform }}]({{ b.pkg_url }}) |
{% else -%}
| :x: | {{ b.commit }} | {{ b.when }} | \`{{ b.platform }}\` | [{{ b.pr }}#{{ b.id }}]({{ b.url }}) | {{ b.duration }} | [:page_facing_up: build log]({{ b.pkg_url }}consoleText) |
{%- endif %}
{%- endfor %}
`
