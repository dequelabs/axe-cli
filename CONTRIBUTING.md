# Contributing

## Contributor License Agreement

In order to contribute, you must accept the [contributor license agreement](https://cla-assistant.io/dequelabs/axe-cli) (CLA). Acceptance of this agreement will be checked automatically and pull requests without a CLA cannot be merged.

## Contribution Guidelines

Submitting code to the project? Please review and follow the axe-core
[Git commit and pull request guidelines](https://github.com/dequelabs/axe-core/blob/develop/doc/code-submission-guidelines.md).

### Code Quality

Although we do not have official code style guidelines, we can and will request you to make changes
if we think that your code is sloppy. You can take clues from the existing code base to see what we
consider to be reasonable code quality. Please be prepared to make changes that we ask of you even
if you might not agree with the request(s).

Pull requests that change the tabs of a file (spacing or changes from spaces to tabs and vice versa)
will not be accepted. Please respect the coding style of the files you are changing and adhere to that.

That having been said, we prefer:

1. Tabs over spaces
2. Single quotes for string literals
3. Function definitions like `function functionName(arguments) {`
4. Variable function definitions like `Class.prototype.functionName = function (arguments) {`
5. Use of 'use strict'
6. Variables declared at the top of functions

### Testing

We expect all code to be covered by tests. We don't have or want code coverage metrics but we will review tests and suggest changes when we think the test(s) do(es) not adequately exercise the code/code changes.

### Documentation and Comments

Functions should contain a preceding comment block with [jsdoc](http://usejsdoc.org/) style documentation of the function. For example:

```
/**
 * Runs the Audit; which in turn should call `run` on each rule.
 * @async
 * @param  {Context}   context The scope definition/context for analysis (include/exclude)
 * @param  {Object}    options Options object to pass into rules and/or disable rules or checks
 * @param  {Function} fn       Callback function to fire when audit is complete
 */
```

## Setting up your environment

In order to get going, fork and clone the repository. Then, if you do not have [Node.js](https://nodejs.org/download/) installed, install it!

Once the basic infrastructure is installed, from the repository root, do the following:

```
npm install
```

To run axe-cli from your development environment, run:

```
node index.js www.deque.com
```

## Publishing

Publishing `axe-cli` to the npm registry is handled by CircleCI. To publish a stable version, you'll do something like this:

```
# Ensure you have the latest code
$ git checkout develop
$ git pull
# Create a release branch
$ git create-branch release-<YYYY-MM-DD>
# Run the release script
$ npm run release
# push it
$ git push --follow-tags origin release-<YYYY-MM-DD>
```

Then open a release PR into the `master` branch.
