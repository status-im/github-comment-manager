import Handlebars from 'handlebars'

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

const pkgUrls = (data) => {
  if (!data) { return [] }
  return String(data).split(/\s+/).filter(Boolean)
}

const isDiawiUrl = (data) => {
  try {
    return new URL(data).hostname === 'i.diawi.com'
  } catch (e) {
    return false
  }
}

/* extracts file extension from url */
const fileExt = (data) => {
  let ext = 'pkg' /* generic option for unexpected situations */
  if (isDiawiUrl(data)) {
    return Handlebars.Utils.escapeExpression('diawi')
  } else if (data.includes('allure')) {
    ext = 'rpt' /* three-letter extensions just look nicer */
  } else if (data.includes('benchmark')) {
    ext = 'prf' /* performance benchmark dashboard link */
  } else if (data.endsWith('tar.gz')) {
    ext = 'tgz' /* three-letter extensions just look nicer */
  } else if (data.endsWith('consoleText') || data == 'log') {
    ext = 'log' /* log link is often a fallback */
  } else if (data.match(/^https?:\/\/.+\/[^.]+\.(\w{3,8})$/)) {
    ext = data.split('.').pop()
  }
  return Handlebars.Utils.escapeExpression(ext.slice(0, 3))
}

/* pick different icons for different urls */
const fileIcon = (data) => {
  switch (fileExt(data)) {
    case 'pkg': return ':package:';
    case 'apk': return ':robot:';
    case 'ipa':
    case 'diawi': return ':iphone:';
    case 'exe': return ':cd:';
    case 'dmg': return ':apple:';
    case 'rpt': return ':bar_chart:';
    case 'prf': return ':bar_chart:';
    case 'log': return ':page_facing_up:';
    default:    return ':package:';
  }
}

/* remove seconds from duration to make columns equal width */
const shortenDuration = (data) => (data.replace(/ [0-9]+ sec$/, ''))

/* generate URL for a QR code of given text */
const genQRCodeUrl = (data) => {
  const url = pkgUrls(data).find((u) => {
    if (u.endsWith('apk')) { return true }
    return isDiawiUrl(u)
  })
  if (!url) { return '' }

  const baseUrl = 'https://quickchart.io/qr'
  const queryParams = new URLSearchParams({
    text: url,
    size: '400x400',
    errorCorrectionLevel: 'L',
  })

  return new Handlebars.SafeString(
    `[:calling:](https://quickchart.io/qr?${queryParams.toString()})`
  )
}


export default {
  commitChanged,
  formatDate,
  pkgUrls,
  fileExt,
  fileIcon,
  shortenDuration,
  genQRCodeUrl,
}
