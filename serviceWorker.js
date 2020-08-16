// await SW.send({action: "getAll", type: "project", projectId: "test", parameters: ""})

let antiCache = Math.random() * 1000000000000;
importScripts("js/time.js?a=" 						+ antiCache);
importScripts("js/serviceWorker/indexedDB.js?a=" 	+ antiCache);

importScripts("js/serviceWorker/encoder.js?a=" 		+ antiCache);
importScripts("js/serviceWorker/project.js?a=" 		+ antiCache);
importScripts("js/serviceWorker/server.js?a=" 		+ antiCache);


self.addEventListener('install', function(event) {
  console.warn("SW: Installed", "V0.12.4");
  return self.skipWaiting();
});


self.addEventListener('fetch', function(event) {
  // console.log(event.request.method, event.request.headers);
 
});


const Client = new function() {

}



self.addEventListener('message', async function(_e) {	
	let message = _e.data;
		
	let result = await App.executeMessageRequest(message);

	_e.ports[0].postMessage(App.serializeResult(result));
});




const App = new function() {

	this.fetchData = async function(_url, _parameters = "") {
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


	this.executeMessageRequest = async function(_message) {
		let messageFunction = await getMessageFunction(_message);
		if (!messageFunction) return false;

		let result = false;
		try {
			result = await messageFunction(_message.parameters);
		} catch (e) {console.error("An error accured", e)};

		return result;
	}


	this.serializeResult = function(_result) {
		return JSON.parse(JSON.stringify(_result));
	}


	async function getMessageFunction(_message) {
		let project = new Project({id: _message.projectId});
		await project.setup();

		let messageFunction = false;
		if (_message.type == "project")
		{
			switch (_message.action)
			{
				case "remove": return Server.removeProject;		break;
				case "rename": return project.rename; 			break;
				case "create": return Server.createProject; 	break;
				case "getAll": return Server.getProjectList; 	break;
			}
		} else return project[_message.type][_message.action];
	}

}
