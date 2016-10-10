'use strict';

const program = require('commander');
const colors = require('colors');
const link = colors.underline.blue;
const error = colors.red.bold;

const axeTestUrls = require('./lib/axe-test-urls')
const saveOutcome = require('./lib/save-outcome')
const parseBrowser = require('./lib/utils').parseBrowser
const parseUrl = require('./lib/utils').parseUrl

const version = require('./package.json').version;

const list = val => (val.split(/[,;]/)).map(str => str.trim());

program.version(version)
.usage('<url...> [options]')
.option('-i, --include <list>', 'CSS selector of included elements, comma separated', list)
.option('-e, --exclude <list>', 'CSS selector of included elements, comma separated', list)
.option('-r, --rules <list>', 'IDs of rules to run, comma separated', list)
.option('-t, --tags <list>', 'Tags of rules to run, comma separated', list)
.option('-b, --browser [browser-name]', 'Which browser to run (Webdriver required)')
.option('-s, --save [filename]', 'Save the output as a JSON file. Filename is optional')
.option('-d, --dir <path>', 'Output directory')
// .option('-c, --config <file>', 'Path to custom axe configuration')
.parse(process.argv);

program.browser = parseBrowser(program.browser);

// Setup axe with the appropriate config
console.log(colors.bold('Running axe-core in ' + program.browser))

// Make valid URLs of all pages
const urls = program.args.map(parseUrl);

if (urls.length === 0) {
	console.log(error(
		'No url was specified. Check `axe -h` for help\n'
	))
	return;
}

// Run axe inside the pages
axeTestUrls(urls, program, {
	/**
	 * Inform the user what page is tested
	 */
	onTestStart: function (url) {
		console.log(colors.bold(
			'\nTesting ' + link(url) + ' ...'
		));
	},

	/**
	 * Put the result in the console
	 */
	onTestComplete: function logResults(results) {
		const violations = results.violations
		if (violations.length === 0) {
			console.log(colors.green('  0 violations found!'))
			return;
		}

		const issueCount = violations.reduce((count, violation) => {
			console.log('\n' + error(
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

		console.log('\n%d Accessibility issues detected.', issueCount)
	}
}).then(function (outcome) {
	// All results are in, quit the browser, and give a final report
	if (outcome.length > 1) {
		console.log(colors.bold.underline(
			'Testing complete of %d pages'),
			outcome.length
		);
	}
	// Save the outcome
	if (program.save || program.dir) {
		return saveOutcome(outcome, program.save, program.dir)
		.then(fileName => {
			console.log('\nSaved file at', fileName)
		}).catch(err => {
			console.log(error('\nUnable to save file!\n') + err);
			return Promise.resolve();
		})
	} else {
		return Promise.resolve();
	}

}).then(() => {
	// Give a notification that 0 issues in axe doesn't mean perfect a11y
	console.log(colors.italic('\n' +
		'Please note that only 20% to 50% of all accessibility ' +
		'issues can automatically be detected. Manual testing is ' +
		'always required. For more information see: %s \n'
	), link(
		'https://dequeuniversity.com/curriculum/courses/testing'
	));
}).catch((e) => {
	// On error, report it and quit the browser
	console.log(
		colors.red('Error: %j \n $s'),
		e.message,
		e.stack
	);
});


