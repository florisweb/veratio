
function _Server_project(_projectId, _projectTitle) {
  let This    = this;
  this.id     = String(_projectId);
  this.title  = String(_projectTitle);

  this.todos  = new _Server_project_todoComponent(this);
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


  this.updateTitle = function(_newTitle) {
    if (!_newTitle) return false;
    // this.title = String(_newTitle);
    // this.DB.updateTitle(_newTitle);
  }



  this.remove = function() {
    this.DB.remove().then(function () {
      Server.removeProject(This.id);
      console.warn("Succesfully removed this project");

    }).catch(function (_error) {
      console.warn(_error);
    })
  }




  this.sync = function() {
    this.users.sync();
    this.todos.sync();
    this.tags.sync();
  }


  this.DB = new function() {
    this.updateTitle = function(_newTitle) {
      // REQUEST.send("database/group/changeTitle.php", "groupId=" + This.id + "&newTitle=" + _newTitle).then(
      //   function (_x) {console.warn(_x);}
      // ).catch(function () {});
    }

    this.remove = function() {
      return new Promise(function (resolve, error) {

        REQUEST.send("database/project/removeProject.php", "projectId=" + This.id).then(
          function (_response) {
            if (_response === 1) resolve();
            error(_response);
          }
        );

      });
    }


  }
}
