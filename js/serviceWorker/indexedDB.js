





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


  this.getProjectIdList = getProjectIdList;
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
    return new LocalDB_Project(_projectId, DB);
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
      trans2.transaction.onsuccess = resolve;
    });
  }
}
//let project = LocalDB.getProject("testId2");
//let project2 = LocalDB.getProject("testId3");

//setData("metaData", {title: "testProject"});





