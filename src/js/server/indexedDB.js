





const LocalDB = new function() {
  const DBName = "veratioDB";
  let DBVersion = 2;

  let DB;
  this.debug_requestCount = 0;

  
  let Promises = [];
  this.registerPromise = async function(_promise) {
    Promises.push(_promise);
    return _promise;
  }
  
  let curPromise = false;
  this.isBussy = async function() {
    if (curPromise) return await curPromise;

    curPromise = subPromise();
    await curPromise;
    curPromise = false;
    async function subPromise() {
      return new Promise(async function (resolve) {
        let result = await Promise.all(Promises);
        if (result.length == Promises.length) 
        {
          Promises = [];
          resolve();
        } else await subPromise();
        resolve();
      });
    }
  }





  this.setup = function() {
    return LocalDB.registerPromise(new Promise(function (resolve, error) {
      const request = indexedDB.open(DBName, DBVersion);

      request.onupgradeneeded = function(_e) { // create object stores
        DB = _e.target.result;

        const metaData          = DB.createObjectStore("metaData");
        const tasks             = DB.createObjectStore("tasks");
        const users             = DB.createObjectStore("users");
        const tags              = DB.createObjectStore("tags");
        const cachedOperations  = DB.createObjectStore("cachedOperations");
      }

      request.onsuccess = function(_e) {
        DB = _e.target.result;
        resolve();
      }

      request.onerror = function(_e) {
        console.warn("error", _e);
        indexedDB.deleteDatabase("veratioDB");
        error();
      }
    }));
  }

  this.getProjectAccess = function() {
    return {
      getProjectList:     getProjectList,
      getProject:         getProject,
      updateProjectList:  updateProjectList,
      removeProject:      removeProject,
    }
  }


  async function getProjectList(_ignoreUserAbsence = false) {
    let ids = await getProjectIdList();

    let projectList = [];
    for (let i = 0; i < ids.length; i++)
    {
      let project = new LocalDB_Project(ids[i], DB);
      await project.setMetaData();
      
      if (!project.users.Self && !_ignoreUserAbsence) continue; // project.remove(); -- should remove after some time, but we still need to keep it around for storing the cachedoperation of removing itself

      projectList.push(project);
    }

    projectList.sort(function (projectA, projectB) {
      return projectA.index - projectB.index;
    });

    cachedProjects = projectList;
    return projectList;
  }


  async function getProject(_id, _serverProject) {
    if (!_id) return false;
    let project = new LocalDB_Project(_id, DB, _serverProject);
    await project.setMetaData();
    return project;
  }



  async function updateProjectList(_newList) {
    let invalidProjects = await getProjectList();

    for (let i = 0; i < _newList.length; i++)
    {
      let index = invalidProjects.findIndex(function (v) {return v.id == _newList[i].id});
      if (index != -1) invalidProjects.splice(index, 1);

      let project = await getProject(_newList[i].id);
      if (project && !project.userIsAbsent) continue;

      addProject(_newList[i], i);
    }

    for (let project of invalidProjects) project.remove();
  }

  async function removeProject(_id) {
    let project = await getProject(_id);
    if (!project) return false;
    return await project.remove();
  }






  let lastResync = false;
  this.onReConnect = async function() {
    let updatedSomething = (await this.sendCachedOperations()).find(r => r);

    let dt = new Date() - lastResync;
    lastResync = new Date();

    if (dt < 60 * 1000) return updatedSomething; // only resync once a minute for low connectivity situations
    console.warn("Syncing with Server...");
    await this.resyncWithServer();
    console.warn("Synced with Server!");

    return updatedSomething;
  }


  async function addProject(_project, _index = 0) {
    let project = new LocalDB_Project(_project.id, DB);
    await project.setData("metaData", {title: _project.title, index: _index});
    if (_project.importData) 
    {
      await project.tags.set(_project.importData.tags);
      await project.users.set(_project.importData.users);
    }
    await project.setMetaData();

    return project;
  }


  

  this.sendCachedOperations = async function() {
    let projects = await getProjectList(true);
    let promises = [];
    for (let project of projects) promises.push(project.sendCachedOperations());

    return await Promise.all(promises); 
  }


  this.getCachedOperationsCount = async function() {
    let projects = await getProjectList(true);
    let operations = 0;
    for (let project of projects)
    {
      operations += (await project.getData("cachedOperations")).length;
    } 

    return operations;
  }




  this.resyncWithServer = async function() {
    if (!Server.connected) return false;
    await this.clearDB();
    let projects = await Server.getProjectList(false);

    let promises = [];
    for (let project of projects)
    {
      let localProject = await getProject(project.id, project);
      let projectPromises = [
        project.tasks.getByDateRange({date: new Date(), range: 365}),
        project.tasks.getByGroup({type: "overdue", value: "*"}),
        project.tasks.getByGroup({type: "default", value: "*"}),
        project.tasks.getByGroup({type: "toPlan", value: "*"})
      ];

      promises.push(new Promise(async function (resolve) {        
        let results = await Promise.all(projectPromises);
        
        let tasks = results[0];
        tasks = tasks.concat(results[1]);
        tasks = tasks.concat(results[2]);
        
        localProject.tasks.set(tasks);
        resolve();
      }));
    }

    await Promise.all(promises);
    return true;
  }


  this.clearDB = async function() {
    let ids = await getProjectIdList();
    let promises = [];
    for (let id of ids)
    {
      promises.push(removeProject(id));
    }
    await Promise.all(promises);
  }







  function getProjectIdList() {
    LocalDB.debug_requestCount++;
    return LocalDB.registerPromise(new Promise(function (resolve, error) {
      let store = DB.transaction("metaData", "readonly").objectStore("metaData");

      let ids = [];
      store.getAll().onsuccess = function(_e) {
        if (!_e.target.result) return error();

        resolve(
          _e.target.result.map(function (_item) {return _item.id})
        );
      };
    }));
  }
}







function LocalDB_globalProject() {
  const LocalAccess = LocalDB.getProjectAccess();
  this.tasks = new function() {
    const Key = "tasks";
    const TypeClass = Task;
    TypeBaseClass.call(this, Key, TypeClass);
   
    this.getByDate = async function(_date) {
      return this.getByDateRange({date: _date, range: 0})
    }

    this.getByDateRange = async function({date, range}) {
      let projects = await LocalAccess.getProjectList();
      let tasks = [];
      let promises = [];
      for (let i = 0; i < projects.length; i++)
      {
        promises.push(projects[i].tasks.getByDateRange({date: date, range: range}).then(function (_result) {
          tasks = tasks.concat(_result);
        }));
      }

      await Promise.all(promises);
      return tasks;
    }


    this.getByGroup = async function({type, value = "*"}) {
      let projects = await LocalAccess.getProjectList();
      let tasks = [];
      let promises = [];
      for (let i = 0; i < projects.length; i++)
      {
        promises.push(projects[i].tasks.getByGroup({type: type, value: value}).then(function (_result) {
          tasks = tasks.concat(_result);
        }));
      }

      await Promise.all(promises);
      return tasks;
    }

    this.getAll = async function() {
      let projects = await LocalAccess.getProjectList();
      let tasks = [];
      let promises = [];
      for (let i = 0; i < projects.length; i++)
      {
        promises.push(projects[i].tasks.getAll().then(function (_result) {
          tasks = tasks.concat(_result);
        }));
      }

      await Promise.all(promises);
      return tasks;
    }

    this.get = async function(_id) {
      let tasks = await this.getAll();
      for (let task of tasks)
      {
        if (task.id != _id) continue;
        return task;
      }
      return false;
    }

    this.getHighestPersonalIndex = async function() {
      this.getAll();
    }

    const undefinedPersonalIndex = 1000000000;
    this.moveInFrontOf = async function({id, inFrontOfId}) { // Personal taskorder
      let curTask = await this.get(id);
      if (!curTask) return false;

      let inFrontOfTask = await this.get(inFrontOfId);
      let nextIndex;
      if (!inFrontOfTask)
      {
        nextIndex = undefinedPersonalIndex + 1;
      } else nextIndex = inFrontOfTask.personalIndex;


      let newIndex = nextIndex;
      if (curTask.personalIndex < nextIndex) newIndex--; // Task is dropped higher than before

      let tasks = await this.getAll();
      let promises = [];
      for (let task of tasks)
      {
        if (task.id == id || task.personalIndex === undefinedPersonalIndex) continue;
        if (curTask.personalIndex < nextIndex) // Task is dropped higher than before
        {
          if (
            task.personalIndex > curTask.personalIndex &&
            task.personalIndex <= newIndex
          ) {
            task.personalIndex--;
            promises.push(this.update(task));
          }

          continue;
        } 

       if (
          task.personalIndex >= newIndex &&
          task.personalIndex < curTask.personalIndex
        ) {
          task.personalIndex++;
          promises.push(this.update(task));
        }
      }

      curTask.personalIndex = newIndex;
      promises.push(this.update(curTask));
      await Promise.all(promises);
    }

    this.update = async function(_task) {
      return await _task.project.tasks.update(_task);
    }

  }


  this.tags = new function() {
    const Key = "tags";
    const TypeClass = Tag;
    TypeBaseClass.call(this, Key, TypeClass);
  }

  this.users = new function() {
    const Key = "users";
    const TypeClass = User;
    TypeBaseClass.call(this, Key, TypeClass);

    this.Self = false;
  }



  function TypeBaseClass(_key, _typeClass) {
    let Key       = _key;
    let TypeClass = _typeClass;

    this.get = async function(_id) {
      let projects = await LocalAccess.getProjectList();
      for (let i = 0; i < projects.length; i++)
      {
          let item = await projects[i][Key].get(_id);
          if (item) return item;
      }
      return false;
    }


    this.remove = async function(_id) {
      let projects = await LocalAccess.getProjectList();
      for (let i = 0; i < projects.length; i++)
      {
          let success = await projects[i][Key].remove(_id);
          if (success) return true;
      }
      return false;
    }

  }
}















function LocalDB_Project(_projectId, _DB, _serverProject) {
  const LocalAccess = LocalDB.getProjectAccess();
  const This = this;
  this.title = "Loading...";
  this.Server = _serverProject; // The server project
  this.userIsAbsent = true;

  LocalDB_ProjectInterface.call(this, _projectId, _DB);
 

  

  this.sendCachedOperations = async function() {
    let operations = await this.getData("cachedOperations");
    if (!operations.length) return false; 
    
    let newOperations = [];
    let responses = await Server.fetchFunctionRequestList(operations);
    if (responses.error) return;
    
    console.log("CO: response: ", responses);
    for (let i = 0; i < responses.length; i++)
    { 
      console.log("Upload CO:", operations[i], responses[i]);
      if (!responses[i].error) continue;
      
      console.error("Upload CO: Error", operations[i], responses[i]);
      newOperations.push(operations[i]);
    }

    this.setData("cachedOperations", newOperations);
    return true;
  }

  this.moveToIndex = async function(_newIndex) {
    let projects = await LocalAccess.getProjectList(true);
    let project = projects.splice(this.index, 1)[0];
    projects.splice(_newIndex, 0, project);

    let promises = [];
    for (let i = 0; i < projects.length; i++) promises.push(projects[i].setIndex(i));
    return await Promise.all(promises);
  }

  this.setIndex = async function(_index) {
    await this.setData("metaData", {title: this.title, index: _index});
    this.index = _index;
  }


  this.setMetaData = async function() {
    let users = await this.users.getAll();
    for (let i = 0; i < users.length; i++)
    {
      if (!users[i].Self) continue;
      this.users.Self = users[i];
      this.userIsAbsent = false;
      break;
    }

    let metaData = await this.getData("metaData");
    if (metaData.id === undefined) 
    {
      await this.setData("metaData", {title: '❌ [Desync problem] ❌' + this.id, index: -1});
      metaData = await this.getData("metaData");
    }

    this.title = metaData.title;
    this.index = metaData.index;

    if (this.Server) return this.importData = this.Server.importData;

    this.importData = {
      users:  users,
      tags:   await this.tags.getAll()
    };

    this.Server = new Project({
      id:         _projectId,
      title:      this.title,
      importData: this.importData
    }, this);
  }

  this.remove = async function() {
    let result = await Promise.all([
      this.removeData("metaData"),
      this.removeData("tasks"),
      this.removeData("users"),
      this.removeData("tags")
    ]);

    return result[0] && result[1] && result[2] && result[3];
  }

  this.rename = async function(_newTitle) {
    let data = await this.getData("metaData");
    data.title = _newTitle;
    return await this.setData("metaData", data);
  }




  this.tasks = new function() {
    const Key = "tasks";
    const TypeClass = Task;
    TypeBaseClass.call(this, Key, TypeClass);

   
    this.moveInFrontOf = async function({id, inFrontOfId}) {
      let curTask = await this.get(id);
      if (!curTask) return false;

      let inFrontOfTask = await this.get(inFrontOfId);
      let nextIndex;
      if (!inFrontOfTask)
      {
        nextIndex = await this.getHighestIndex() + 1;
      } else nextIndex = inFrontOfTask.indexInProject;


      let newIndex = nextIndex;
      if (curTask.indexInProject < nextIndex) newIndex--; // Task is dropped higher than before

      let tasks = await this.getAll();
      for (let task of tasks)
      {
        if (task.id == id) 
        {
          task.indexInProject = newIndex;
          continue;
        }
        if (curTask.indexInProject < nextIndex) // Task is dropped higher than before
        {
          if (
            task.indexInProject > curTask.indexInProject &&
            task.indexInProject <= newIndex
          ) task.indexInProject--;
          continue;
        } 

       if (
          task.indexInProject >= newIndex &&
          task.indexInProject < curTask.indexInProject
        ) task.indexInProject++;
      }

      return await this.set(tasks);
    }

    this.getHighestIndex = async function() {
      let tasks = await this.getAll();
      let highestIndex = 0;
      for (let task of tasks)
      {
        if (task.indexInProject < highestIndex) continue;
        highestIndex = task.indexInProject;
      }
      return highestIndex;
    }



    this.getByDate = async function(_date) {
      return this.getByDateRange({date: _date, range: 0})
    }

    this.getByDateRange = async function({date, range}) {
      let tasks = await this.getAll();
      let foundTasks = [];
      if (typeof date == "string") date = new Date().setDateFromStr(date);

      for (let i = 0; i < tasks.length; i++)
      {
        if (tasks[i].groupType != "date") continue;
        let taskDate = new Date().setDateFromStr(tasks[i].groupValue);
        if (!taskDate || !taskDate.dateIsBetween(date, date.copy().moveDay(range))) continue;
        foundTasks.push(tasks[i]);
      }

      return foundTasks;
    }

    this.getByGroup = async function({type, value = "*"}) {
      let tasks = await this.getAll();
      let response = [];
      
      for (let i = 0; i < tasks.length; i++)
      {
        if (tasks[i].groupType != type) continue;
        if (value != "*" && tasks[i].groupValue != value) continue;
        
        response.push(tasks[i]);
      }
      return response;
    }

    this.getAll = async function() {
      let items = await This.getData(Key);
      if (!items) return [];
      let tasks = items.map(r => new Task(r, This.Server));
      tasks.sort(function(a, b) {
          if (a.indexInProject > b.indexInProject) return 1;
          if (a.indexInProject < b.indexInProject) return -1;
      });
      return tasks;
    }
  }


  this.tags = new function() {
    const Key = "tags";
    const TypeClass = Tag;
    TypeBaseClass.call(this, Key, TypeClass);
  }

  this.users = new function() {
    const Key = "users";
    const TypeClass = User;
    TypeBaseClass.call(this, Key, TypeClass);

    this.Self = false;
  }







  function TypeBaseClass(_key, _typeClass) {
    let Key       = _key;
    let TypeClass = _typeClass;

    let updatePromise;
    this.update = async function(_newItem) {
      if (updatePromise) await updatePromise;
      let resolver; // Wait for the promise so there's only one script writing at the same time
      updatePromise = new Promise(function (resolve) {resolver = resolve;}); 

      let data = await this.getAll();
      let found = false;

      for (let i = 0; i < data.length; i++)
      {
        if (data[i].id != _newItem.id) continue;
        data[i] = _newItem;
        found = true;
        break;
      }

      if (!found) data.push(_newItem);
      await this.set(data);

      resolver(); updatePromise = false;
      return _newItem;
    }


    this.get = async function(_id) {
      let items = await this.getAll();
    
      for (let i = 0; i < items.length; i++)
      {
        if (items[i].id != _id) continue;
        return items[i];
      }
      return false;
    }

    let removePromise;
    this.remove = async function(_id) {
      if (removePromise) await removePromise;
      let resolver; // Wait for the promise so there's only one script writing at the same time
      removePromise = new Promise(function (resolve) {resolver = resolve;}); 

      let items = await this.getAll();
      
      for (let i = 0; i < items.length; i++)
      {
        if (items[i].id != _id) continue;
        items.splice(i, 1);
        
        await this.set(items);
        resolver(); removePromise = false;
        return true;
      }

      resolver(); removePromise = false;
      return false;
    }

    this.removeAll = async function() {
      return This.setData(Key, []);
    }

    this.set = async function(_data) {
      let formatedData = _data.map((_item) => {
        if (_item.constructor.name == TypeClass.constructor.name) return _item.export();
        return new TypeClass(_item, This).export();
      });

      return await This.setData(Key, formatedData);
    }


    this.getAll = async function() {
      let items = await This.getData(Key);
      if (!items) return [];
      return items.map(r => new TypeClass(r, This));
    }
  }
}






function LocalDB_ProjectInterface(_projectId, _DB) {
  let This = this;
  let DB = _DB;
  this.id = _projectId;


  this.getData = function(_key) {
    if (!This.id) return false;
    LocalDB.debug_requestCount++;
    return LocalDB.registerPromise(new Promise(function (resolve, error) {
      let store = DB.transaction(_key, "readonly").objectStore(_key);

      let request = store.get(This.id);
      
      request.onsuccess = function(_e) {
        let data = request.result;
        if (typeof data != "object") data = [];
        resolve(data);
      }
    }));
  }

  this.setData = function(_key, _value) {
    if (!This.id) return false;
    LocalDB.debug_requestCount++;
    return LocalDB.registerPromise(new Promise(function (resolve, error) {
      const transaction = DB.transaction(_key, "readwrite");
      transaction.onerror = error;
      const store = transaction.objectStore(_key);

      _value.id = This.id;
      let trans2 = store.put(JSON.parse(JSON.stringify(_value)), This.id);
      resolve();//TODO actual success-checking
    }));
  }


  this.removeData = function(_key) {
    if (!This.id) return false;
    LocalDB.debug_requestCount++;
    return LocalDB.registerPromise(new Promise(function (resolve, error) {
      const transaction = DB.transaction(_key, "readwrite");
      transaction.onerror = error;

      const store = transaction.objectStore(_key);

      let request = store.delete(This.id);
      request.onerror = error;
      request.onsuccess = function(event) {
        resolve(true);
      }
    }));
  }


  this.addCachedOperation = async function(_operation) {
    let data = await this.getData("cachedOperations");
    if (!data) data = [];
    data.push(_operation);

    SideBar.noConnectionMessage.updateLocalChangesCount();

    return await this.setData("cachedOperations", data);
  }
}
