// 'target' is set in the html

var hash = document.location.hash;
let xhr = new XMLHttpRequest();

if (hash.length == 0) {
  xhr.open('GET', '/cancel/');
} else {
  // #access_token=kd5u040u8ib55f2vkgb6v5lctjc1nh&scope=channel_editor+chat_login+channel_commercial+channel_subscriptions+channel_check_subscription
  let access_token = hash.split('=')[1].split('&')[0];
  xhr.open('GET', `/${target}/${access_token}`);
}

xhr.onload = function() {
  if (xhr.status >= 200 && xhr.status < 400) {
    // console.info(xhr.responseText)
  } else {
    // We reached our target server, but it returned an error
    console.error(xhr.responseText);
  }
};

xhr.onerror = function() {
  // There was a connection error of some sort
  console.error(xhr.responseText);
};

xhr.send();
