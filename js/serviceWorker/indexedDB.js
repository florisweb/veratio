





const LocalDB = new function() {
  const DBName = "veratioDB";
  let DBVersion = 3;

  let DB; getDB();



  function getDB() {
    const request = indexedDB.open(DBName, DBVersion);

    request.onupgradeneeded = function(_e) { // create object stores
      DB = _e.target.result;

      const metaData  = DB.createObjectStore("metaData");
      const tasks     = DB.createObjectStore("tasks");
      const users     = DB.createObjectStore("users");
      const tags      = DB.createObjectStore("tags");
    }

    request.onsuccess = function(_e) {
      DB = _e.target.result;
    }

    request.onerror = function(_e) {
      console.warn("error", _e);
    }
  }



  this.getProjectList = async function() {
    let ids = await getProjectIdList();

    let projectList = [];
    for (let i = 0; i < ids.length; i++)
    {
      let project = new LocalDB_Project(ids[i], DB);
      projectList.push(project);
    }

    return projectList;
  }


  this.getProject = async function(_id) {
    let projectList = await this.getProjectList();
    for (let i = 0; i < projectList.length; i++)
    {
      if (projectList[i].id != _id) continue;
      return projectList[i];
    }
    return false;
  }


  this.addProject = async function(_id, _title = "A nameless project") {
    let project = new LocalDB_Project(_id, DB);
    await project.setData("metaData", {title: _title});

    return project;
  }


  this.removeProject = async function(_id) {

  }




  function getProjectIdList() {
    return new Promise(function (resolve, error) {
      let store = DB.transaction("metaData", "readonly").objectStore("metaData");

      let ids = [];
      store.getAll().onsuccess = function(_e) {
        if (!_e.target.result) return error();

        resolve(
          _e.target.result.map(function (_item) {return _item.id})
        );
      };
    });
  }
}




function LocalDB_Project(_projectId, _DB) {
  let This = this;
  LocalDB_ProjectInterface.call(this, _projectId, _DB);


  this.tasks = new function() {
    const Key = "tasks";
    TypeBaseClass.call(this, Key);

   
    this.getByDateRange = async function({date, range}) {
      let tasks = await getAllTasks();
      let response = [];
      
      for (let i = 0; i < tasks.length; i++)
      {
        if (tasks[i].groupType != "date") continue;
        let date = new Date(tasks[i].groupValue);
        if (!date || !date.dateIsBetween(date, date.moveDay(range))) continue;
        
        response.push(tasks[i]);
      }
      return response;
    }

    this.getByGroup = async function({type, value = "*"}) {
      let tasks = await getAllTasks();
      let response = [];
      
      for (let i = 0; i < tasks.length; i++)
      {
        if (tasks[i].groupType != type) continue;
        if (value != "*" && tasks[i].groupValue != value) continue;
        
        response.push(tasks[i]);
      }
      return response;
    }
  }


  this.tags = new function() {
    const Key = "tags";
    TypeBaseClass.call(this, Key);
  }

  this.users = new function() {
    const Key = "users";
    TypeBaseClass.call(this, Key);
  }








  function TypeBaseClass(_key) {
    let Key = _key;

    this.update = async function(_newItem) {
      let item = await this.getAll();
      let found = false;

      for (let i = 0; i < data.length; i++)
      {
        if (data[i].id != _newItem.id) continue;
        data[i] = _newItem;
        found = true;
      }

      if (!found) data.push(_newItem);

      return This.setData(Key, data);
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


    this.remove = async function(_id) {
      let items = await this.getAll();
      
      for (let i = 0; i < items.length; i++)
      {
        if (items[i].id != _id) continue;
        items.splice(i, 1);
        
        return This.setData(Key, items);
      }
      return false;
    } 


    this.getAll = async function() {
      let items = await This.getData(Key);
      if (!items) return [];
      return items;
    }
  }
}






function LocalDB_ProjectInterface(_projectId, _DB) {
  let This = this;
  let DB = _DB;
  this.id = _projectId;


  this.getData = function(_key) {
    return new Promise(function (resolve, error) {
      let store = DB.transaction(_key, "readonly").objectStore(_key);
      let request = store.get(This.id);
      
      request.onsuccess = function(_e) {
        resolve(request.result);
      }
    });
  }

  this.setData = function(_key, _value) {
    return new Promise(function (resolve, error) {
      const transaction = DB.transaction(_key, "readwrite");
      transaction.onerror = error;
      const store = transaction.objectStore(_key);

      _value.id = This.id;
      let trans2 = store.put(_value, This.id);
      resolve();//TODO actual success-checking
    });
  }


  this.removeData = function(_key) {
    return new Promise(function (resolve, error) {
      const transaction = DB.transaction(_storeKey, "readwrite");
      transaction.onerror = error;

      const store = transaction.objectStore(_storeKey);

      let request = store.delete(This.id);
      request.onerror = error;
      request.onsuccess = function(event) {
        resolve(true);
      }
    });
  }
}

