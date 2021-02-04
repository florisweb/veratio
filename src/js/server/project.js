





function GlobalProject() {
  this.tasks = new function() {
    let Type = "tasks";
    TypeBaseClass.call(this, Type);

    this.getByDate = function(_date) {
      return this.getByDateRange({date: _date, range: 0});
    }

    this.getByDateRange = async function(_info = {date: false, range: 1}) {
      let projects = await Server.getProjectList();
      let tasks = [];
      let promises = [];
      for (let i = 0; i < projects.length; i++)
      {
        let promise = projects[i].tasks.getByDateRange(_info).then(function(_result) {
          if (!_result) return;
          tasks = tasks.concat(_result);
        });
        promises.push(promise);
      };

      await Promise.all(promises);

      return tasks;
    }

    this.getByGroup = async function(_info = {type: "", value: "*"}) { 
      let projects = await Server.getProjectList();
      let returnValue = [];

      let promises = [];
      for (let i = 0; i < projects.length; i++)
      {
        let promise = projects[i].tasks.getByGroup(_info).then(function(_result) {
          if (!_result) return;
          returnValue = returnValue.concat(_result);
        });

        promises.push(promise);
      }
      await Promise.all(promises);

      return returnValue;
    }
  }


  this.users = new function() {
    let Users = this;

    let Type = "users";
    TypeBaseClass.call(this, Type);


    
    this.get = async function(_id) {
      let users = await this.getAll();
      for (user of users)
      {
        if (user.id != _id) continue;
        return user;
      }
      return false;
    }

    this.getAll = async function() {
      let projects = await Server.getProjectList();
      let returnValue = [];

      let promises = [];
      for (let i = 0; i < projects.length; i++)
      {
        let promise = projects[i].users.getAll().then(function(_result) {
          if (!_result) return;
          returnValue = returnValue.concat(_result);
        });

        promises.push(promise);
      }

      await Promise.all(promises);

      return returnValue;
    }
  }



  this.tags = new function() {
    let Type = "tags";
    TypeBaseClass.call(this, Type);

    this.get = async function(_id) {
      let tags = await this.getAll();
      for (tag of tags)
      {
        if (tag.id != _id) continue;
        return tag;
      }
      return false;
    }

    this.getAll = async function() {
      let projects = await Server.getProjectList();
      let returnValue = [];

      let promises = [];
      for (let i = 0; i < projects.length; i++)
      {
        let promise = projects[i].tags.getAll().then(function(_result) {
          if (!_result) return;
          returnValue = returnValue.concat(_result);
        });

        promises.push(promise);
      }

      await Promise.all(promises);

      return returnValue;
    }
  }



  function TypeBaseClass(_type) {
    let Type = _type;

    this.get = async function(_id) {
      let projects = await Server.getProjectList();
      for (let i = 0; i < projects.length; i++)
      {
        let result = await projects[i][Type].get(_id);
        if (!result) continue;
        return result;
      }
      return false;
    }

    this.remove = async function(_id) {
      let projects = await Server.getProjectList();
      for (let i = 0; i < projects.length; i++)
      {
        let result = await projects[i][Type].remove(_id);
        if (!result) continue;
        return result;
      }
      return false;
    }

    this.update = async function(_newItem) {
      console.warn("Global.update", _newItem, Type);
      // let projects = await Server.getProjectList();
      // for (let i = 0; i < projects.length; i++)
      // {
      //   let result = await projects[i][Type].get(_id);
      //   if (!result) continue;
      //   return result;
      // }
      // return false;
    }
  }
}









function Project(_project) {
  const This          = this;
  const cacheLifeTime = 10000; // ms


  this.id     = String(_project.id);
  this.title  = String(_project.title);




  let Local;
  this.setup = async function() {
    Local = await LocalDB.getProject(this.id, true);
  }



  this.rename = async function(_newTitle) {
    if (!_newTitle) return false;

    let functionRequest = {
      action: "rename",
      type: "project",
      parameters: _newTitle,
      projectId: this.id,
    };

    let response = await Server.fetchFunctionRequest(functionRequest);
    if (response.error == "E_noConnection") 
    {
      Local.rename(_newTitle);
      Local.addCachedOperation(functionRequest);
      return true;
    }
    
    if (response.result) Local.rename(_newTitle);
    return response.result;
  }


  this.remove = async function() {
    let functionRequest = {
      action: "remove",
      type: "project",
      projectId: this.id,
    };

    let response = await Server.fetchFunctionRequest(functionRequest);

    if (response.result && response.error != "E_noConnection") Local.remove();
    return response.result;
  }

  this.leave = async function() {
    if (!this.users.Self) return;
    return await this.users.remove(this.users.Self.id);
  }








  this.tasks = new function() {
    let Type = "tasks";
    TypeBaseClass.call(this, Type);

    this.getByDate = async function(_date) {
      return await this.getByDateRange({date: _date, range: 0});
    }

    this.getByDateRange = async function(_info = {date: false, range: 1}) {
      if (_info.date && _info.date.constructor.name == "Date") _info.date = _info.date.toString();

      let functionRequest = {
        action:       "getByDateRange",
        type:         "tasks",
        parameters:   _info,
        projectId:    This.id,
      };

      let result = await Server.fetchFunctionRequest(functionRequest);
      if (result.error) return await Local.tasks.getByDateRange(_info); // When an error accurs fall back on the local data
      
      if (Local) new Promise(async function () { // Store data Localily  
        let foundTasks = await Local.tasks.getByDateRange(_info);
        
        for (let i = 0; i < foundTasks.length; i++) await Local.tasks.remove(foundTasks[i]);

        for (date in result.result)
        {
          let data = result.result[date];
          for (let i = 0; i < data.length; i++) await Local.tasks.update(data[i]);
        }
      });

      return result.result;
    }

    this.getByGroup = async function(_info = {type: "", value: "*"}) {
      let functionRequest = {
        action:       "getByGroup",
        type:         "tasks",
        parameters:   _info,
        projectId:    This.id,
      };

      let response = await Server.fetchFunctionRequest(functionRequest);
      if (response.error) return await Local[Type].getByGroup(_info);

      if (Local) Local.tasks.getByGroup(_info).then(function (_result) {
        overWriteLocalData(response.result, _result);
      });

      return response.result;
    }


    async function overWriteLocalData(_result, _localEquivalant) {
      for (let i = 0; i < _localEquivalant.length; i++)   await Local.tasks.remove(_localEquivalant[i].id);
      for (let i = 0; i < _result.length; i++)            await Local.tasks.update(_result[i]);
    }
  }


  this.users = new function() {
    let Users = this;

    let Type = "users";
    TypeBaseClass.call(this, Type);

    this.list = [];
    if (_project.users && _project.users.length !== undefined) 
    {
      this.list = _project.users;
      setSelf(this.list);
    }

    this.Self;


    
    this.get = async function(_id) {
      let users = await this.getAll();
      for (user of users)
      {
        if (user.id != _id) continue;
        return user;
      }
      return false;
    }



    let lastRequestTime = false;
    let curFetchPromise = false;

    this.getAll = async function(_forceRequest = false) {
      if (new Date() - lastRequestTime < cacheLifeTime && Server.connected && !_forceRequest) 
      {
        if (curFetchPromise) await curFetchPromise;
        return this.list;
      }
      lastRequestTime = new Date();


      let functionRequest = {
        action:       "getAll",
        type:         "users",
        projectId:    This.id,
      };

      curFetchPromise = Server.fetchFunctionRequest(functionRequest);
      let response    = await curFetchPromise;
      curFetchPromise = false;

      if (response.error == "E_noConnection") 
      {
        let users = await Local.users.getAll();
        setSelf(users);
        return users;
      }

      if (response.error) return false;
      if (Local) Local.users.set(response.result);
      
      lastSync = new Date();

      setSelf(response.result);
      this.list = response.result;
      return this.list;
    }






    function setSelf(_userList = []) {
      for (user of _userList) 
      {
        if (!user.Self) continue;
        Users.Self = new Project_userComponent_Self(user);
        break;
      }
    }


    this.inviteByEmail = async function(_email) {
      let functionRequest = {
        action:       "inviteByEmail",
        type:         "users",
        parameters:   _email,
        projectId:    This.id
      }

      return await Server.fetchFunctionRequest(functionRequest);
    }

    this.inviteByLink = async function() {
      let functionRequest = {
        action:       "inviteByLink",
        type:         "users",
        projectId:    This.id,
      };

      return await Server.fetchFunctionRequest(functionRequest);
    }
  }



  this.tags = new function() {
    let Type = "tags";
    TypeBaseClass.call(this, Type);

    this.list = [];
    if (_project.tags && _project.tags.length !== undefined) this.list = _project.tags.map(function (tag) {tag.colour = new Color(tag.colour); return tag});

    this.get = async function(_id) {
      let tags = await this.getAll();
      for (tag of tags)
      {
        if (tag.id != _id) continue;
        return tag;
      }
      return false;
    }




    let lastRequestTime = false;
    let curFetchPromise = false;

    this.getAll = async function(_forceRequest = false) {
      if (new Date() - lastRequestTime < cacheLifeTime && Server.connected && !_forceRequest) 
      {
        if (curFetchPromise) await curFetchPromise;
        return this.list;
      }
      lastRequestTime = new Date();
    

      let functionRequest = {
          action: "getAll",
          type: Type,
          projectId: This.id,
      };

      curFetchPromise = Server.fetchFunctionRequest(functionRequest);
      let response    = await curFetchPromise;
      curFetchPromise = false;

      if (response.error == "E_noConnection") return (await Local.tags.getAll()).map(function(tag) {tag.colour = new Color(tag.colour); return tag});

      if (response.error) return false;

      this.list = [];

      if (Local) Local.tags.set(response.result);
      for (let i = 0; i < response.result.length; i++)
      {
        this.list[i]        = response.result[i];
        this.list[i].colour = new Color(response.result[i].colour);
      }

      return this.list;
    }
  }



  function TypeBaseClass(_type) {
    let Type = _type;

    this.get = async function(_id) {
      let functionRequest = {
          action: "get",
          type: Type,
          parameters: _id,
          projectId: This.id,
      };

      let response = await Server.fetchFunctionRequest(functionRequest);

      if (response.error) return await Local[Type].get(_id);

      let item = Encoder.decodeObj(response.result);
      Local[Type].update(item);

      return item;
    }

    this.remove = async function(_id) {
      let functionRequest = {
          action: "remove",
          type: Type,
          parameters: _id,
          projectId: This.id,
      };

      let response = await Server.fetchFunctionRequest(functionRequest);

      if (response.error == "E_noConnection" && Local) 
      {
        Local[Type].remove(_id);
        Local.addCachedOperation(functionRequest);
        return true;
      } 

      if (response.result && Local) Local[Type].remove(_id);

      return response.result;
    }

    this.update = async function(_newItem) {
      let functionRequest = {
          action: "update",
          type: Type,
          parameters: _newItem,
          projectId: This.id,
      };

      let response = await Server.fetchFunctionRequest(functionRequest);

      if (response.error == "E_noConnection" && Local) 
      {
        Local[Type].update(_newItem);
        Local.addCachedOperation(functionRequest);

        return _newItem;
      }
      
      if (!response.error && Local) Local[Type].update(response.result);
      return response.result;
    }
  }
}












function Project_userComponent_Self(_user) {
  let permissions = _user.permissions;

  let This = this;
  this.id           = _user.id;
  this.name         = _user.name;


  this.permissions  = new function () {
    this.value = permissions;

    this.project = new function() {
      this.rename = permissions >= 2;
      this.remove = permissions >= 3;
    }
    
    this.tasks = new function() {
      this.update  = permissions >= 1;
      this.remove  = permissions >= 1;
      this.finish  = function(_task) {
        if (_task.assignedTo.includes(This.id)) return true;
        return permissions >= 1;
      }
    }

    this.tags = new function() {
      this.update = permissions >= 1;
      this.remove = permissions >= 1;
    }


    this.users = new function() {
      this.invite = permissions >= 2;

      this.changePermissions = function(_user) {
        if (permissions < _user.permissions) return false;
        return permissions >= 2;
      }
      this.remove = function(_user) {
        if (permissions < _user.permissions) return false;
        return permissions >= 2;
      }
    }
  }
}
