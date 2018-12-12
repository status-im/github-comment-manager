# Description

This is a minimal REST API intended for use with a Continuous Integration system for managing comments on GitHub.

The problem this solves is posting comments in a PR from multiple builds without spamming the comment section. Instead we post just one comment with a table and continue to update it.

# Example Comment

---
| Status | Commit | Build | Duration | Result |
|-|-|-|-|-|
| :x: | 5b1b9e9f | [prs/android-e2e/PR-7056#3](https://ci.status.im/job/status-react/job/prs/job/android-e2e/job/PR-7056/3/) | ~6 min | [:page_facing_up: build log](https://ci.status.im/job/status-react/job/prs/job/android-e2e/job/PR-7056/3//consoleText) |
| :heavy_check_mark: | 5b1b9e9f | [prs/macos/PR-7056#3](https://ci.status.im/job/status-react/job/prs/job/macos/job/PR-7056/3/) | ~13 min | [:package: macos package](https://status-im-prs.ams3.digitaloceanspaces.com/StatusIm-181212-143527-5b1b9e-pr.dmg) |
---

# API

It exposes just 1 call:

* `PUT /comment/:id` - Post a comment for PR with given ID.

By default it listens on `localhost:8080`.

# Configuration

There are few environment variables you can set:

* `LISTEN_PORT` - Default: `8000`

# Usage

For development use:
```
npm run start
```
For building use:
```
npm run build
```
To create the docker image use:
```
npm run image
```
To push the image use:
```
npm run push
```
