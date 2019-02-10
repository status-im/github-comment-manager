const Handlebars = require('handlebars')

/* loop helper compares commits of build and previous build */
const commitChanged = (data, index, options) => {
  if (index == 0) { return options.inverse(this); }
  if (data[index].commit !== data[index-1].commit) { return options.fn(this); }
  return options.inverse(this);
}

/* turns epoch time to human readable format */
const formatDate = (data) => new Handlebars.SafeString(
  (new Date(data)).toISOString('utc').slice(0, 19).replace('T', ' ')
)

/* extracts file extension from url */
const fileExt = (data) => {
  let ext = 'pkg' /* generic option for unexpected situations */
  if (data.includes('diawi')) {
    ext = 'ipa' /* diawi urls don't contain file extension */
  } else if (data.match(/^https?:\/\/.+\/[^.]+\.(\w{3,8})$/)) {
    ext = data.split('.').pop()
  }
  return new Handlebars.SafeString(ext.slice(0, 3))
}

/* remove seconds from duration to make columns equal width */
const shortenDuration = (data) => (data.replace(/ [0-9]+ sec$/, ''))

module.exports = {
  commitChanged,
  formatDate,
  fileExt,
  shortenDuration,
}
