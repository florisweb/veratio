// await SW.send({action: "getAll", type: "project", projectId: "test", parameters: ""})




let antiCache = Math.random() * 1000000000000;
importScripts("js/time.js?a=" 						+ antiCache);
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

	let messageFunction = false;
	if (message.type == "project")
	{
		switch (message.action)
		{
			case "remove": messageFunction = Server.remove;			break;
			case "rename": messageFunction = project.rename; 		break;
			case "create": messageFunction = Server.create; 		break;
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

	console.warn(result);

	// let serializedResult = JSON.parse(JSON.stringify(result));
	_e.ports[0].postMessage(result);



	// let project = new Project(message.projectId);
	// let result = false;
	// try {
	// 	result = await functionTable[message.type][message.action](message.parameters, project);
	// }
	// catch (e) {};

	// _e.ports[0].postMessage(result);



	// let projectId = "3e953aeb6d23d8ca4e97626a2faeafd49cbdd1dc38ee91539672878c3e09b1d15207bcab37e25877a9dcfb66c8c5b646e2e2d5af0519c53041a8452e";
	// let url = "database/project/task.php";
	// let parameters = "method=getByGroup&parameters=" + Encoder.objToString({
 //          type: "default", 
 //          value: "*"
 //        }) + "&projectId=" + projectId;



	// let result = await fetchData(url, parameters);
	
  	// _e.ports[0].postMessage(result);
});

function serializeResult(_result) {
	if (_result.serialize) return _result.serialize();

	if (typeof _result == "object")
	{
		let results = [];
		for (let i = 0; i < _result.length; i++) 
		{	
			results[i] = _result[i];
			if (_result[i].serialize) results[i] = _result[i].serialize();
		}
		return results;
	}

	return _result;
}





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

