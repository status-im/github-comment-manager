module.exports = `
### Jenkins Builds
| Status | Commit | Platform | Build | Duration | Result |
|-|-|-|-|-|-|
{% for b in builds %}
{% if b.success %}
| :heavy_check_mark: | {{ b.commit }} | \`{{ b.platform }}\` | [{{ b.pr }}#{{ b.id }}]({{ b.url }}) | {{ b.duration }} | [:package: {{ b.platform }} package]({{ b.url }}) |
{% else %}
| :x: | {{ b.commit }} | \`{{ b.platform }}\` | [{{ b.pr }}#{{ b.id }}]({{ b.url }}) | {{ b.duration }} | [:page_facing_up: build log]({{ b.url }}consoleText) |
{% endif %}
{% endfor %}
`
