

const SW = new function() {
  if ('serviceWorker' in navigator) {} else return;

  window.addEventListener('load', async function() {
    navigator.serviceWorker.register('serviceWorker.js').then(function(registration) {
      console.log("Serviceworker installed with scope", registration.scope);


      navigator.serviceWorker.controller.onmessage = function(_e) {
        console.log("Client.onMessage2", _e);
      }

    }, function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });


  this.send = function(_data) {
    console.log("Client send to SW: ", _data);
    return new Promise(function (resolve, reject) {
      let channel = new MessageChannel();
      channel.port1.onmessage = function(_e) {        
        if (event.data.error) return reject(event.data.error);
        resolve(_e.data)
      }

      navigator.serviceWorker.controller.postMessage(_data, [channel.port2]);
    });
  }
}








const Server = new function() {
  let This = this;
  
  this.global = new function() {
    _Server_globalProject.call(this, {id: "*"})
    delete this.users;
  }


  this.getProjectList = async function() {
    let list = await SW.send({
      action: "getAll", 
      type: "project", 
      projectId: "", 
      parameters: ""
    });

    return list.map(function(_project) {return new _Server_project(_project);});
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


  this.createProject = async function(_title) {
    return await SW.send({
      type: "project",
      action: "create",
      parameters: _title,
    });    
  }
}

