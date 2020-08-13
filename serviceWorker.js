// await SW.send({action: "getAll", type: "project", projectId: "test", parameters: ""})

let antiCache = Math.random() * 1000000000000;
importScripts("js/time.js?a=" 						+ antiCache);
importScripts("js/serviceWorker/indexedDB.js?a=" 	+ antiCache);

importScripts("js/serviceWorker/encoder.js?a=" 		+ antiCache);
importScripts("js/serviceWorker/project.js?a=" 		+ antiCache);
importScripts("js/serviceWorker/server.js?a=" 		+ antiCache);


self.addEventListener('install', function(event) {
  console.warn("SW: Installed", "V0.10.0");
  return self.skipWaiting();
});


self.addEventListener('fetch', function(event) {
  // console.log(event.request.method, event.request.headers);
 
});


const Client = new function() {

}




self.addEventListener('message', async function(_e) {	
    console.log("SW: message", _e.data);

	let message = _e.data;
	let project = new Project({id: message.projectId});
	await project.setup();

	let messageFunction = false;
	if (message.type == "project")
	{
		switch (message.action)
		{
			case "remove": messageFunction = Server.removeProject;	break;
			case "rename": messageFunction = project.rename; 		break;
			case "create": messageFunction = Server.createProject; 	break;
			case "getAll": messageFunction = Server.getProjectList; break;
		}
	} else {
		messageFunction = project[message.type][message.action];
	}

	if (!messageFunction) return false;

	let result = false;
	try {
		result = await messageFunction(message.parameters);
		result = serializeResult(result);
	} catch (e) {console.error("An error accured", e)};


	_e.ports[0].postMessage(result);
});



function serializeResult(_result) {
	return JSON.parse(JSON.stringify(_result));
}



async function fetchData(_url, _parameters = "") {
	let response = await new Promise(function (resolve) {
		fetch(_url, {
			method: 'POST', 
			body: _parameters,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			credentials: 'include'
		}).then(function (_result) {
			resolve(_result);
		}, function (_error) {
			resolve("E_noConnection");
		});
	});

	if (response == "E_noConnection") return "E_noConnection";
	if (!response.ok) return console.error("HTTP-Error: " + response.status, response);
	
	let result = await response.text();
	try {
		result = JSON.parse(result);
	} catch (e) {}
	  
	return result;
}

