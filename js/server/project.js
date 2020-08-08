

function _Server_globalProject(_project) {
  let This    = this;
  this.id     = String(_project.id);


  this.tasks = new function() {
    let Type = "tasks";

    this.get = async function(_id) {
      return await SW.send({
        action: "get", 
        type: Type, 
        projectId: This.id, 
        parameters: ""
      });
    }

    this.getByDate = function(_date) {
      return this.getByDateRange(_date, 1);
    }

    this.getByDateRange = async function(_date, _range = 1) {
      return await SW.send({
        action: "getByDateRange", 
        type: Type, 
        projectId: This.id, 
        parameters: {
          date: _date.toString(),
          range: _range
        }
      });
    }

    this.getByGroup = async function(_groupType, _groupValue = "*") {
      return await SW.send({
        type: Type, 
        projectId: This.id, 
        action: "getByGroup", 
        parameters: {
          type: _groupType, 
          value: _groupValue
        }
      });
    }


    this.remove = async function(_id) {
      return await SW.send({
        type: Type, 
        projectId: This.id, 
        action: "remove", 
        parameters: _id
      });
    }

    this.update = async function(_newTask) {
      return await SW.send({
        type: Type, 
        projectId: This.id, 
        action: "update", 
        parameters: _newTask
      });
    }
  }






  this.users  = new function() {
    let Users = this;

    let Type = "users";
    this.Self;
    if (_project.users) this.Self = _project.users.Self;

  

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
      let results = await SW.send({
        action: "getAll", 
        type: Type, 
        projectId: This.id, 
        parameters: ""
      });
     
      if (!results || !Array.isArray(results)) return false;

      setSelf(results);
      
      return results;
    }

  

    function setSelf(_userList) {
      for (user of _userList) 
      {
        if (!user.Self) continue;
        Users.Self = new _Server_project_userComponent_Self(user);
        break;
      }
    }



    this.update = async function(_newUser) {
      return await SW.send({
        action: "update", 
        type: Type, 
        projectId: This.id, 
        parameters: _newUser
      });
    }


    this.remove = async function(_id) {
      return await SW.send({
        action: "remove", 
        type: Type, 
        projectId: This.id, 
        parameters: _id
      });
    }


    this.inviteByEmail = async function(_email) {
      return await SW.send({
        action: "inviteByEmail", 
        type: Type, 
        projectId: This.id, 
        parameters: _email
      });
    }

    this.inviteByLink = async function() {
      return await SW.send({
        action: "inviteByLink", 
        type: Type, 
        projectId: This.id, 
        parameters: ""
      });
    }
  }



  this.tags  = new function() {
    let Type = "tags";
    let list = [];

    function setList(_array) {
      for (let r = 0; r < _array.length; r++) _array[r].colour = new Color(_array[r].colour);  // SW will only give the data not the object
      list = _array;
    }



    this.get = async function(_id) {
      let tags = await this.getAll();
      for (tag of tags)
      {
        if (tag.id != _id) continue;
        return tag;
      }
      return false;
    }

    this.getAll = async function() {
      let results = await SW.send({
        action: "getAll", 
        type: Type, 
        projectId: This.id, 
        parameters: ""
      });

      if (!Array.isArray(results)) return false;
      setList(Encoder.decodeObj(results));

      return list;
    }

    

    this.update = async function(_newTag) {
      _newTag.colour = _newTag.colour.toHex(); // SW can't convert so client has to
      
      let result = await SW.send({
        action: "update", 
        type: Type, 
        projectId: This.id, 
        parameters: _newTag
      });
      
      return result;
    }


    this.remove = async function(_id) {
      return await SW.send({
        action: "remove", 
        type: Type, 
        projectId: This.id,
        parameters: _id
      });
    }
  }
}







function _Server_project(_project) {
  _Server_globalProject.call(this, _project);

  let This    = this;
  this.title  = String(_project.title);

  
  this.sync = function() {
    return Promise.all([
      this.users.getAll(),
    ]);    
  }




  this.leave = function() {
    if (!this.users.Self) return;
    this.users.remove(this.users.Self.id);
    return App.update();
  }


  this.rename = async function(_newTitle) {
    if (!_newTitle) return false;

    let result = await SW.send({
      action: "rename", 
      type: "project", 
      projectId: This.id, 
      parameters: _newTitle
    });

    this.title = _newTitle;
    return result;
  }


  this.remove = async function() {
    let result = await SW.send({
      action: "remove", 
      type: "project", 
      projectId: This.id, 
      parameters: This.id,
    });

    return result;
  }
}








function _Server_project_userComponent_Self(_user) {
  let permissions = _user.permissions;

  let This = this;
  this.id           = _user.id;
  this.name         = _user.name;


  this.permissions  = new function () {
    this.value = permissions;

    this.project = new function() {
      this.rename = permissions >= 2;
      this.remove = permissions >= 3;
    }
    
    this.tasks = new function() {
      this.update  = permissions >= 1;
      this.remove  = permissions >= 1;
      this.finish  = function(_task) {
        if (_task.assignedTo.includes(This.id)) return true;
        return permissions >= 1;
      }
    }

    this.tags = new function() {
      this.update = permissions >= 1;
      this.remove = permissions >= 1;
    }


    this.users = new function() {
      this.invite = permissions >= 2;

      this.changePermissions = function(_user) {
        if (permissions < _user.permissions) return false;
        return permissions >= 2;
      }
      this.remove = function(_user) {
        if (permissions < _user.permissions) return false;
        return permissions >= 2;
      }
    }
  }
}




