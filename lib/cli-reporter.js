const colors = require('colors');

const link = colors.underline.blue;
const error = colors.red.bold;
const bold = colors.bold;

function createViolationString (violation) {
  str = error('  Violation of', violation.id, 'with', 
      violation.nodes.length, 'occurrences!\n');
  str += '    ' + violation.description + '. Correct invalid elements at:\n';
  // List all nodes
  str += (violation.nodes.map(
    node => '     - ' + node.target + '\n'
  ).join(''));
  // Give details
  str += '    For details, see: ' + link(violation.helpUrl.split('?')[0]) + '\n';

  return  str;
}


module.exports = function CliReporter (config, log = console.log.bind(console)) {
  const showResults = config.reporter === 'cli';
  const showStatus = ['cli', 'none'].includes(config.reporter);
  const debug = config.debug;

  const noop = function () {};
  const newLine = log.bind(null, '');
  const statusLog = (showStatus ? log : noop)
  const resultLog = (showResults ? log : noop)
  // Track when to prepend results with a comma, for raw output
  let resultCount = 0;

  return {
    newLine: newLine,
    status: statusLog,
    error: (msg, ...args) => log(error(msg), ...args),
    // Log error details if debug mode is on
    errorDetails: (stack) => {
      if (debug) log(stack);
    },

    // Notify that page test has started
    testStart: (axeVersion, browser) => {
      statusLog(bold('Running axe-core', axeVersion, 'in', browser));
    },

    // Notify that page test has started
    pageTestStart: (url) => {
      statusLog(bold('\nTesting ' + link(url)) +
        ' ... please wait, this may take a minute.')
    },

    // Notify that the testrun has concluded
    testComplete: (pageCount) => {
      if (!showStatus) {
        // Close up our raw output from reportAxeResults
        log(']');
      } else if (pageCount > 1) {
        statusLog(bold.underline('\nTesting complete of', pageCount, 'pages'));
      }
    },

    // Display the results
    reportAxeResults: function (results) {
      // If the reporter is changed, output raw results:
      if (!showStatus) {
        log((resultCount ? ', ' : '[') + JSON.stringify(results, null, '  '));
        resultCount++;
        return;
      }

      if (results.violations.length === 0) {
        resultLog(colors.green('\n  0 violations found!'));
      } else {
        const issueCount = results.violations.reduce((count, violation) => {
          resultLog(createViolationString(violation));
          return count + violation.nodes.length
        }, 0);
        resultLog(error(issueCount, 'Accessibility issues detected.'));
      }
    },

    // Conclude by displaying the disclaimer
    axeDisclaimer: function () {
      resultLog(colors.italic('\n'+
        'Please note that only 20% to 50% of all accessibility ' +
        'issues can automatically be detected. \nManual testing is ' +
        'always required. For more information see:\n%s'
      ), link(
        'https://dequeuniversity.com/curriculum/courses/testing'
      ));
      newLine();
    }
  };
};
