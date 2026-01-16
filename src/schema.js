import Joi from 'joi'

const schema = Joi.object().keys({
  id: Joi.alternatives().try(Joi.number().positive(), Joi.string()).required(),
  name: Joi.string().allow(null),
  commit: Joi.string().regex(/^[a-zA-Z0-9]{6,40}$/).required(),
  success: Joi.boolean().required(),
  platform: Joi.string().max(20).required(),
  duration: Joi.string().max(20).required(),
  url: Joi.string().uri().required(),
  pkg_url: Joi.string().uri().allow(null),
})

export default schema
