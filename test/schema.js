import { expect } from 'chai'
import sinon from 'sinon'
import Joi from 'joi'

import Schema from '../src/schema'

let build
const BUILD = {
  id: 'ID-1',
  commit: 'abcd1234',
  success: true,
  platform: 'PLATFORM-1',
  duration: 'DURATION-1',
  url: 'https://example.com/some/url/path',
  pkg_url: 'https://example.com/some/pkg/path',
}

describe('Schema', () => {
  beforeEach(() => {
    /* refresh for every test */
    build = Object.assign({}, BUILD)
  })
  
  describe('commit', () => {
    it('has to be a commit', async () => {
      let rval = await Joi.validate(build, Schema)
      expect(rval).to.eql(build)
    })

    it('can\'t be a null', () => {
      build.commit = null
      expect(Joi.validate(build, Schema)).to.be.rejectedWith('"commit" must be a string')
    })

    it('can\'t be a number', async () => {
      build.commit = 1
      expect(Joi.validate(build, Schema)).to.be.rejectedWith('"commit" must be a string')
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

    it('can\'t be a number', async () => {
      build.pkg_url = 1
      expect(Joi.validate(build, Schema)).to.be.rejectedWith('"pkg_url" must be a string')
    })
  })
})
