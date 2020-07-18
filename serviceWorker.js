let antiCache = Math.random() * 1000000000000;
importScripts("js/serviceWorker/indexedDB.js?a=" 	+ antiCache);

importScripts("js/serviceWorker/encoder.js?a=" 		+ antiCache);
importScripts("js/serviceWorker/project.js?a=" 		+ antiCache);
importScripts("js/serviceWorker/server.js?a=" 		+ antiCache);


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

	
	let project = new Project(message.projectId);

	switch (message.type)
	{
		case "project":

		break;
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





async function fetchData(_url, _parameters = "") {
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

