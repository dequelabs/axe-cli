'use strict';

const program = require('commander');

const version = require('./package.json').version;
const axeTestUrls = require('./lib/axe-test-urls');
const saveOutcome = require('./lib/save-outcome');
const utils = require('./lib/utils');
const CliReporter = require('./lib/cli-reporter');
const noop = function () {};

program.version(version)
.usage('<url...> [options]')
.option('-i, --include <list>', 'CSS selector of included elements, comma separated', utils.splitList)
.option('-e, --exclude <list>', 'CSS selector of included elements, comma separated', utils.splitList)
.option('-r, --rules <list>', 'IDs of rules to run, comma separated', utils.splitList)
.option('-t, --tags <list>', 'Tags of rules to run, comma separated', utils.splitList)
.option('-b, --browser [browser-name]', 'Which browser to run (Webdriver required)')
.option('-s, --save [filename]', 'Save the output as a JSON file. Filename is optional')
.option('-d, --dir <path>', 'Output directory')
.option('-a, --axe-source', 'Path to axe.js file')
.option('-q, --exit', 'Exit with `1` failure code if any a11y tests fail')
.option('-p, --reporter [name]', 'Which format to use for the output (default cli)', 'cli')
.option('--timeout <n>', 'Set how much time (second) axe has to run (default: 90)', 90)
.option('--timer', 'Log the time it takes to run')
.option('--debug', 'Display the full error stack')
// .option('-c, --config <file>', 'Path to custom axe configuration')
.parse(process.argv);

program.browser = utils.parseBrowser(program.browser)
program.axeSource = utils.getAxeSource(program.axeSource);

// Try to match the version of axe that's used
const axeVersion = utils.getAxeVersion(program.axeSource)
const reporter = new CliReporter(program);

// Setup axe with the appropriate config
reporter.testStart(axeVersion, program.browser);

// Make valid URLs of all pages
const urls = program.args.map(utils.parseUrl);

if (urls.length === 0) {
	reporter.error('No url was specified. Check `axe -h` for help\n');
	process.exitCode = 1;
	return;
}
if (program.timer) {
	console.time('Total test time');
}

// Run axe inside the pages
axeTestUrls(urls, program, {
	/**
	 * Inform the user what page is tested
	 */
	onTestStart: function (url) {
		reporter.pageTestStart(url);
	},

	/**
	 * Put the result in the console
	 */
	onTestComplete: function logResults(results) {
		reporter.reportAxeResults(results);
		if (program.exit) {
			process.exitCode = 1;
		}
	}
}).then(function (outcome) {
	// All results are in, quit the browser, and give a final report
	reporter.testComplete(outcome.length);

	if (program.timer) {
		console.timeEnd('Total test time');
		reporter.newLine();
	}

	// Save the outcome
	if (program.save || program.dir) {
		return saveOutcome(outcome, program.save, program.dir)
		.then(fileName => {
			reporter.status('Saved file at', fileName, '\n')

		}).catch(err => {
			reporter.error('Error: Unable to save file!');
			reporter.errorDetails(err);
			reporter.newLine();

			process.exitCode = 1;
			return Promise.resolve();
		})
	} else {
		return Promise.resolve();
	}

}).then(() => {
	reporter.axeDisclaimer();

}).catch((e) => {
	reporter.error('\nAn error occurred while testing this page.');
	reporter.errorDetails(e.stack);
	reporter.status('Please report the problem to: ' +
			link('https://github.com/dequelabs/axe-cli/issues/') + '\n');

	process.exit(1);
});
