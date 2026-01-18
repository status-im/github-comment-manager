# Description

This is a minimal REST API intended for use with a Continuous Integration system for managing comments on GitHub.

The problem this solves is posting comments in a PR from multiple builds without spamming the comment section. Instead we post just one comment with a table and continue to update it.

# Example Comment

---
### Jenkins Builds
| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| :x: | a088572b | [#3](https://example.org) | 2018-12-21 12:13:18 | ~12 min | `android` | [:page_facing_up:`log`](https://example.org) |
| :heavy_check_mark: | a088572b | [#3](https://example.org) | 2018-12-21 12:13:53 | ~12 min | `ios` | [:package:`api`](https://example.org) |
| :heavy_check_mark: | a088572b | [#3](https://example.org) | 2018-12-21 12:13:34 | ~12 min | `android` | [:package:`apk`](https://example.org) [:calling:](https://chart.apis.google.com/chart?cht=qr&chs=400x400&chld=L%7C%0A0&chl=https%3A%2F%2Fexample.org) |
| :heavy_check_mark: | a088572b | [#3](https://example.org) | 2018-12-21 12:14:44 | ~12 min | `windows` | [:package:`exe`](https://example.org) |
| :interrobang: | a088572b | [#3](https://example.org) | 2018-12-21 12:15:37 | ~13 min | `macos` | [:page_facing_up:`log`](https://example.org) |
| :heavy_multiplication_x: | a088572b | [#3](https://example.org) | 2018-12-21 12:16:40 | ~12 min | `linux` | [:package:`pkg`](https://unknown.example.org/path/package) |
---

# API

It exposes 3 calls:

* `GET /builds/:org/:repo/:pr` - Return all known builds for given PR in repo.
* `POST /builds/:org/:repo/:pr` - Add a new build result and update the PR comment.
* `POST /builds/:org/:repo/:pr/refresh` - Re-render the comment for given PR ID.
* `DELETE /builds/:org/:repo/:pr` - Delete all known builds for given PR ID in repo. 
* `POST /comments` - Show currently managed comments in PRs.

By default it listens on `localhost:8000`.

# Usage

```
$ cat << EOF
{
  "id": 1, "commit": "7367f3d5", "success": true, "platform": "linux", "duration": "~15 min",
  "url": "https://ci.status.im/job/status-react/job/prs/job/linux/job/PR-7123/1/",
  "pkg_url": "https://status-im-prs.ams3.digitaloceanspaces.com/StatusIm-181212-211210-5157d2-pr.AppImage"
}
EOF >> /tmp/body/json

$ curl -s -XPOST http://localhost:8000/builds/my-org/my-repo/7123 -d@/tmp/body.json -H 'Content-Type: application/json'
{ "status": "ok" }

$ curl -s -XPOST http://localhost:8000/builds/my-org/my-repo/7123/refresh
{ "status": "ok" }
```
You can also check all PRs the application knows about:
```
$ curl -s http://localhost:8000/comments
{
  "count": 2,
  "comments": {
    "comment!status-im!status-go!001111": 3765199111
  }
}
```
# Configuration

There are few environment variables you can set:

* `LISTEN_PORT` - Self explanatory. (Default: `8000`)
* `DB_PATH` - Path where the [LevelDB](https://github.com/google/leveldb) DB file is stored. (Default: `/tmp/builds.db`)
* `GH_TOKEN` - Required for GitHub API access.
* `GH_WHITELIST` - Whitelist of names of GitHub repos to manage(Ex: `status-im/status-app`).

# Building

* `yarn run start` - For production use.
* `yarn run devel` - For development use.
* `yarn run default` - For building use.
* `yarn run release` - To create and push the docker image use.
