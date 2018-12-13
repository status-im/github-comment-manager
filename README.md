# Description

This is a minimal REST API intended for use with a Continuous Integration system for managing comments on GitHub.

The problem this solves is posting comments in a PR from multiple builds without spamming the comment section. Instead we post just one comment with a table and continue to update it.

# Example Comment

---
### Jenkins Builds
| :grey_question: | Commit | :hash: | Finished | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| | | | | | | |
| :x: | 1ds41ay | [#3](https://google.pl) | 12:12:55 AM | ~12 min | `android` | [:page_facing_up: build log](https://google.plconsoleText) |
| :x: | 1ds41ay | [#3](https://google.pl) | 12:13:18 AM | ~12 min | `android` | [:page_facing_up: build log](https://google.plconsoleText) |
| :heavy_check_mark: | 1ds41ay | [#3](https://google.pl) | 12:13:53 AM | ~12 min | `ios` | [:package: package](https://google.pl) |
| :heavy_check_mark: | 1ds41ay | [#3](https://google.pl) | 12:13:34 AM | ~12 min | `ios` | [:package: package](https://google.pl) |
| :heavy_check_mark: | 1ds41ay | [#3](https://google.pl) | 12:14:44 AM | ~12 min | `ios` | [:package: package](https://google.pl) |
---

# API

It exposes just 1 call:

* `POST /builds/:id` - Post a comment for PR with given ID.
* `POST /builds/:id/refresh` - Update the comment for PR with given ID.
* `POST /comments` - Show currently managed comments in PRs.

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
