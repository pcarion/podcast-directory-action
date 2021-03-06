# podcast-directory-action
Github action to maintain a directory of podcasts

# release process

Example for release 0.4:

```
npm run dist
git add -A
git commit -m 'release 0.4'
git push
git tag -a -m 'v0.4' v0.4
git push --follow-tags
```

# References

* [Creating a JavaScript action](https://docs.github.com/en/free-pro-team@latest/actions/creating-actions/creating-a-javascript-action)
* [Authentication in a workflow
](https://docs.github.com/en/free-pro-team@latest/actions/reference/authentication-in-a-workflow)
* [A curated list of awesome things related to GitHub Actions.](https://github.com/sdras/awesome-actions)
* [GitHub Actions Toolkit](https://github.com/actions/toolkit)
* [Github action Versioning](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
* [Template to bootstrap the creation of a JavaScript action](https://github.com/actions/javascript-action)
* [GitHub REST API](https://docs.github.com/en/free-pro-team@latest/rest)
* [Octokit javascript API](https://octokit.github.io/rest.js/v18)

