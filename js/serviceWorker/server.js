








const Server = new function() {
  let This = this;


  this.getProjectList = async function() {
    let projects = await fetchProjects();

    return projects;
  }

  this.removeProject = function(_id) {
    
  }


  this.createProject = function(_title) {
    return new Promise(async function (resolve, error) {
      let result = await REQUEST.send("database/project/create.php", "title=" + Encoder.encodeString(_title));
      if (!result) alert(result);

      importProject(result);
      resolve(result);
    });
  }


  async function fetchProjects() {
    let results = await fetchData("database/project/getProjectList.php");
    if (!results) return false;
    
    let projectList = [];
    for (let i = 0; i < results.length; i++)
    {
      let project = importProject(results[i]);
      if (!project) continue;
      projectList.push(project);
    }
    return projectList;
  }

    function importProject(_project) {
      if (!_project || typeof _project != "object") return;

      _project = Encoder.decodeObj(_project);
      
      return new Project(_project);
    }
}

