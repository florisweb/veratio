

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

  this.clearCache = function() {
    this.projectList = [];
    lastProjectListUpdate = new Date().setDateFromStr("0-0-0");
  }


 
  let lastProjectListUpdate = false;
  this.projectList = [];
  this.getProjectList = async function() {
    if (new Date() - lastProjectListUpdate < cacheLifeTime) return this.projectList;
    lastProjectListUpdate = new Date();

    this.projectList = await getProjectList();

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
    let result = await Server.fetchData("database/project/remove.php", "projectId=" + _id);
    // if (!result) return false;
    return result;
  }


  this.createProject = function(_title) {
    return new Promise(async function (resolve, error) {
      let result = await Server.fetchData("database/project/create.php", "title=" + Encoder.encodeString(_title));
      if (!result) alert(result);

      importProject(result);
      resolve(result);
    });
  }



 


 

  this.get = getProjectList;

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
    console.log("UpdateStatus", prevConnectionStatus, "->", _connected);
    if (prevConnectionStatus == _connected) return;
    if (_connected) this.onReConnect();
    
    this.connected =_connected;
    let action = _connected ? "remove" : "add";
    document.body.classList[action]("noConnection");

    prevConnectionStatus = _connected;
  }



  this.onReConnect = function() {
    LocalDB.sendCachedOperations();
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
      result = JSON.parse(result);
    } catch (e) {}
      
    return result;
  }





  // this.executeMessageRequest = async function(_message) {
  //   let messageFunction = await getMessageFunction(_message);
  //   if (!messageFunction) return false;

  //   let result = false;
  //   try {
  //     result = await messageFunction(_message.parameters);
  //   } catch (e) {console.error("An error accured", e)};

  //   return result;
  // }


  // async function getMessageFunction(_message) {
  //   let project = new Project({id: _message.projectId});
  //   await project.setup();

  //   let messageFunction = false;
  //   if (_message.type == "project")
  //   {
  //     switch (_message.action)
  //     {
  //       case "remove": return Server.removeProject;   break;
  //       case "rename": return project.rename;       break;
  //       case "create": return Server.createProject;   break;
  //       case "getAll": return Server.getProjectList;  break;
  //     }
  //   } else return project[_message.type][_message.action];
  // }
}

