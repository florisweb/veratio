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
      return REQUEST.send(
        "database/project/" + Type + ".php", 
        "method=getAll" + 
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





  this.leave = function() {
    let users = this.users.getList();
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







