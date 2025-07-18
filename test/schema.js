import { expect } from 'chai'
import sinon from 'sinon'
import Joi from 'joi'

import sample from './sample.js'
import schema from '../src/schema.js'

let build

describe('Schema', () => {
  beforeEach(() => {
    /* refresh for every test */
    build = Object.assign({}, sample.BUILD)
  })

  describe('id', () => {
    it('can be a string', () => {
      let rval = schema.validate(build)
      expect(rval.value).to.eql(build)
    })

    it('can be a number', () => {
      build.id = 123
      let rval = schema.validate(build)
      expect(rval.value).to.eql(build)
    })

    it('can\'t be null', () => {
      build.id = null
      let rval = schema.validate(build)
      expect(rval.error.message).to.eq(
        '"id" must be one of [number, string]'
      )
    })
  })

  describe('commit', () => {
    it('has to be a commit', () => {
      let rval = schema.validate(build)
      expect(rval.value).to.eql(build)
    })

    it('can\'t be a null', () => {
      build.commit = null
      let rval = schema.validate(build)
      expect(rval.error.message).to.eq(
        '"commit" must be a string'
      )
    })

    it('can\'t be a number', () => {
      build.commit = 1
      let rval = schema.validate(build)
      expect(rval.error.message).to.eq(
        '"commit" must be a string'
      )
    })
  })

  describe('pkg_url', () => {
    it('has to be a URL', () => {
      let rval = schema.validate(build)
      expect(rval.value).to.eql(build)
    })

    it('can be a null', () => {
      build.pkg_url = null
      let rval = schema.validate(build)
      expect(rval.value).to.eql(build)
    })

    it('can\'t be a number', () => {
      build.pkg_url = 1
      let rval = schema.validate(build)
      expect(rval.error.message).to.eq(
        '"pkg_url" must be a string'
      )
    })
  })
})
