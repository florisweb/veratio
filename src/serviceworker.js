const Cache = new function() {
  this.useCache = true;
  console.log('Cache: Use cache: ', this.useCache);
  
  this.name = 'veratio-cache-v1';
  this.contents = [
    './',
    './index.php',
    './main_min.css',
    './main_min.js',
    './images/sideBarBackground/?type=sidebar',
    './images/icons/todayIcon.png',
    './images/icons/plannerIcon.png',
    './images/icons/weekIcon.png',
    './images/icons/dropDownIcon.png',
    './images/loading.gif',
    './images/icons/dropDownIconDark.png',
    './images/icons/todayIconDark.png',
    './images/icons/optionIcon.png',
    './images/icons/noConnectionIconLight.png',
    './images/icons/inviteIconLight.png',
    './images/icons/linkIconLight.png',
    './images/icons/leaveIconRed.png',
    './images/icons/memberIcon.png',
    './images/icons/tagIcon.png',
    './images/icons/leaveIconDark.png',
    './images/icons/removeIcon.png',
    './images/icons/changeIconDark.png',
    './images/icons/checkIcon.svg',
    './images/icons/addToPlannerIconDark.png',
    './images/icons/removeFromPlannerIconDark.png',
    './images/loadingDark.gif',
    './images/icons/projectIcon.png',
    './images/icons/projectIconDark.svg',
    './images/icons/ownerIconDark.png',
    './images/icons/adminIcon.png',
    './images/icons/weekIconDark.png',
    './images/icons/linkIconDark.png',
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

let urls = [];
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request, {ignoreVary: true})
      .then(function(response) {
        if (response && Cache.useCache) return response;
        let url = "./" + event.request.url.substr(37, Infinity);
        console.log('Cache: not found:', url);
        return fetch(event.request);
      }
    )
  );
});