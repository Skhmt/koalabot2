// music.js

function sanitizeYT(url) {
  // youtube.com/attribution_link?a=JZ6nOJ4SvBc&u=/watch%3Fv%3D[id]%26feature%3Dem-share_video_user
  // if (url.includes('u=')) {
  if (/u=/gi.test(url)) {
    const queries = url.split('?')[1].split('&');
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i].split('=');
      if (query[0] == 'u') return decodeURIComponent(query[1]).split('v=')[1].substring(0,11);
    }
  }
  // youtube.com/watch?v=[id]&t=1m1s, attribution_link continued
  // else if (url.includes('v=')) return url.split('v=')[1].substring(0,11);
  else if (/v=/gi.test(url)) return url.split('v=')[1].substring(0,11);
  // youtu.be/[id]?t=1m1s, youtube.com/v/[id], youtube.com/embed/[id]?autoplay=1
  else {
    const splitURL = url.split('/');
    return splitURL[splitURL.length-1].split('?')[0];
  }
}

function sanitizeYT_deprecated(url) {
  // I think these are all the cases:
  // http(s)://www.youtube.com/watch?v=[id]
  // http(s)://m.youtube.com/watch?v=[id]
  // http(s)://youtu.be/[id]
  // http(s)://www.youtube.com/v/[id]
  // http(s)://www.youtube.com/embed/[id]
  // https://www.youtube.com/attribution_link?a=JZ6nOJ4SvBc&u=/watch%3Fv%3D[id]%26feature%3Dem-share_video_user

  // remove everything until the possible query string
  let newUrl = url.replace('https://', '')
    .replace('http://', '')
    .replace('www.', '')
    .replace('m.', '')
    .replace('youtu.be/', '')
    .replace('youtube.com/', '')
    .replace('watch', '')
    .replace('attribution_link', '')
    .replace('v/', '')
    .replace('embed/', '');

  // if it has queries, find the 'v' value and return it
  if (newUrl.substring(0,1) === '?') {
    const queries = newUrl.substring(1).split('&');
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i].split('=');
      if (query[0] == 'v') return query[1];
      // attribution_link case
      else if (query[0] == 'u') {
        const subQueries = decodeURIComponent(query[1]).replace('/?', '').split('&');
        for (let j = 0; j < subQueries.length; j++) {
          const subQuery = subQueries[j].split('=');
          if (subQuery[0] == 'v') return subQuery[1];
        }
      }
    }
  }
  else {
    // handling this case: https://youtu.be/[id]?t=3m22s
    newUrl = newUrl.split('?')[0];
    return newUrl;
  }
}

sanitizeYT('https://www.youtube.com/watch?v=_nrlsUvbKTs') === '_nrlsUvbKTs' ? console.log('pass') : console.log('fail')

sanitizeYT('https://www.youtube.com/watch?v=_nrlsUvbKTs&t=123') === '_nrlsUvbKTs' ? console.log('pass') : console.log('fail')

sanitizeYT('https://www.youtube.com/watch?t=123&v=_nrlsUvbKTs') === '_nrlsUvbKTs' ? console.log('pass') : console.log('fail')

sanitizeYT('http://www.youtube.com/watch?v=_nrlsUvbKTs') === '_nrlsUvbKTs' ? console.log('pass') : console.log('fail')

sanitizeYT('https://m.youtube.com/watch?v=_nrlsUvbKTs') === '_nrlsUvbKTs' ? console.log('pass') : console.log('fail')

sanitizeYT('http://m.youtube.com/watch?v=_nrlsUvbKTs') === '_nrlsUvbKTs' ? console.log('pass') : console.log('fail')

sanitizeYT('https://www.youtube.com/v/_nrlsUvbKTs') === '_nrlsUvbKTs' ? console.log('pass') : console.log('fail')

sanitizeYT('https://www.youtube.com/v/_nrlsUvbKTs?t=123') === '_nrlsUvbKTs' ? console.log('pass') : console.log('fail')

sanitizeYT('https://www.youtube.com/embed/_nrlsUvbKTs') === '_nrlsUvbKTs' ? console.log('pass') : console.log('fail')

sanitizeYT('https://www.youtube.com/embed/_nrlsUvbKTs?t=1233') === '_nrlsUvbKTs' ? console.log('pass') : console.log('fail')

sanitizeYT('https://www.youtu.be/_nrlsUvbKTs') === '_nrlsUvbKTs' ? console.log('pass') : console.log('fail')

sanitizeYT('https://www.youtu.be/_nrlsUvbKTs?t=123') === '_nrlsUvbKTs' ? console.log('pass') : console.log('fail')

sanitizeYT('https://www.youtube.com/attribution_link?a=JZ6nOJ4SvBc&u=/watch%3Fv%3D_nrlsUvbKTs%26feature%3Dem-share_video_user') === '_nrlsUvbKTs' ? console.log('pass') : console.log('fail')
