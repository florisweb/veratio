

function GlobalProject(_project) {
  let This    = this;

  this.id     = String(_project.id);
  this.title  = String(_project.title);

  let Local;
  this.setup = async function() {
    if (this.id == "*") return;
    Local = await LocalDB.getProject(this.id);
  }


  this.tasks = new function() {
    let Type = "task";
    TypeBaseClass.call(this, Type);

    this.getByDate = function(_date) {
      return this.getByDateRange({date: _date, range: 0});
    }

    this.getByDateRange = async function(_info = {date: false, range: 1}) {
      let result = await fetchData(
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
      let result = await fetchData(
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






  this.users  = new function() {
    let Users = this;

    let Type = "user";
    TypeBaseClass.call(this, Type);

    let list = [];
    if (_project.users) 
    {
      list = _project.users; 
      setSelf(list);
    };

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
      let results = await fetchData(
        "database/project/" + Type + ".php", 
        "method=getAll" + 
        "&projectId=" + This.id
      );

      if (results == "E_noConnection") return await Local.users.getAll();

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


    function setSelf(_userList) {
      for (user of _userList) 
      {
        if (!user.Self) continue;
        Users.Self = user;
        break;
      }
    }



    this.update = async function(_newUser) {
      let result = Encoder.decodeObj(await fetchData(
        "database/project/" + Type + ".php", 
        "method=update&parameters=" + 
        Encoder.objToString(_newUser) + 
        "&projectId=" + This.id
      ));

      if (result && typeof result != "string") Local.users.update(result);

      return result;
    }


    this.remove = function(_id) {
      let result = fetchData(
        "database/project/" + Type + ".php", 
        "method=remove&parameters=" + _id + 
        "&projectId=" + This.id
      );
      if (result) Local.users.remove(_id);

      return result;
    }


    this.inviteByEmail = function(_email) {
      return fetchData(
        "database/project/" + Type + ".php", 
        "method=inviteByEmail&parameters=" + Encoder.encodeString(_email) +
        "&projectId=" + This.id
      );
    }

    this.inviteByLink = function() {
      return fetchData(
        "database/project/" + Type + ".php", 
        "method=inviteByLink" + 
        "&projectId=" + This.id
      );
    }
  }



  this.tags  = new function() {
    let Type = "tag";
    TypeBaseClass.call(this, Type);

    let list = [];
    if (_project.tags) list = _project.tags;


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
      let results = await fetchData(
        "database/project/" + Type + ".php", 
        "method=getAll" + 
        "&projectId=" + This.id
      );
      
      if (results == "E_noConnection") return await Local.tags.getAll();

      if (!Array.isArray(results)) return false;
      list = Encoder.decodeObj(results);

      await Local.tags.removeAll();
      for (let i = 0; i < list.length; i++)
      {
        await Local.tags.update(list[i]);
      }


      lastSync = new Date();
      return list;
    }


    this.update = async function(_newTag) {
      let result = Encoder.decodeObj(
        await fetchData(
          "database/project/" + Type + ".php", 
          "method=update&parameters=" + 
          Encoder.objToString(_newTag) + 
          "&projectId=" + This.id
        )
      );

      if (result && typeof result != "string") Local.tags.update(result);

      return result;
    }


    this.remove = function(_id) {
      let result = fetchData(
        "database/project/" + Type + ".php", 
        "method=remove&parameters=" + _id + 
        "&projectId=" + This.id
      );
      
      if (result) Local.users.remove(_id);
      return result;
    }
  }



  function TypeBaseClass(_type) {
    let Type = _type;

    this.get = async function(_id) {
      let result = await fetchData(
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
      let result = await fetchData(
        "database/project/" + Type + ".php", 
        "method=remove&parameters=" + _id + 
        "&projectId=" + This.id
      );

      if (result && Local) Local[Type + "s"].remove(_id);

      return result;
    }

    this.update = async function(_newItem) {
      let result = Encoder.decodeObj(
        await fetchData(
          "database/project/" + Type + ".php", 
          "method=update&parameters=" + 
          Encoder.objToString(_newItem) + 
          "&projectId=" + This.id
        )
      );

      if (Local && result) Local[This + "s"].update(result);
      return result;
    }
  }
}







function Project(_project) {
  GlobalProject.call(this, _project);

  let This    = this;
  this.title  = String(_project.title);

  
  this.sync = function() {
    return Promise.all([
      this.users.getAll(),
    ]);    
  }




  this.leave = function() {
    if (!this.users.Self) return;
    this.users.remove(this.users.Self.id);
    return App.update();
  }


  this.rename = async function(_newTitle) {
    if (!_newTitle) return false;
    
    let result = await fetchData(
      "database/project/rename.php",
      "projectId=" + This.id + "&newTitle=" + Encoder.encodeString(_newTitle)
    );
    this.title = _newTitle;
    return result;
  }


  this.remove = async function() {
    let result = await fetchData(
      "database/project/remove.php",
      "projectId=" + This.id
    );

    return result;
  }
}

