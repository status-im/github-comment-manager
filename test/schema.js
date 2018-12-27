const expect = require('chai').expect
const sinon = require('sinon')
const Joi = require('joi')

const sample = require('./sample')
const Schema = require('../src/schema')

let build

describe('Schema', () => {
  beforeEach(() => {
    /* refresh for every test */
    build = Object.assign({}, sample.BUILD)
  })
  
  describe('id', () => {
    it('can be a string', async () => {
      let rval = await Joi.validate(build, Schema)
      expect(rval).to.eql(build)
    })

    it('can be a number', async () => {
      build.id = 123
      let rval = await Joi.validate(build, Schema)
      expect(rval).to.eql(build)
    })

    it('can\'t be null', () => {
      build.id = null
      expect(Joi.validate(build, Schema)).rejectedWith('"id" must be a number, "id" must be a string')
    })
  })

  describe('commit', () => {
    it('has to be a commit', async () => {
      let rval = await Joi.validate(build, Schema)
      expect(rval).to.eql(build)
    })

    it('can\'t be a null', () => {
      build.commit = null
      expect(Joi.validate(build, Schema)).rejectedWith('"commit" must be a string')
    })

    it('can\'t be a number', () => {
      build.commit = 1
      expect(Joi.validate(build, Schema)).rejectedWith('"commit" must be a string')
    })
  })

  describe('pkg_url', () => {
    it('has to be a URL', async () => {
      let rval = await Joi.validate(build, Schema)
      expect(rval).to.eql(build)
    })

    it('can be a null', async () => {
      build.pkg_url = null
      let rval = await Joi.validate(build, Schema)
      expect(rval).to.eql(build)
    })

    it('can\'t be a number', () => {
      build.pkg_url = 1
      expect(Joi.validate(build, Schema)).rejectedWith('"pkg_url" must be a string')
    })
  })
})
