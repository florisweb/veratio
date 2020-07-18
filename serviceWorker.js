let antiCache = Math.random() * 1000000000000;
importScripts("js/serviceWorker/indexedDB.js?a=" + antiCache);

importScripts("js/serviceWorker/encoder.js?a=" + antiCache);
importScripts("js/serviceWorker/project.js?a=" + antiCache);



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



self.addEventListener('message', async function(_e) {
	console.log("SW:message", _e);
	let message = _e.data;

	
	switch (message.type)
	{
		case "project": break;
		default: 

			


		break;
	}








	let projectId = "3e953aeb6d23d8ca4e97626a2faeafd49cbdd1dc38ee91539672878c3e09b1d15207bcab37e25877a9dcfb66c8c5b646e2e2d5af0519c53041a8452e";
	let url = "database/project/task.php";
	let parameters = "method=getByGroup&parameters=" + Encoder.objToString({
          type: "default", 
          value: "*"
        }) + "&projectId=" + projectId;



	let result = await fetchData(url, parameters);
	
  	_e.ports[0].postMessage(result);
});





async function fetchData(_url, _parameters) {
	let response = await fetch(_url, {
		method: 'POST', 
		body: _parameters,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	});

	if (!response.ok) return console.error("HTTP-Error: " + response.status, response);
	
	let result = await response.text();
	try {
		result = JSON.parse(result);
	} catch (e) {}
	  
	return result;
}


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



