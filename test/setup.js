import log from 'loglevel'
import chai from 'chai'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'

/* limit amount of console noise for tests */
log.setDefaultLevel(log.levels.WARN)

chai.use(sinonChai)
chai.use(chaiAsPromised);
