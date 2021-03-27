const Cache = new function() {
  this.useCache = true;
  
  this.name = 'veratio-cache-v1';
  this.contents = [
    './',
    './index.php',
    './css/main_min.css',
    './js/main_min.js',

    './images/sideBarBackground/?type=sidebar',
    './images/icons/todayIcon.png',
    './images/icons/weekIcon.png',
    './images/icons/dropDownIcon.png',
    './images/icons/noConnectionIconLight.png',
    './images/icons/optionIcon.png',
    './images/icons/dropDownIconDark.png',
    './images/icons/inviteIconLight.png',
    './images/icons/linkIconLight.png',
    './images/icons/leaveIconRed.png',
    './images/icons/memberIcon.png',
    './images/icons/tagIcon.png',
    './images/icons/leaveIconDark.png',
    './images/icons/removeIcon.png',
    './images/icons/changeIconDark.png',
    './images/icons/checkIcon.svg',
    './images/loadingDark.gif',
    
    './images/icons/projectIconDark.svg',
    './images/icons/projectIcon.png',

    './images/icons/ownerIconDark.png',
    './images/icons/linkIconDark.png',
    './images/icons/adminIcon.png',
  ];
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(Cache.name)
      .then(function(cache) {
        return cache.addAll(Cache.contents);
      })
  );
});


self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request, {ignoreVary: true})
      .then(function(response) {
        if (response && Cache.useCache) return response;
        return fetch(event.request);
      }
    )
  );
});