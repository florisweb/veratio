


const SW = new function() {
  let ServiceWorker;
  if ('serviceWorker' in navigator) {} else return;

  window.addEventListener('load', async function() {
    navigator.serviceWorker.register('serviceWorker.js').then(function(registration) {
      ServiceWorker = registration.active;
      
      ServiceWorker.onmessage = function(_e) {
        console.log("Client.onMessage", _e.data);
      }

      console.log('ServiceWorker registration successful');
    }, function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });



  this.send = function(_message) {
    return new Promise(function(resolve, reject) {
      var messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = function(event) {
        if (event.data.error) return reject(event.data.error);
        resolve(event.data);
      };

      navigator.serviceWorker.controller.postMessage(_message, [messageChannel.port2]);
    });
  }
}









const Server = new function() {
  let This = this;
  this.projectList = [];

  this.global = new function() {
    _Server_globalProject.call(this, {id: "*"})
    delete this.users;
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


  this.createProject = async function(_title) {
    let result = await SW.send({
      type: "project",
      action: "create",
      parameters: _title,
    });

    if (!result) return false;
    importProject(result);
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

