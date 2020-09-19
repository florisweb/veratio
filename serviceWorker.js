
const CACHE = {
	name: 'veratioCache-V1.1',
	enabled: false,
	primaryUrls: [
		"./",
		"css/component.css?a=52",
		"css/popup.css?a=39",
		"css/main.css?a=30",
		"css/sideBar.css?a=33",
		"css/mainContent/mainContent.css?a=63",
		"css/mainContent/taskHolder.css?a=80",
		"css/mainContent/header.css?a=1",	

		"/JS/jQuery.js",
		"/JS/request2.js",


		"js/DOMData.js?antiCache=",
		"js/time.js?antiCache=",
		"js/UI.js?antiCache=",
		"js/color.js?antiCache=",
		"js/textFormater.js?antiCache=",
		"js/constants.js?antiCache=",
		"js/extraFunctions.js?antiCache=",
		"js/optionMenu.js?antiCache=",
		"js/popup.js?antiCache=",
		"js/eventHandlers/dragHandler.js?antiCache=",
		"js/eventHandlers/keyHandler.js?antiCache=",
		"js/eventHandlers/doubleClickHandler.js?antiCache=",
		"js/eventHandlers/rightClickHandler.js?antiCache=",
		"js/mainContent/header.js?antiCache=",
		"js/mainContent/pages.js?antiCache=",
		"js/mainContent/todoHolder/taskHolder.js?antiCache=",
		"js/mainContent/todoHolder/renderer.js?antiCache=",
		"js/mainContent/mainContent.js?antiCache=",
		"js/sideBar.js?antiCache=",
		"js/server/encoder.js?antiCache=",
		"js/server/indexedDB.js?antiCache=",
		"js/server/project.js?antiCache=",
		"js/server/server.js?antiCache=",
		"js/app.js?antiCache="
	],

	secondaryUrls: [
		"images/sideBarBackground/?type=sidebar",
		"images/icons/todayIcon.png",
		"images/icons/weekIcon.png",
		"images/icons/dropDownIcon.png",
		"images/icons/noConnectionIconLight.png",
		"images/icons/optionIcon.png",
		"images/icons/dropDownIconDark.png",
		"images/icons/inviteIconLight.png",
		"images/icons/linkIconLight.png",
		"images/icons/leaveIconRed.png",
		"images/icons/removeIcon.png",
		"images/icons/changeIconDark.png",
		"images/icons/memberIcon.png",
		"images/icons/tagIcon.png",
		"images/icons/leaveIconDark.png",
		"images/icons/checkIcon.svg",
		"images/loadingDark.gif",
		"images/icons/projectIcon.png",
		"images/icons/projectIconDark.svg"
	]
}


self.addEventListener('install', function(event) {
	console.log("Install", "Cache Enabled:", CACHE.enabled);
  	// Perform install steps
  	event.waitUntil(
    	caches.open(CACHE.name)
      		.then(function(cache) {
        		console.log('Opened cache');
        		return cache.addAll(CACHE.primaryUrls);
      		})
  	);

  	return self.skipWaiting();
});



self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request, {ignoreSearch: true})
      .then(function(response) {
        if (response && CACHE.enabled) return response;

        return fetch(event.request).then(
          function(response) {
            if (!response || response.status !== 200 || response.type !== 'basic') 	return response;
            if (!CACHE.secondaryUrls.includes(event.request.url)) 					return response;

            var responseToCache = response.clone();
            caches.open(CACHE.name)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request, {ignoreSearch: true})
		.then(function(response) {
			if (response && CACHE.enabled) return response;
			return fetch(event.request);
		})
	);
});



