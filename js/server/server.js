
const Server = new _Server;
function _Server() {
  let This = this;
  this.projectList = [];

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





  this.sync = async function(_) {
    console.warn("Server.sync()");
    return getProjects();
  }



  this.createProject = function(_title) {
    return new Promise(async function (resolve, error) {
      let result = await REQUEST.send("database/project/create.php", "title=" + encodeURIComponent(_title));
      if (!result) alert(result);

      _importProject(result);
      resolve(result);
    });
  }





  async function getProjects() {
    let results = await REQUEST.send("database/project/getProjectList.php");
    if (!results) return false;
    This.projectList = [];

    for (let i = 0; i < results.length; i++)
    {
      _importProject(results[i]);
    }
  }

    function _importProject(_project) {
      if (!_project || typeof _project != "object") return;

      let project = new _Server_project(
        _project.id, 
        _project.title
      );
      project.sync();

      This.projectList.push(project);
    }

}

