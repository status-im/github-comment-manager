import Joi from 'joi'

import hb from './helpers.js'

const pkgUrl = Joi.string().allow(null).custom((value, helpers) => {
  if (value == null) { return value }
  const parts = hb.pkgUrls(value)
  if (!parts.length) { return helpers.error('any.invalid') }
  for (const part of parts) {
    const { error } = Joi.string().uri().validate(part)
    if (error) { return helpers.error('any.invalid') }
  }
  return value
})

const schema = Joi.object().keys({
  id: Joi.alternatives().try(Joi.number().positive(), Joi.string()).required(),
  name: Joi.string().allow(null),
  commit: Joi.string().regex(/^[a-zA-Z0-9]{6,40}$/).required(),
  success: Joi.boolean().required(),
  platform: Joi.string().max(20).required(),
  duration: Joi.string().max(20).required(),
  url: Joi.string().uri().required(),
  pkg_url: pkgUrl,
})

export default schema
