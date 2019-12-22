
function _Server_project(_projectId, _projectTitle) {
  let This    = this;
  this.id     = String(_projectId);
  this.title  = String(_projectTitle);

  this.tasks  = new _Server_project_taskComponent(this);
  this.users  = new _Server_project_userComponent(this);
  this.tags   = new _Server_project_tagComponent(this);




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




  this.sync = function() {
    this.users.sync();
    this.tags.sync();
  }


  this.DB = new function() {
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
}
