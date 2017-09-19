/* eslint-env mocha */
'use strict'

const assert = require('chai').assert
const {startDriver, stopDriver} = require('../lib/webdriver')
const chromedriver = require('chromedriver')
const chrome = require('selenium-webdriver/chrome')

describe('startDriver', () => {
  let config, browser
  beforeEach(() => {
    browser = 'chrome-headless'
    config = {
      get browser () { return browser }
    }
  })

  afterEach(done => {
    stopDriver(config)
    const service = chrome.getDefaultService()
    if (service.isRunning()) {
      service.stop().then(() => {
        // An unfortunately hacky way to clean up
        // the service. Stop will shut it down,
        // but it doesn't reset the local state
        service.address_ = null
        chrome.setDefaultService(null)
        done()
      })
    } else {
      done()
    }
  })

  it('creates a driver', done => {
    startDriver(config)
      .then((config) => {
        assert.isObject(config.driver)
        assert.isFunction(config.driver.manage)
      })
      .then(done, done)
  })

  it('sets the config.browser as the browser', done => {
    browser = 'chrome'
    startDriver(config)
      .then(config => config.driver.getCapabilities())
      .then(capabilities => {
        assert.equal(capabilities.get('browserName'), browser)
      })
      .then(done, done)
  })

  it('sets the browser as chrome with chrome-headless', done => {
    browser = 'chrome-headless'
    startDriver(config)
      .then(config => config.driver.getCapabilities())
      .then(capabilities => {
        assert.equal(capabilities.get('browserName'), 'chrome')
      })
      .then(done, done)
  })

  it('uses the chromedriver path with chrome-headless', done => {
    browser = 'chrome-headless'
    startDriver(config)
      .then(config => {
        const service = chrome.getDefaultService()
        assert.equal(service.executable_, chromedriver.path)
      })
      .then(done, done)
  })

  it('sets the --headless flag with chrome-headless', done => {
    browser = 'chrome-headless'
    startDriver(config)
      .then(({ builder }) => builder.getCapabilities())
      .then(capabilities => {
        const chromeOptions = capabilities.get('chromeOptions')
        assert.isObject(chromeOptions)
        assert.deepEqual(chromeOptions.args, ['--headless'])
      })
      .then(done, done)
  })
})

describe('stopDriver', () => {
  it('calls browser.quit', () => {
    let called = 0
    stopDriver({
      browser: 'chrome-headless',
      driver: { quit: () => called++ }
    })
    assert.equal(called, 1)
  })
})
