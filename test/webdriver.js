/* global mocha */
const assert = require('chai').assert
const startDriver = require('../lib/webdriver').startDriver
const stopDriver = require('../lib/webdriver').stopDriver

describe('startDriver', () => {
  it('returns a promise', () => {
    const out = startDriver({ 'browser': 'phantomjs' })

    assert.isFunction(out.then)
    assert.isFunction(out.catch)
  })

  it('creates a driver', (done) => {
    startDriver({ 'browser': 'phantomjs' })
    .then((config) => {
      assert.isObject(config.driver)
      assert.isFunction(config.driver.manage)

      stopDriver(config)
      done()
    })
  })

  it('adds phantom if phantom is set', (done) => {
    startDriver({ 'browser': 'phantomjs' })
    .then((config) => {
      assert.isObject(config.phantom)
      stopDriver(config)
      done()
    })
  })
})

describe('stopDriver', () => {
  it('calls phantom.kill if phantom is set', () => {
    let called = 0;
    stopDriver({ phantom: { kill: () => called++ } })
    assert.equal(called, 1)
  })
})
