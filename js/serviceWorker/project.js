

function _Server_globalProject(_project) {
  let This    = this;
  this.id     = String(_project.id);

  let Local   = LocalDB.getProject(this.id);



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
    let Users = this;

    let Type = "user";
    let list = [];
    if (_project.users) 
    {
      list = _project.users; 
      setSelf(list);
    };

    this.Self;
    


    let lastSync = new Date();
    const dateRecensy = 60 * 1000; // miliseconds after which the data is considered out of date

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

      setSelf(results);

      list = results;
      
      lastSync = new Date();
      return results;
    }

    this.getLocalList = function() {
      if (new Date() - lastSync > dateRecensy) this.getAll();
      return list;
    }

    this.getLocal = function(_id) {
      let users = this.getLocalList();
      for (user of users)
      {
        if (user.id != _id) continue;
        return user;
      }
      return false;
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
      let result = await REQUEST.send(
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
        "method=inviteByEmail&parameters=" + Encoder.encodeString(_email) +
        "&projectId=" + This.id
      );
    }

    this.inviteByLink = function() {
      return REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=inviteByLink" + 
        "&projectId=" + This.id
      );
    }
  }



  this.tags  = new function() {
    let Type = "tag";
    let list = [];
    if (_project.tags) setList(_project.tags); 


    let lastSync = new Date();
    const dateRecensy = 60 * 1000; // miliseconds after which the data is considered out of date



    function setList(_array) {
      for (let r = 0; r < _array.length; r++) _array[r].colour = new Color(_array[r].colour); 
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
      let results = await REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=getAll" + 
        "&projectId=" + This.id
      );
      if (!Array.isArray(results)) return false;
      setList(Encoder.decodeObj(results));

      lastSync = new Date();
      return list;
    }

    this.getLocalList = function() {
      if (new Date() - lastSync > dateRecensy) this.getAll();
      return list;
    }

    this.getLocal = function(_id) {
      let tags = this.getLocalList();
      for (tag of tags)
      {
        if (tag.id != _id) continue;
        return tag;
      }
      return false;
    }



    this.update = async function(_newTag) {
      _newTag.colour = _newTag.colour.toHex();
      let result = await REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=update&parameters=" + 
        Encoder.objToString(_newTag) + 
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
    
    let result = await REQUEST.send(
      "database/project/rename.php",
      "projectId=" + This.id + "&newTitle=" + Encoder.encodeString(_newTitle)
    );
    this.title = _newTitle;
    return result;
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




