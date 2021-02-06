

const SW = new function() {
  if ('serviceWorker' in navigator) {} else return;

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

  this.getProjectList = async function(_forceUpdate = false) {
    if (new Date() - lastProjectListUpdate < cacheLifeTime && !_forceUpdate) 
    {
      if (curFetchPromise) return await curFetchPromise;
      return this.projectList;
    }

    curFetchPromise         = getProjectList();
    let response            = await curFetchPromise;;
    this.projectList        = response;
    
    lastProjectListUpdate   = new Date();
    curFetchPromise         = false;

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

    let response = await Server.fetchFunctionRequest(functionRequest);
    if (response.error) {if (response.error != "E_noConnection") console.error("RemoveProject:", response); return};
    return response.result;
  }


  this.createProject = function(_title) {
    return new Promise(async function (resolve, error) {
      let functionRequest = {
        action:       "create",
        type:         "project",
        parameters:   _title
      };

      let response =  await Server.fetchFunctionRequest(functionRequest);
      if (response.error) {if (response.error != "E_noConnection") console.error("CreateProject:", response); return};

      importProject(response.result);
      resolve(response.result);
    });
  }



 


 

  async function getProjectList() {
    let response      = await fetchProjects();
    let noConnection  = response.error == "E_noConnection";
    
    if (response.error && response.error != "E_noConnection") {return console.error("GetProjectList:", response);}

    let projects = response.result;
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
    for (let project of projects) promises.push(project.setup());
    await Promise.all(promises);

    if (!noConnection) LocalDB.updateProjectList(projects);

    return projects;
  }


  async function fetchProjects() {
    let response        = await Server.fetchData("database/project/getProjectList.php");
    if (response.error) return response;
    
    let projectList = [];
    for (let i = 0; i < response.result.length; i++)
    {
      let project = importProject(response.result[i]);
      if (!project) continue;

      projectList.push(project);
    }

    response.result = projectList;
    return response;
  }

    function importProject(_project) {
      if (!_project || typeof _project != "object") return;
      _project = Encoder.decodeObj(_project);
      
      return new Project(_project);
    }




  this.getAllData = async function() {
    let projects = await getProjectList();
    
    let promises = [];
    for (let project of projects)
    {
      promises.push(project.tags.getAll());
      promises.push(project.users.getAll());
      promises.push(
        project.tasks.getByDateRange({date: new Date(), range: 365}).then(function (_list) {
          project.tasks.dateList = _list;
        })
      );
      promises.push(
        project.tasks.getByGroup({type: "overdue", value: "*"}).then(function (_list) {
          project.tasks.overdueList = _list;
        }) 
      );
      promises.push(
        project.tasks.getByGroup({type: "default", value: "*"}).then(function (_list) {
          project.tasks.defaultList = _list;
        }) 
      );
    };

    await Promise.all(promises);

    return projects;
  }





  this.updateConnectionStatus = async function(_connected = false) {
    if (this.connected == _connected) return false;

    console.log("UpdateConnectionStatus", this.connected, "->", _connected);
    this.connected  = _connected;

    let action      = _connected ? "remove" : "add";
    document.body.classList[action]("noConnection");

    if (!_connected) return false;
    await this.onReConnect();
    return true;
  }


  this.onReConnect = function () {LocalDB.onReConnect()};




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
      let responses = await Server.fetchFunctionRequestList(requests);

      for (let r = 0; r < requests.length; r++) 
      {
        let response = (responses.error == "E_noConnection" || responses.error == "E_noAuth") ? responses : responses[r];
        requests[r].resolve(response);
      }
      
      requests = [];

      timeoutStarted = false;
    }, timeOutLength);
    
    return returnPromise;
  }

  this.fetchFunctionRequestList = function(_requests) {
    let paramString = Encoder.objToString(_requests);
    return this.fetchData("database/project/executeFunctionList.php", "functions=" + paramString);
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

    let resendRequest = await Server.updateConnectionStatus(response != "E_noConnection");
    if (resendRequest) return await this.fetchData(...arguments);

    if (response == "E_noConnection") return {error: "E_noConnection", result: false};
    if (!response.ok) return {error: "E_responseError", result: false};
    
    let result = await response.text();
    try {
      result = Encoder.decodeObj(JSON.parse(result));
    } catch (e) {}

    if (result.error == "E_noAuth") App.promptAuthentication();
      
    return result;
  }
}

