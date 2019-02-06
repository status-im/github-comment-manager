const Joi = require('joi')
 
/* whitelisted repos are controlled by env variables in server.js */
const genSchema = (REPOS_WHITELIST) => (
  Joi.object().keys({
    id: Joi.alternatives().try(Joi.number().positive(), Joi.string()).required(),
    commit: Joi.string().regex(/^[a-zA-Z0-9]{6,40}$/).required(),
    repo: Joi.string().max(30).required().valid(REPOS_WHITELIST),
    success: Joi.boolean().required(),
    platform: Joi.string().max(20).required(),
    duration: Joi.string().max(20).required(),
    url: Joi.string().uri().required(),
    pkg_url: Joi.string().uri().allow(null),
  })
)

module.exports = genSchema
