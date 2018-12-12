const metricsName = 'clicks_counter'
const metricsHeader = `
# Counts of clicks for every key available in the service store.
# HELP ${metricsName} List of clicks for counted for every key.
# TYPE ${metricsName} counter
`.trim()

class Counter {
  constructor(redis, name) {
    this.redis = redis
    /* make sure we don't miss errors */
    this.redis.on("error", (err) => { console.log("Error: " + err) })
  }

  async incr (key, val) {
    /* default to incrementing by one */
    val = val == undefined ? 1 : val
    /* increment */
		await this.redis.incr(key)
    return await this.state(key)
  }
  
  async state (key) {
    let count = await this.redis.get(key)
    /* keys in redis are set to null by default */
    return count == null ? 0 : count
  }

  async list () {
    let keys = await this.redis.keys('*')
    if (keys.length == 0) { return {} }
    let vals = await this.redis.mget(keys)
    /* combine list of keys and values into an object */
    return keys.reduce((obj, k, i) => ({...obj, [k]: vals[i] }), {})
  }

  async metrics () {
    let metrics = await this.list()
    let metricsFormatted = Object.keys(metrics).map((key) => (
      `${metricsName}{key="${key}"} ${metrics[key]}`
    ))
    return metricsHeader + '\n' + metricsFormatted.join('\n')
  }
}

module.exports = Counter
