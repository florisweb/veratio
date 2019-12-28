function _Server_globalProject(_projectId) {
  let This    = this;
  this.id     = String(_projectId);

  this.tasks  = new function() {
    let Type = "task";

    this.get = async function(_id) {
      let result = await REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=get&parameters=" + _id +  
        "&projectId=" + This.id
      );
      return Encoder.decodeObj(result);
    }

    this.getByDate = function(_date) {
      return this.getByDateRange(_date, 1);
    }

    this.getByDateRange = async function(_date, _range = 1) {
      let result = await REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=getByDateRange&parameters=" + 
        Encoder.objToString({
          date: _date.toString(),
          range: _range
        }) + 
        "&projectId=" + This.id
      );
      return Encoder.decodeObj(result);
    }

    this.getByGroup = async function(_groupType, _groupValue = "*") {
      let result = await REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=getByGroup&parameters=" + 
        Encoder.objToString({
          type: _groupType, 
          value: _groupValue
        }) + 
        "&projectId=" + This.id
      );
      return Encoder.decodeObj(result);
    }


    this.remove = function(_id) {
      return REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=remove&parameters=" + _id + 
        "&projectId=" + This.id
      );
    }

    this.update = async function(_newTask) {
      let result = await REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=update&parameters=" + 
        Encoder.objToString(_newTask) + 
        "&projectId=" + This.id
      );
      return Encoder.decodeObj(result);
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

    this.getAll = async function() {
      let results = await REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=getAll" + 
        "&projectId=" + This.id
      );
      if (!Array.isArray(results)) return false;
      results = Encoder.decodeObj(results);
      
      for (user of results) if (user.Self) This.users.Self = new _Server_project_userComponent_Self(user);

      list = results;
      
      lastSync = new Date();
      return results;
    }

    this.getLocalList = function() {
      if (new Date() - lastSync > dateRecensy) this.getAll();
      return list;
    }




    this.update = async function(_newUser) {
      let result = REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=update&parameters=" + 
        Encoder.objToString(_newUser) + 
        "&projectId=" + This.id
      );
      return Encoder.decodeObj(result);
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




  this.tags   = new function() {
  }
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


  this.remove = async function() {
    let result = await REQUEST.send(
      "database/project/remove.php",
      "projectId=" + This.id
    );

    return result;
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






