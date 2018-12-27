const log = require('loglevel')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

/* limit amount of console noise for tests */
log.setDefaultLevel(log.levels.WARN)

chai.use(sinonChai)
chai.use(chaiAsPromised);
