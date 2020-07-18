





const LocalDB = new function() {
  const DBName = "veratioDB";
  let DBVersion = 3;

  let DB; getDB();

  this.projectList = [];



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

      updateProjectList();
    }

    request.onerror = function(_e) {
      console.warn("error", _e);
    }
  }



  async function updateProjectList() {
    LocalDB.projectList = [];

    let ids = await getProjectIdList();

    for (let i = 0; i < ids.length; i++)
    {
      let project = new LocalDB_Project(ids[i], DB);
      LocalDB.projectList.push(project);
    }
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



  this.getProject = function(_projectId) {
    for (let i = 0; i < this.projectList.length; i++)
    {
      if (this.projectList[i].id != _projectId) continue;
      return this.projectList[i];
    }
    return false;
  }


  this.addProject = async function(_id, _title = "A nameless project") {
    let project = new LocalDB_Project(_id, DB);

    await project.setData("metaData", {title: _title});
    console.log(project);
    this.projectList.push(project);
    return project;
  }
}





function LocalDB_Project(_projectId, _DB) {
  let This = this;
  let DB = _DB;
  this.id = _projectId;



  this.setData = setData;

  this.getData = getData;

  function getData(_key) {
    return new Promise(function (resolve, error) {
      let store = DB.transaction(_key, "readonly").objectStore(_key);
      let request = store.get(This.id);
      
      request.onsuccess = function(_e) {
        resolve(request.result);
      }
    });
  }

  function setData(_key, _value) {
    return new Promise(function (resolve, error) {
      const transaction = DB.transaction(_key, "readwrite");
      transaction.onerror = error;
      const store = transaction.objectStore(_key);

      _value.id = This.id;
      let trans2 = store.put(_value, This.id);
      trans2.transaction.onsuccess = function () {console.log("uscc"); resolve()};
    });
  }
}
//let project = LocalDB.getProject("testId2");
//let project2 = LocalDB.getProject("testId3");

//setData("metaData", {title: "testProject"});





