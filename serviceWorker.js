let antiCache = Math.random() * 1000000000000;
importScripts("js/serviceWorker/indexedDB.js?a=" + antiCache);

self.addEventListener('install', function(event) {
  console.warn("SW: Installed");
});


self.addEventListener('fetch', function(event) {
  // console.log(event.request.method, event.request.headers);
 
});



// fetch(url, {
//   credentials: 'include'
// })


console.log(self);
const Client = new function() {

}



self.addEventListener('message', function(event) {
	console.log("SW:message", event);
  	event.ports[0].postMessage({'test': 'This is my response.'});
});


// this.onmessage = function(_e) {
// 	console.log("SW: Message from " + _e.origin);
// 	if (_e.origin != "http://localhost") return;
// 	let request = _e.data;
// 	let client = _e.source;

// 	console.warn("SW:", _e);
	
// 	client.postMessage("ping1");
// 	setTimeout(function () {client.postMessage("ping2");}, 1000);
// 	setTimeout(function () {client.postMessage("ping3");}, 2000);
// 	setTimeout(function () {client.postMessage("ping4");}, 3000);


// 	// client.postMessage({
// 	// 	response: "ping",
// 	// 	returnId: request.sendId
// 	// });








// 	// let data = _e.data;

// 	// let result = "E_actionNotFound";
// 	// for (action in actions) 
// 	// {
// 	// 	if (data.action != action) continue;
		
// 	// 	try {
// 	// 		result = actions[action](data.parameters);
// 	// 	}
// 	// 	catch (e) {
// 	// 		console.error("An error accured", e);
// 	// 	}
// 	// }

// 	// if (result == "E_actionNotFound") return console.warn("An unknown error accured, perhaps the function doesn't exist.");

// 	// this.postMessage({
// 	// 	action: _e.data.action,
// 	// 	result: result
// 	// });
// }



