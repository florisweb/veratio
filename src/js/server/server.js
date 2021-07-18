
const Server = new function() {
  let This        = this;
  this.connected  = true;  
  this.global     = new GlobalProject();

  let linkUserId = false;
  this.isLinkUser = false;
  this.setLinkUserId = function(_id) {
    if (!_id) return;
    linkUserId = _id;
    this.isLinkUser = true;
  }


  this.projectList = [];
  this.setup = async function() {
    this.setLinkUserId(LinkUser.link);
    await this.getLocalProjectList();
  }

  this.getLocalProjectList = async function() {
    let projects = await getLocalProjectList();
    if (projects) this.projectList = projects;
    return this.projectList;
  }

  this.projectListNeedsUpdate = false;
  let getProjectListPromise = false;
  
  this.getProjectList = async function(_forceUpdate = false) {
    if (getProjectListPromise) return await getProjectListPromise;
    if (!_forceUpdate && !this.projectListNeedsUpdate) return this.projectList;
    this.projectListNeedsUpdate = false;

    getProjectListPromise       = getProjectList();
    let projects                = await getProjectListPromise;
    getProjectListPromise       = false;
    
    if (projects) this.projectList = projects;
    return this.projectList;
  }

 
  this.getProject = async function(_id, _forceUpdate = false) {
    let projects = await this.getProjectList(_forceUpdate);
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

      let response = await Server.fetchFunctionRequest(functionRequest);
      if (response.error) {if (response.error != "E_noConnection") console.error("CreateProject:", response); return};

      let project = importProject(response.result);
      resolve(project);
    });
  }



 


 

  async function getProjectList() {
    let response      = await fetchProjects();
    let noConnection  = response.error == "E_noConnection";
    
    if (response.error && response.error != "E_noConnection") {console.error("GetProjectList:", response); return false}

    let projects = response.result;
    if (noConnection) 
    {
      return await getLocalProjectList();      
    } else {
      await LocalDB.updateProjectList(projects);
    }

    let promises = [];
    for (let project of projects) promises.push(project.setup());
    await Promise.all(promises);

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
      let project               = new Project(Object.assign({}, _project));
      project.importData        = Object.assign({}, _project);
      project.importData.tags   = project.importData.tags.map(r => new Tag(r));
      project.importData.users  = project.importData.users.map(r => new User(r));

      return project;
    }


  async function getLocalProjectList() {
    let projects = [];
    let localDBProjects = await LocalDB.getProjectList();

    for (let localProject of localDBProjects) 
    {
      if (localProject.users.Self) localProject.users = [localProject.users.Self];
      let project = new Project(localProject);
      await project.setup();
      projects.push(project);  
    }

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


  this.onReConnect = function () {return LocalDB.onReConnect()};




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
      let batchRequests = requests;
      requests = [];
      timeoutStarted = false;

      let responses = await Server.fetchFunctionRequestList(batchRequests);
      for (let r = 0; r < batchRequests.length; r++) 
      {
        let response = (responses.error == "E_noConnection" || responses.error == "E_noAuth") ? responses : responses[r];
        batchRequests[r].resolve(response);
      }
      
    }, timeOutLength);
    
    return returnPromise;
  }

  this.fetchFunctionRequestList = async function(_requests) {
    let paramString = Encoder.objToString(_requests);
    return await this.fetchData("database/project/executeFunctionList.php", "functions=" + paramString);
  }



  this.fetchData = async function(_url, _parameters = "", _attempts = 0) {
    let parameters = _parameters;
    if (this.isLinkUser)
    {
      if (parameters) parameters += '&';
      parameters += "linkId=" + linkUserId;
    }
    let response = await new Promise(function (resolve) {
      fetch(_url, {
        method: 'POST', 
        body: parameters,
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
    
    if (response.status != 200 && response != "E_noConnection") 
    {
      if (_attempts >= 5) return {error: "E_responseError", result: false};
      return await new Promise(function (resolve) {
        setTimeout(async function () {
          resolve(await Server.fetchData(_url, _parameters, _attempts + 1));
        }, 500);
      }) 
    }
    
    let resendRequest = await Server.updateConnectionStatus(response != "E_noConnection");
    if (resendRequest) return await Server.fetchData(...arguments);

    if (response == "E_noConnection") return {error: "E_noConnection", result: false};
    
    let result = await response.text();
    try {
      result = Encoder.decodeObj(JSON.parse(result));
    } catch (e) {}

    if (result.error == "E_noAuth") App.promptAuthentication();
      
    return result;
  }
}

