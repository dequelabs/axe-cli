'use strict';

const program = require('commander');
const colors = require('colors');
const link = colors.underline.blue;
const error = colors.red.bold;

const version = require('./package.json').version;
const axeTestUrls = require('./lib/axe-test-urls')
const saveOutcome = require('./lib/save-outcome')
const utils = require('./lib/utils')

program.version(version)
.usage('<url...> [options]')
.option('-i, --include <list>', 'CSS selector of included elements, comma separated', utils.splitList)
.option('-e, --exclude <list>', 'CSS selector of included elements, comma separated', utils.splitList)
.option('-r, --rules <list>', 'IDs of rules to run, comma separated', utils.splitList)
.option('-t, --tags <list>', 'Tags of rules to run, comma separated', utils.splitList)
.option('-b, --browser [browser-name]', 'Which browser to run (Webdriver required)')
.option('-s, --save [filename]', 'Save the output as a JSON file. Filename is optional')
.option('-d, --dir <path>', 'Output directory')
.option('-a, --axe-source <path>', 'Path to axe.js file')
.option('-q, --exit', 'Exit with `1` failure code if any a11y tests fail')
.option('--timeout <n>', 'Set how much time (second) axe has to run (default: 90)', 90)
.option('--timer', 'Log the time it takes to run')
.option('--show-errors', 'Display the full error stack')
// TODO: Replace this with a reporter option, this required adding
// a reporter option to axe-webdriverjs
.option('--no-reporter', 'Turn the CLI reporter off')

// .option('-c, --config <file>', 'Path to custom axe configuration')
.parse(process.argv);

program.browser = utils.parseBrowser(program.browser)
program.axeSource = utils.getAxeSource(program.axeSource);

if (!program.axeSource) {
	console.log(error(
		'Unable to find the axe-core source file.'
	));
	return 
}

let cliReporter;
if (program.reporter === false) {
	cliReporter = function () {};
} else {
	cliReporter = function (...args) {
		console.log(...args)
	};
}

// Try to match the version of axe that's used
const axeVersion = utils.getAxeVersion(program.axeSource)

// Setup axe with the appropriate config
console.log(colors.bold('Running axe-core ' + axeVersion + ' in ' + program.browser))

// Make valid URLs of all pages
const urls = program.args.map(utils.parseUrl);

if (urls.length === 0) {
	console.log(error(
		'No url was specified. Check `axe -h` for help\n'
	))
	process.exitCode = 1;
	return;
}

// Run axe inside the pages
axeTestUrls(urls, program, {
	/**
	 * Inform the user what page is tested
	 */
	onTestStart: function (url) {
		console.log(
			colors.bold('\nTesting ' + link(url)) +
			' ... please wait, this may take a minute.'
		);
		if (program.timer) {
			console.time('Total test time');
		}
	},

	/**
	 * Put the result in the console
	 */
	onTestComplete: function logResults(results) {
		const violations = results.violations
		if (violations.length === 0) {
			cliReporter(colors.green('  0 violations found!'))
			return;
		}

		const issueCount = violations.reduce((count, violation) => {
			cliReporter('\n' + error(
				'  Violation of %j with %d occurrences!\n') +
				'    %s. Correct invalid elements at:\n' +
				(violation.nodes.map( node =>
				'     - ' + node.target + '\n'
				).join('')) +
				'    For details, see: %s',
				violation.id,
				violation.nodes.length,
				violation.description,
				link(violation.helpUrl.split('?')[0])
			);
			return count + violation.nodes.length
		}, 0);

		cliReporter(error('\n%d Accessibility issues detected.'), issueCount)

		if (program.exit) {
			process.exitCode = 1;
		}
	}
}).then(function (outcome) {
	console.log('');
	if (program.timer) {
		console.timeEnd('Total test time');
	}
	// All results are in, quit the browser, and give a final report
	if (outcome.length > 1) {
		console.log(colors.bold.underline(
			'Testing complete of %d pages\n'),
			outcome.length
		);
	} else if (program.timer) {
		console.log('');
	}

	// Save the outcome
	if (program.save || program.dir) {
		return saveOutcome(outcome, program.save, program.dir)
		.then(fileName => {
			console.log('Saved file at', fileName, '\n')
		}).catch(err => {
			console.log(error('Unable to save file!\n') + err);
			process.exitCode = 1;
			return Promise.resolve();
		})
	} else {
		return Promise.resolve();
	}

}).then(() => {

	// Give a notification that 0 issues in axe doesn't mean perfect a11y
	console.log(colors.italic(
		'Please note that only 20% to 50% of all accessibility ' +
		'issues can automatically be detected. \nManual testing is ' +
		'always required. For more information see:\n%s\n'
	), link(
		'https://dequeuniversity.com/curriculum/courses/testing'
	));
}).catch((e) => {
	console.log(' ');
	if (!program['show-errors']) {
		console.log(error('An error occurred while testing this page.'));
	} else {
		console.log(
			error('Error: %j \n $s'),
			e.message,
			e.stack
		);
	}

	console.log('Please report the problem to: ' +
		link('https://github.com/dequelabs/axe-cli/issues/') + '\n');
	process.exit(1);
});
