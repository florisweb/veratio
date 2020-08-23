

const SW = new function() {
  if ('serviceWorker' in navigator) {} else return;
  this.connected = true;


  window.addEventListener('load', async function() {
    navigator.serviceWorker.register('serviceWorker.js').then(function(registration) {
      console.log("Serviceworker installed with scope", registration.scope);
      
    }, function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}






const Server = new function() {
  let This = this;
  this.connected = false;
  const cacheLifeTime = 20000; // ms
  
  this.global = new GlobalProject();

  this.clearCache = async function() {
    this.projectList = [];
    lastProjectListUpdate = false;
  }


 
  let lastProjectListUpdate = false;
  let curFetchPromise = false;
  
  this.projectList = [];

  this.getProjectList = async function() {
    if (new Date() - lastProjectListUpdate < cacheLifeTime) 
    {
      if (curFetchPromise) return await curFetchPromise;
      return this.projectList;
    }

    curFetchPromise = getProjectList();
    this.projectList = await curFetchPromise;
    
    lastProjectListUpdate = new Date();
    curFetchPromise = false;

    return this.projectList;
  }

 
  this.getProject = async function(_id) {
    let projects = await this.getProjectList();
    for (let i = 0; i < projects.length; i++)
    {
      if (projects[i].id != _id) continue;
      return projects[i];
    }
    return false;
  }




  this.removeProject = async function(_id) {
    let functionRequest = {
      action:       "remove",
      type:         "project",
      parameters:   _id,
    };

    return await Server.fetchFunctionRequest(functionRequest);
  }


  this.createProject = function(_title) {
    return new Promise(async function (resolve, error) {
      let functionRequest = {
        action:       "create",
        type:         "project",
        parameters:   _title
      };

      let result =  await Server.fetchFunctionRequest(functionRequest);
      if (!result) alert(result);

      importProject(result);
      resolve(result);
    });
  }



 


 

  async function getProjectList() {
    let projects = await fetchProjects();
    let noConnection = projects == "E_noConnection";

    if (noConnection) 
    {
      projects = [];
      let localDBProjects = await LocalDB.getProjectList();
      for (localProject of localDBProjects) 
      {
        if (localProject.users.Self) localProject.users = [localProject.users.Self];
        projects.push(new Project(localProject));
      }
    }
     


    let promises = [];
    for (project of projects) promises.push(project.setup());

    await Promise.all(promises);


    if (!noConnection) LocalDB.updateProjectList(projects);

    return projects;
  }


  async function fetchProjects() {
    let results = await Server.fetchData("database/project/getProjectList.php");
    if (!results) return false;
    if (results == "E_noConnection") return results;
    
    let projectList = [];
    for (let i = 0; i < results.length; i++)
    {
      let project = importProject(results[i]);
      if (!project) continue;
      projectList.push(project);
    }
    return projectList;
  }

    function importProject(_project) {
      if (!_project || typeof _project != "object") return;
      _project = Encoder.decodeObj(_project);
      
      return new Project(_project);
    }











  let prevConnectionStatus = false;
  this.updateConnectionStatus = function(_connected = false) {
    if (prevConnectionStatus == _connected) return;
    if (_connected) this.onReConnect();

    console.log("UpdateStatus", prevConnectionStatus, "->", _connected);
    
    this.connected =_connected;
    let action = _connected ? "remove" : "add";
    document.body.classList[action]("noConnection");

    prevConnectionStatus = _connected;
  }



  this.onReConnect = function() {
    LocalDB.sendCachedOperations();
  }



  let requests = [];
  let timeoutStarted = false;
  const timeOutLength = 30;
  this.fetchFunctionRequest = async function(_request) {    
    let resolver;
    let returnPromise = new Promise(function(resolve) {resolver = resolve});
    _request.resolve = resolver;
    requests.push(_request);

    if (timeoutStarted) return returnPromise;
    timeoutStarted = true;
    
    setTimeout(async function () {
      console.warn("Send:", requests.length, requests);
      let results = await Server.fetchFunctionRequestList(requests);
      console.log(results);
      for (let r = 0; r < results.length; r++) requests[r].resolve(results[r]);
      
      requests = [];

      timeoutStarted = false;
    }, timeOutLength);
    
    return returnPromise;
  }

  this.fetchFunctionRequestList = async function(_requests) {
    let paramString = Encoder.objToString(_requests);
    let result = await this.fetchData("database/project/executeFunctionList.php", "functions=" + paramString);
    return result;
  }



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

    Server.updateConnectionStatus(response != "E_noConnection");

    if (response == "E_noConnection") return "E_noConnection";
    if (!response.ok) return console.error("HTTP-Error: " + response.status, response);
    
    let result = await response.text();
    try {
      result = Encoder.decodeObj(JSON.parse(result));
    } catch (e) {}
      
    return result;
  }
}

