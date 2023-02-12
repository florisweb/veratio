const Errors = { // Captial E for server-given errors, small e for client errors/connection errors
  NO_AUTH:                Symbol('E_NO_AUTH'),
  PROJECT_NOT_FOUND:      Symbol('E_PROJECT_NOT_FOUND'),
  USER_NOT_IN_PROJECT:    Symbol('E_USER_NOT_IN_PROJECT'),
  ACTION_NOT_ALLOWED:     Symbol('E_ACTION_NOT_ALLOWED'),
  INTERNAL:               Symbol('E_INTERNAL'),
  INVALID_PARAMETERS:     Symbol('E_INVALID_PARAMETERS'),
  
  INVALID_EMAIL:          Symbol('E_INVALID_EMAIL'),
  EMAIL_ALREADY_INVITED:  Symbol('E_EMAIL_ALREADY_INVITED'),


  RESPONSE_ERROR:         Symbol('e_RESPONSE_ERROR'),
}

function isError(_error) {
  for (let key in Errors)
  {
    if (Errors[key] === _error) return true;
  }
  return false;
}





// System:
// 1. Fill cache from localDB: initial data
// 2. silentRenderer: send actual request and update data

// Fetch: request
// Get: cached (which comes from localDB)







class Server_GlobalProject {
  tasks = new Server_GlobalProject_tasks()
}

class Server_GlobalProject_tasks {
  async getByDate(_date, _fromCache) {
    return this.getByDateRange({date: _date, range: 0}, _fromCache);
  }
  async getByDateRange({date = new Date(), range = 1}, _fromCache) {
    let response = await Server.fetchData('database/action/task/global/getByDateRange.php', "date=" + date.toString() + "&range=" + Math.max(0, range));
    if (response.error) return response.error;
    return response.result.map(task => new Task(task, this._project));
  }
   async getByGroup({groupType = 'default', groupValue = '*'}, _fromCache) {
    let response = await Server.fetchData('database/action/task/global/getByGroup.php', "groupType=" + groupType + "&groupValue=" + groupValue);
    if (response.error) return response.error;
    return response.result.map(task => new Task(task, this._project));
  }
}






const Server = new class {
  #projectList = [];
  global        = new Server_GlobalProject();
  accessPoints  = new Server_AccessPoints();


  async setup() {
    let access = LocalDB.getProjectAccess();
    this.#projectList = await access.getProjectList();
    this.fetchProjectList(); // Overwrites later
  }

  get projectList() {
    return this.#projectList;
  }
  
  getProject(_id) {
    return this.#projectList.find((_project) => _project.id === _id);
  }


  #fetchingProjectList = false;
  async fetchProjectList() {
    if (this.#fetchingProjectList) return await this.#fetchingProjectList;

    this.#fetchingProjectList = new Promise(async (resolve) => {
      let response = await this.fetchData('database/action/getFilledProjectList.php');
      if (response.error) {console.warn(response.error, response); resolve(false); return false;}

      let promises = [];
      for (let projectData of response.result)
      {
        promises.push((new Project().import(projectData)).then((_project) => {
          this.#projectList.push(_project);
        }));
      }

      this.#projectList = [];
      await Promise.all(promises)
      resolve(this.#projectList);
    });

    await this.#fetchingProjectList;
    this.#fetchingProjectList = false;
    return this.#projectList;
  }
  
  


  async fetchData(_url, _parameters = "", _attemptsLeft = 0) {
    let parameters = _parameters;
    if (CurUser.linkUserId) parameters += (parameters ? '&' : '') + 'linkId=' + CurUser.linkUserId;

    return new Promise((resolve) => {
      this.#sendRequest(_url, parameters).then(async (response) => {
          let result = await response.text();
          try {
            result = Encoder.decodeObj(JSON.parse(result));
          } catch (e) {}

          if (result.error == "E_noAuth") App.promptAuthentication();
          if (result.error) 
          {
            console.log('e2', result.error);
              console.log('e', Errors[result.error.substr(2, Infinity)]);
            result.error = Errors[result.error.substr(2, Infinity)];
        }

          resolve(result);
      }, async (error) => {
        console.log(error, '-> E_noConnection');
        if (_attemptsLeft <= 0) return resolve({error: Errors['RESPONSE_ERROR'], result: false});
        await wait(500);
        resolve(this.fetchData(_url, _parameters, _attemptsLeft - 1));
      });
    });   
  }

  
  #sendRequest(_url, _parameters) {
    return new Promise(function (resolve, error) {
      fetch(_url, {
        method: 'POST', 
        body: _parameters,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        credentials: 'include'
      }).then(function (_result) {
        resolve(_result);
      }, function (_error) {
        console.log('an error accured', _error);
        error(_error);
      });
    });
  }
}