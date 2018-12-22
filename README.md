# Description

This is a minimal REST API intended for use with a Continuous Integration system for managing comments on GitHub.

The problem this solves is posting comments in a PR from multiple builds without spamming the comment section. Instead we post just one comment with a table and continue to update it.

# Example Comment

---
### Jenkins Builds
| :grey_question: | Commit | :hash: | Finished | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| | | | | | | |
| :x: | a088572b | [#3](https://google.pl) | 12:12:55 AM | ~12 min | `android` | [:page_facing_up: build log](https://google.plconsoleText) |
| :x: | a088572b | [#3](https://google.pl) | 12:13:18 AM | ~12 min | `android` | [:page_facing_up: build log](https://google.plconsoleText) |
| :heavy_check_mark: | a088572b | [#3](https://google.pl) | 12:13:53 AM | ~12 min | `ios` | [:package: package](https://google.pl) |
| :heavy_check_mark: | a088572b | [#3](https://google.pl) | 12:13:34 AM | ~12 min | `ios` | [:package: package](https://google.pl) |
| :heavy_check_mark: | a088572b | [#3](https://google.pl) | 12:14:44 AM | ~12 min | `ios` | [:package: package](https://google.pl) |
---

# API

It exposes just 1 call:

* `POST /builds/:id` - Post a comment for PR with given ID.
* `POST /builds/:id/refresh` - Update the comment for PR with given ID.
* `POST /comments` - Show currently managed comments in PRs.

By default it listens on `localhost:8080`.

# Usage

```
$ cat << EOF
{
  "id": 1,
  "commit": "7367f3d5",
  "success": true,
  "platform": "linux",
  "duration": "~15 min",
  "url": "https://ci.status.im/job/status-react/job/prs/job/linux/job/PR-7123/1/",
  "pkg_url": "https://status-im-prs.ams3.digitaloceanspaces.com/StatusIm-181212-211210-5157d2-pr.AppImage"
}
EOF >> /tmp/body/json

$ curl -s -XPOST https://localhost:8000/builds/7123 -d@/tmp/body.json -H 'Content-Type: application/json'
{
  "status": "ok"
}                                                                                                                                                                                     sochan@lilim: infra-misc% curl https://clicks.status.im/click                                                                                                    [10/17/18 11:22:50]
$ curl -s -XPOST https://localhost:8000/builds/7123/refresh
{
  "status": "ok"
}                                                                                                                                                                                     sochan@lilim: infra-misc% curl https://clicks.status.im/click                                                                                                    [10/17/18 11:22:50]
```
You can also check all PRs the application knows about:
```
$ curl -s http://localhost:8000/comments
{
  "count": 2,
  "comments": [
    {
      "pr": "7000",
      "comment_id": 446940840
    },
    {
      "pr": "7084",
      "comment_id": 446779864
    }
  ]
}
```
# Configuration

There are few environment variables you can set:

* `LISTEN_PORT` - Default: `8000`

# Building

For production use:
```
yarn run start
```
For development use:
```
yarn run devel
```
For building use:
```
yarn run default
```
To create and push the docker image use:
```
yarn run release
```
