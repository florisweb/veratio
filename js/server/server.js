
const Server = new _Server;
function _Server() {
  let This = this;
  this.projectList = [];
      
  this.createProject = function(_title) {
    return Server.DB.createProject(_title);
  };

  this.removeProject = function(_id) {
    for (let i = 0; i < this.projectList.length; i++)
    {
      if (this.projectList[i].id != _id) continue;
      this.projectList.splice(i, 1);
    }
    return false;
  }


  this.getProject = function(_id) {
    for (let i = 0; i < this.projectList.length; i++)
    {
      if (this.projectList[i].id != _id) continue;
      return this.projectList[i];
    }
    return false;
  }




  this.global = new function() {
    _Server_globalProject.call(this, "*")
    delete this.users;
  }


 







  this.sync = function(_) {
    console.warn("Server.sync()");
    Server.DB.getProjects();
  }



  this.DB = new function() {

    this.createProject = function(_title) {
      return new Promise(function (resolve, error) {
        REQUEST.send("database/project/create.php", "title=" + encodeURIComponent(_title)).then(
          function (_project) {
            _importProject(_project);
            resolve(_project);
          }
        ).catch(function () {error()});
      });
    }


    this.getProjects = function() {
      return REQUEST.send("database/project/getProjectList.php").then(
        function (_projectList) {
          if (!_projectList) return false;

          for (let i = 0; i < _projectList.length; i++)
          {
            _importProject(_projectList[i]);
          }
        }
      ).catch(function () {});
    }

      function _importProject(_project) {
        if (!_project || typeof _project != "object") return;
        let cachedProject = This.getProject(_project.id);
        if (cachedProject)
        {
          cachedProject.title = String(_project.title);
          return true;
        }


        let project = new _Server_project(
          _project.id, 
          _project.title
        );

        This.projectList.push(project);
      }
  }


}


