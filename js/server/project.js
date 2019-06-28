console.warn("server/project.js: loaded");

function _Server_project(_projectId, _projectTitle) {
  this.id     = String(_projectId);
  this.title  = String(_projectTitle);

  this.todos  = new _Server_project_todoComponent(this);
  this.users  = new _Server_project_userComponent(this);
  this.tags   = new _Server_project_tagComponent(this);


  this.remove = function() {

  }


  this.updateTitle = function(_newTitle) {
    if (!_newTitle) return false;
    this.title = String(_newTitle);
    this.DB.updateTitle(_newTitle);
  }





  this.sync = function() {
    this.users.sync();
    this.todos.sync();
    this.tags.sync();
  }


  this.DB = new function() {
    this.updateTitle = function(_newTitle) {
      REQUEST.send("database/group/changeTitle.php", "groupId=" + This.id + "&newTitle=" + _newTitle).then(
        function (_x) {console.warn(_x);}
      ).catch(function () {});
    }
  }
  
}

