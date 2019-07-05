
const Server = new _Server;
function _Server() {
  let This = this;
  this.projectList = [];
      
  this.createProject = function (_title) {
    return Server.DB.createProject(_title);
  };


  this.getProject = function(_id) {
    for (let i = 0; i < this.projectList.length; i++)
    {
      if (this.projectList[i].id != _id) continue;
      return this.projectList[i];
    }
    return false;
  }




  this.todos = new function() {
    this.getByDate = function(_date) {
      let todos = [];
      for (let i = 0; i < This.projectList.length; i++)
      {
        let curProject = This.projectList[i];
        todos = todos.concat(curProject.todos.getTodosByDate(_date));
      }
      return todos;
    }

    this.get = function(_id) {
      for (let i = 0; i < This.projectList.length; i++)
      {
        let curProject = This.projectList[i];
        let foundTodo = curProject.todos.get(_id);

        if (!foundTodo || isPromise(foundTodo)) continue;  
        foundTodo.projectId = curProject.id;
        return foundTodo;
      }
      
      return false;
    }
  }


 











  this.sync = function(_) {
    console.warn("Server.sync()");
    return new Promise(
      function (resolve, reject) {
        Server.DB.getProjects().then(
          function () {
            _syncProjectContents();
            var loopTimer = setTimeout(resolve, 100);
          }
        );
      }
    )
  }

    function _syncProjectContents() {
      for (let i = 0; i < This.projectList.length; i++)
      {
        This.projectList[i].sync();
      }
    }



  this.DB = new function() {

    this.createProject = function(_title) {
      return new Promise(function (resolve, error) {
        REQUEST.send("database/project/createProject.php", "title=" + encodeURIComponent(_title)).then(
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


