
const Cache = {
	name: "veratio-v1",
  isActive: false,
	filesToCache: [
    "./",
    "images/sideBarBackground/?type=sidebar",
    "images/icons/todayIcon.png",
    "images/icons/weekIcon.png",
    "images/icons/projectIcon.png",
    "images/icons/dropDownIcon.png",
	]
}



// Installation
self.addEventListener('install', function(event) {
	event.waitUntil(
    	caches.open(Cache.name)
      	.then(function(cache) {
        	console.log('Opened cache');
        	return cache.addAll(Cache.filesToCache);
    	})
  	);
});


// Automaticly serve cached files
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response && Cache.isActive) console.log("Cached:", event.request.url, response);
        if (response && Cache.isActive) return response;
        return fetch(event.request);
      }
    )
  );
});






