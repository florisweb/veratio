















const Server = new function() {
  let This = this;
  this.projectList = [];

  this.global = new function() {
    _Server_globalProject.call(this, {id: "*"})
    delete this.users;
  }



  // All request-inteceptor to detect authentication-loss
  let REQUEST_send = REQUEST.send;
  REQUEST.send = function(_url, _paramaters, _maxAttempts = 20) {
    return new Promise(function (resolve, reject) {
      REQUEST_send(_url, _paramaters, _maxAttempts).then(function (_result) {
        if (_result == "E_noAuth") App.promptAuthentication();
        resolve(_result);
      
      }, function (_error) {
        reject(_error);
      });
    });
  }

  REQUEST.noConnectionHandler = function() {
    document.body.classList.add("noConnection");
  }

  REQUEST.reConnectedHandler = function() {
    document.body.classList.remove("noConnection");
  }






  this.sync = async function(_) {
    console.warn("Server.sync()");
    return getProjects();
  }


  this.getProject = function(_id) {
    for (let i = 0; i < this.projectList.length; i++)
    {
      if (this.projectList[i].id != _id) continue;
      return this.projectList[i];
    }
    return false;
  }


  this.createProject = function(_title) {
    return new Promise(async function (resolve, error) {
      let result = await REQUEST.send("database/project/create.php", "title=" + Encoder.encodeString(_title));
      if (!result) alert(result);

      importProject(result);
      resolve(result);
    });
  }




  async function getProjects() {
    let results = await REQUEST.send("database/project/getProjectList.php");
    if (!results) return false;
    This.projectList = [];

    for (let i = 0; i < results.length; i++)
    {
      importProject(results[i]);
    }
  }

    function importProject(_project) {
      if (!_project || typeof _project != "object") return;

      _project = Encoder.decodeObj(_project);
      
      let project = new _Server_project(_project);
      This.projectList.push(project);
    }
}

