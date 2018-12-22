# Description

This is a minimal REST API intended for use with a Continuous Integration system for managing comments on GitHub.

The problem this solves is posting comments in a PR from multiple builds without spamming the comment section. Instead we post just one comment with a table and continue to update it.

# Example Comment

---
### Jenkins Builds
| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| | | | | | | |
| :x: | a088572b | [#3](https://google.pl) | 2018-12-21 12:12:55 | ~12 min | `android` | [:page_facing_up: build log](https://google.plconsoleText) |
| :x: | a088572b | [#3](https://google.pl) | 2018-12-21 12:13:18 | ~12 min | `android` | [:page_facing_up: build log](https://google.plconsoleText) |
| :heavy_check_mark: | a088572b | [#3](https://google.pl) | 2018-12-21 12:13:53 | ~12 min | `ios` | [:package: package](https://google.pl) |
| :heavy_check_mark: | a088572b | [#3](https://google.pl) | 2018-12-21 12:13:34 | ~12 min | `ios` | [:package: package](https://google.pl) |
| :heavy_check_mark: | a088572b | [#3](https://google.pl) | 2018-12-21 12:14:44 | ~12 min | `ios` | [:package: package](https://google.pl) |
---

# API

It exposes just 1 call:

* `POST /builds/:id` - Add a new build result and update the PR comment.
* `POST /builds/:id/refresh` - Re-render the PR comment for given ID.
* `POST /comments` - Show currently managed comments in PRs.

By default it listens on `localhost:8080`.

# Usage

```
$ cat << EOF
{
  "id": 1, "commit": "7367f3d5", "success": true, "platform": "linux", "duration": "~15 min",
  "url": "https://ci.status.im/job/status-react/job/prs/job/linux/job/PR-7123/1/",
  "pkg_url": "https://status-im-prs.ams3.digitaloceanspaces.com/StatusIm-181212-211210-5157d2-pr.AppImage"
}
EOF >> /tmp/body/json

$ curl -s -XPOST http://localhost:8000/builds/7123 -d@/tmp/body.json -H 'Content-Type: application/json'
{ "status": "ok" }

$ curl -s -XPOST http://localhost:8000/builds/7123/refresh
{ "status": "ok" }
```
You can also check all PRs the application knows about:
```
$ curl -s http://localhost:8000/comments
{
  "count": 2,
  "comments": [
    { "pr": "7000", "comment_id": 446940840 },
    { "pr": "7084", "comment_id": 446779864 }
  ]
}
```
# Configuration

There are few environment variables you can set:

* `LISTEN_PORT` - Self explanatory. (Default: `8000`)
* `DB_SAVE_INTERVAL` - How often database is written to disk. (Default: `5000`)
* `DB_PATH` - Path where the [LokiJS](http://lokijs.org/#/) DB file is stored. (Default: `/tmp/builds.db`)
* `GH_TOKEN` - Required for GitHub API access.
* `GH_REPO_OWNER` - Name of owner of repo to manage.
* `GH_REPO_NAME` - Name of GitHub repo to manage.

# Building

* `yarn run start` - For production use.
* `yarn run devel` - For development use.
* `yarn run default` - For building use.
* `yarn run release` - To create and push the docker image use.
