# axe-cli

[![Join the chat at https://gitter.im/dequelabs/axe-core](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/dequelabs/axe-core?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Version](https://img.shields.io/npm/v/axe-cli.svg)](https://www.npmjs.com/package/axe-cli)
[![License](https://img.shields.io/npm/l/axe-cli.svg)](LICENSE)

Provides a command line interface for [aXe](https://github.com/dequelabs/axe-core) to run quick accessibility tests.

## Getting Started

Install [Node.js](https://docs.npmjs.com/getting-started/installing-node) if you haven't already. This project requires Node 6+.

Install axe-cli globally: `npm install axe-cli -g`

Lastly, install the webdrivers of the browsers you wish to use. A webdriver is a driver for your web browsers. It allows other programs on your machine to open a browser and operate it. Current information about available webdrivers can be found at [selenium-webdriver project](https://www.npmjs.com/package/selenium-webdriver). Alternatively, you could use [Webdriver manager](https://www.npmjs.com/package/webdriver-manager)

## Usage

After installing, you can now run the `axe` command in your CLI, followed by the URL of the page you wish to test:

	axe https://www.deque.com

You can run multiple pages at once, simply add more URLs to the command. If you do not specify the protocol, http will be used by default

	axe www.deque.com, dequeuniversity.com

**Note:** If you are having difficulty with the color scheme, use `--no-color` to disable text styles.

## Running specific rules

You can use the `--rules` flag to set which rules you wish to run, or you can use the `--tags` to tell axe to run all rules that have that specific tag. For example:

	axe www.deque.com --rules color-contrast,html-has-lang

Or, to run all wcag2a rules:

	axe www.deque.com --tags wcag2a


A list of rules and what tags they have is available at: https://dequeuniversity.com/rules/worldspace/2.0/.

### Saving the results

Results can be saved as JSON data, using the `--save` and `--dir` flags. By passing a filename to `--save` you indicate how the file should be called. If no filename is passed, a default will be used. For example:

	axe www.deque.com --save deque-site.json

Or:

	axe www.deque.com --dir ./axe-results/

### Defining the scope of a test

If you want to only test a specific area of a page, or wish to exclude some part of a page you can do so using the `--include` and `--exclude` flags and pass it a CSS seletor:

	axe www.deque.com --include #main --exclude #aside

### Custom axe-core versions

Axe-cli will look for locally available versions of axe-core. If the directory from where you start axe-cli has an `axe.js` file, or has a `node_modules` directory with axe-core installed in it. Axe-cli will use this version of axe-core instead of the default version installed globally.

### Different browsers

Axe-cli can run in a variety of web browsers. By default axe-cli uses PhantomJS, which is installed as a dependency. But axe-cli is equally capable of testing pages using other web browers. **Running in another browser requires that browser's webdriver to be installed**. You can find a list of available webdrivers at: https://www.npmjs.com/package/selenium-webdriver

To run axe-cli using another browser, pass it in as the `--browser` option:

	axe www.deque.com --browser chrome

Or for short:

	axe www.deque.com -b c
