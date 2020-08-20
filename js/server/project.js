





function GlobalProject() {
  this.tasks = new function() {
    let Type = "task";
    TypeBaseClass.call(this, Type);

    this.getByDate = function(_date) {
      return this.getByDateRange({date: _date, range: 0});
    }

    this.getByDateRange = async function(_info = {date: false, range: 1}) {
      let projects = await Server.getProjectList();
      let returnValue = {};
      let promises = [];
      for (let i = 0; i < projects.length; i++)
      {
        let promise = projects[i].tasks.getByDateRange(_info).then(function(_result) {
          if (!_result) return;
          for (key in _result)
          {
            if (!returnValue[key]) returnValue[key] = [];
            returnValue[key] = returnValue[key].concat(_result[key]);
          }
        });
        promises.push(promise);
      }
      await Promise.all(promises);

      return returnValue;
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

    let Type = "user";
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
    let Type = "tag";
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
  let This    = this;

  this.id     = String(_project.id);
  this.title  = String(_project.title);

  let Local;
  this.setup = async function() {
    Local = await LocalDB.getProject(this.id);
  }

  this.rename = async function(_newTitle) {
    if (!_newTitle) return false;
    
    let result = await Server.fetchData(
      "database/project/rename.php",
      "projectId=" + This.id + "&newTitle=" + Encoder.encodeString(_newTitle)
    );

    if (result == "E_noConnection") 
    {
      Local.rename(_newTitle);
      Local.addCachedOperation({
        action: "rename",
        type: "project",
        parameters: _newTitle
      });
      return true;
    }
    
    if (result) Local.rename(_newTitle);
    return result;
  }


  this.remove = async function() {
    let result = await Server.fetchData(
      "database/project/remove.php",
      "projectId=" + this.id
    );

    if (result && result != "E_noConnection") Local.remove();
    return result;
  }

  this.leave = async function() {
    if (!this.users.Self) return;
    return await this.users.remove(this.users.Self.id);
  }








  this.tasks = new function() {
    let Type = "task";
    TypeBaseClass.call(this, Type);

    this.getByDate = function(_date) {
      return this.getByDateRange({date: _date, range: 0});
    }

    this.getByDateRange = async function(_info = {date: false, range: 1}) {
      let result = await Server.fetchData(
        "database/project/" + Type + ".php", 
        "method=getByDateRange&parameters=" + 
        Encoder.objToString(_info) + 
        "&projectId=" + This.id
      );

      if (result == "E_noConnection") return await Local.tasks.getByDateRange(_info);
      result = Encoder.decodeObj(result);

      if (Local) // Store data Localily
      {
        let foundTasks = await Local.tasks.getByDateRange(_info);
        for (let i = 0; i < foundTasks.length; i++) await Local.tasks.remove(foundTasks[i]);
        for (date in result)
        {
          for (let i = 0; i < result[date].length; i++) await Local.tasks.update(result[date][i]);
        }
      }

      return result;
    }

    this.getByGroup = async function(_info = {type: "", value: "*"}) {
      let result = await Server.fetchData(
        "database/project/" + Type + ".php", 
        "method=getByGroup&parameters=" + 
        Encoder.objToString(_info) + 
        "&projectId=" + This.id
      );

      if (result == "E_noConnection") return await Local[Type + "s"].getByGroup(_info);
      result = Encoder.decodeObj(result);

      if (Local) // Store data Localily
      {
        overWriteLocalData(result, await Local.tasks.getByGroup(_info));
      }

      return result;
    }



    async function overWriteLocalData(_result, _localEquivalant) {
      for (let i = 0; i < _localEquivalant.length; i++) await Local.tasks.remove(_localEquivalant[i].id);
      for (let i = 0; i < _result.length; i++)           await Local.tasks.update(_result[i]);
    }
  }


  this.users = new function() {
    let Users = this;

    let Type = "user";
    TypeBaseClass.call(this, Type);

    let list = [];
    
    if (_project.users && _project.users.length !== undefined) 
    {
      list = _project.users;
      setSelf(list);
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

    this.getAll = async function() {
      let results = await Server.fetchData(
        "database/project/" + Type + ".php", 
        "method=getAll" + 
        "&projectId=" + This.id
      );

      if (results == "E_noConnection") 
      {
        let users = await Local.users.getAll();
        setSelf(users);
        return users;
      }



      if (!Array.isArray(results)) return false;
      results = Encoder.decodeObj(results);

      await Local.users.removeAll();
      for (let i = 0; i < results.length; i++)
      {
        await Local.users.update(results[i]);
      }

      setSelf(results);

      list = results;
      
      lastSync = new Date();
      return results;
    }


    function setSelf(_userList = []) {
      for (user of _userList) 
      {
        if (!user.Self) continue;
        Users.Self = new Project_userComponent_Self(user);
        break;
      }
    }


    this.inviteByEmail = function(_email) {
      return Server.fetchData(
        "database/project/" + Type + ".php", 
        "method=inviteByEmail&parameters=" + Encoder.encodeString(_email) +
        "&projectId=" + This.id
      );
    }

    this.inviteByLink = function() {
      return Server.fetchData(
        "database/project/" + Type + ".php", 
        "method=inviteByLink" + 
        "&projectId=" + This.id
      );
    }
  }



  this.tags = new function() {
    let Type = "tag";
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
      let results = await Server.fetchData(
        "database/project/" + Type + ".php", 
        "method=getAll" + 
        "&projectId=" + This.id
      );
      
      if (results == "E_noConnection") return (await Local.tags.getAll()).map(function(tag) {tag.colour = new Color(tag.colour); return tag});

      if (!Array.isArray(results)) return false;
      let list = Encoder.decodeObj(results);

      await Local.tags.removeAll();
      for (let i = 0; i < list.length; i++)
      {
        await Local.tags.update(list[i]);
        if (list[i].colour == "Array") console.warn(list[i], results);
        list[i].colour = new Color(list[i].colour);
      }

      return list;
    }
  }



  function TypeBaseClass(_type) {
    let Type = _type;

    this.get = async function(_id) {
      let result = await Server.fetchData(
        "database/project/" + Type + ".php", 
        "method=get&parameters=" + _id +  
        "&projectId=" + This.id
      );

      if (result == "E_noConnection") return await Local[Type + "s"].get(_id);

      let item = Encoder.decodeObj(result);
      Local[Type + "s"].update(item); // TEMP naming scheme should always use the plural

      return item;
    }

    this.remove = async function(_id) {
      let result = await Server.fetchData(
        "database/project/" + Type + ".php", 
        "method=remove&parameters=" + _id + 
        "&projectId=" + This.id
      );

      if (result == "E_noConnection" && Local) 
      {
        Local[Type + "s"].remove(_id);
        Local.addCachedOperation({
          action: "remove",
          type: Type + "s",
          parameters: _id
        });
        return true;
      } 
      if (result && Local) Local[Type + "s"].remove(_id);

      return result;
    }

    this.update = async function(_newItem) {
      let result = Encoder.decodeObj(
        await Server.fetchData(
          "database/project/" + Type + ".php", 
          "method=update&parameters=" + 
          Encoder.objToString(_newItem) + 
          "&projectId=" + This.id
        )
      );

      if (result == "E_noConnection" && Local) 
      {
        Local[Type + "s"].update(_newItem);
        Local.addCachedOperation({
          action: "update",
          type: Type + "s",
          parameters: _newItem
        });
        return _newItem;
      }
      if (result && Local) Local[Type + "s"].update(result);

      return result;
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

