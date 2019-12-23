function _Server_globalProject(_projectId) {
  let This    = this;
  this.id     = String(_projectId);

  this.tasks  = new function() {
    let Type = "task";

    this.get = function(_id) {
       return REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=get&parameters=" + _id +  
        "&projectId=" + This.id
      );
    }

    this.getByDate = function(_date) {
      return this.getByDateRange(_date, 1);
    }

    this.getByDateRange = function(_date, _range = 1) {
      return REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=getByDateRange&parameters=" + 
        JSON.stringify({
          date: _date.toString(),
          range: _range
        }) + 
        "&projectId=" + This.id
      );
    }

    this.getByGroup = function(_groupType, _groupValue = "*") {
      return REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=getByGroup&parameters=" + 
        JSON.stringify({
          type: _groupType, 
          value: _groupValue
        }) + 
        "&projectId=" + This.id
      );
    }

    this.update = function(_newTask) {
      return REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=update&parameters=" + 
        JSON.stringify(_newTask) + 
        "&projectId=" + This.id
      );
    }
  }






  this.users  = new function() {
    let Type = "user";
    let list = [];

    this.Self;// = new _Server_project_userComponent_Self();
    
    let lastSync = new Date();
    const dateRecensy = 10000; // miliseconds after which the data is considered out of date

    this.get = async function(_id) {
      let users = await this.getAll();
      for (user of users)
      {
        if (user.id != _id) continue;
        return user;
      }
      return false;
    }

    this.getAll = function() {
      return new Promise(async function (resolve, error) {
        let results = await REQUEST.send(
          "database/project/" + Type + ".php", 
          "method=getAll" + 
          "&projectId=" + This.id
        );
        if (!Array.isArray(results)) return error(results);
        
        for (user of results) if (user.Self) This.users.Self = new _Server_project_userComponent_Self(user);

        list = results;
        resolve(results);
        lastSync = new Date();
      });
    }

    this.getLocalList = function() {
      if (new Date() - lastSync > dateRecensy) this.getAll();
      return list;
    }




    this.update = function(_newUser) {
      return REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=update&parameters=" + 
        JSON.stringify(_newUser) + 
        "&projectId=" + This.id
      );
    }


    this.remove = function(_id) {
      return REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=remove&parameters=" + _id + 
        "&projectId=" + This.id
      );
    }


    this.inviteByEmail = function(_email) {
      return REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=inviteByEmail&parameters=" + _email +
        "&projectId=" + This.id
      );
    }
  }




  this.tags   = new _Server_project_tagComponent(this);
}



function _Server_project(_projectId, _projectTitle) {
  _Server_globalProject.call(this, _projectId);

  let This    = this;
  this.title  = String(_projectTitle);

  
  this.sync = function() {
    return Promise.all([
      this.users.getAll(),
    ]);    
  }





  this.leave = function() {
    let users = this.users.getLocalList();
    for (user of users)
    {
      if (!user.Self) continue;
      Server.removeProject(this.id);
      return this.users.remove(user.id);
    }
  }


  this.rename = function(_newTitle) {
    if (!_newTitle) return false;
    return new Promise(function (resolve, error) {
      This.DB.rename(_newTitle).then(function () {
        this.title = _newTitle;
        resolve();
      });
    });
  }



  this.remove = function() {
    this.DB.remove().then(function () {
      Server.removeProject(This.id);
      console.warn("Succesfully removed this project");

    }).catch(function (_error) {
      console.warn(_error);
    });
  }




  this.rename = function(_newTitle) {
    return new Promise(function (resolve, error) {
      REQUEST.send("database/project/rename.php", "projectId=" + This.id + "&newTitle=" + Encoder.encodeString(_newTitle)).then(
        function (_response) {
          if (_response === 1) resolve();
          error(_response);
        }
      );
    });
  }

  this.remove = function() {
    return new Promise(function (resolve, error) {
      REQUEST.send("database/project/remove.php", "projectId=" + This.id).then(
        function (_response) {
          if (_response === 1) resolve();
          error(_response);
        }
      );
    });
  }
}








function _Server_project_userComponent_Self(_user) {
  this.id           = _user.id;
  this.name         = _user.name;
  let isOwner       = _user.isOwner;
  let Permissions   = JSON.parse(_user.permissions);




  this.taskActionAllowed = function(_action, _task) {
    switch (String(_action).toLowerCase())
    {
      case "remove":
        if (Permissions[1][1] >= 2)                                         return true;
        if (Permissions[1][1] >= 1 && _task.creatorId == this.id)           return true;
      break;
      case "update": 
        if (Permissions[1][1] >= 2)                                         return true;
        if (Permissions[1][1] >= 1 && !_task)                               return true;
        if (Permissions[1][1] >= 1 && _task.creatorId == this.id)           return true;
      break;
      case "finish": 
        if (Permissions[1][0] >= 2) return true;
        if (Permissions[1][0] >= 1 && _task.assignedT.includes(this.id))    return true;
        if (Permissions[1][0] >= 0 && _task.creatorId == this.id)           return true;
      break; //finish
      default: 
        console.error("Server.project.users.Self.taskActionAllowed: Action ", _action, " was not found.");
      break;
    }

    return false;
  }

  this.userActionAllowed = function(_action, _user) {
    switch (String(_action).toLowerCase())
    {
      case "remove":
        if (Permissions[2][0] >= 2 && (!_user.isOwner || isOwner)) return true;
      break;
      case "update": 
        if (Permissions[2][1] >= 1 && (!_user.isOwner || isOwner)) return true;
      break;
      case "invite": 
        if (Permissions[2][0] >= 1) return true;
      break;
      default: 
        console.error("Server.project.users.Self.userActionAllowed: Action ", _action, " was not found.");
      break;
    }

    return false;
  }

   this.projectActionAllowed = function(_action) {
    switch (String(_action).toLowerCase())
    {
      case "remove":
        if (Permissions[3][0] >= 2) return true;
      break;
      case "rename": 
        if (Permissions[3][0] >= 1) return true;
      break;
      default: 
        console.error("Server.project.users.Self.projectActionAllowed: Action ", _action, " was not found.");
      break;
    }

    return false;
  }
}






