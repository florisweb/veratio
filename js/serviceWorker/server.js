








const Server = new function() {
  let This = this;


  this.getProjectList = async function() {
    let projects = await fetchProjects();

    // if (projects === false) return await LocalDB.getProjectList();
    LocalDB.updateProjectList(projects);

    return projects;
  }

  this.removeProject = async function(_id) {
    let result = await fetchData("database/project/remove.php", "projectId=" + _id);
    // if (!result) return false;
    return result;
  }


  this.createProject = function(_title) {
    return new Promise(async function (resolve, error) {
      let result = await fetchData("database/project/create.php", "title=" + Encoder.encodeString(_title));
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

