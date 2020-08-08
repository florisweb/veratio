

function GlobalProject(_project) {
  let This    = this;

  this.id     = String(_project.id);
  this.title  = String(_project.title);

  let Local   = LocalDB.getProject(this.id);


  this.serialize = function() {
    return {
      id: this.id,
      title: this.title
    }
  }



  this.tasks = new function() {
    let Type = "task";

    this.get = async function(_id) {
      let result = await fetchData(
        "database/project/" + Type + ".php", 
        "method=get&parameters=" + _id +  
        "&projectId=" + This.id
      );

      let task = Encoder.decodeObj(result);
    

      return task;
    }

    this.getByDate = function(_date) {
      return this.getByDateRange(_date, 1);
    }

    this.getByDateRange = async function(_info = {date: false, range: 1}) {
      let result =  await fetchData(
        "database/project/" + Type + ".php", 
        "method=getByDateRange&parameters=" + 
        Encoder.objToString(_info) + 
        "&projectId=" + This.id
      );
      return Encoder.decodeObj(result);
    }

    this.getByGroup = async function(_info = {type: "", value: "*"}) {
      let result = await fetchData(
        "database/project/" + Type + ".php", 
        "method=getByGroup&parameters=" + 
        Encoder.objToString(_info) + 
        "&projectId=" + This.id
      );
      return Encoder.decodeObj(result);
    }


    this.remove = async function(_id) {
      return await fetchData(
        "database/project/" + Type + ".php", 
        "method=remove&parameters=" + _id + 
        "&projectId=" + This.id
      );
    }

    this.update = async function(_newTask) {
      let result = await fetchData(
        "database/project/" + Type + ".php", 
        "method=update&parameters=" + 
        Encoder.objToString(_newTask) + 
        "&projectId=" + This.id
      );
      return Encoder.decodeObj(result);
    }
  }






  this.users  = new function() {
    let Users = this;

    let Type = "user";
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
      if (!Array.isArray(results)) return false;
      results = Encoder.decodeObj(results);

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
      let result = await fetchData(
        "database/project/" + Type + ".php", 
        "method=update&parameters=" + 
        Encoder.objToString(_newUser) + 
        "&projectId=" + This.id
      );
      return Encoder.decodeObj(result);
    }


    this.remove = function(_id) {
      return fetchData(
        "database/project/" + Type + ".php", 
        "method=remove&parameters=" + _id + 
        "&projectId=" + This.id
      );
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
    let list = [];
    if (_project.tags) list = _project.tags;


    let lastSync = new Date();
    const dateRecensy = 60 * 1000; // miliseconds after which the data is considered out of date



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
      if (!Array.isArray(results)) return false;
      list = Encoder.decodeObj(results);

      lastSync = new Date();
      return list;
    }

    this.getLocalList = function() {
      if (new Date() - lastSync > dateRecensy) this.getAll();
      return list;
    }

    this.getLocal = function(_id) {
      let tags = this.getLocalList();
      for (tag of tags)
      {
        if (tag.id != _id) continue;
        return tag;
      }
      return false;
    }



    this.update = async function(_newTag) {
      let result = await fetchData(
        "database/project/" + Type + ".php", 
        "method=update&parameters=" + 
        Encoder.objToString(_newTag) + 
        "&projectId=" + This.id
      );
      return Encoder.decodeObj(result);
    }


    this.remove = function(_id) {
      return fetchData(
        "database/project/" + Type + ".php", 
        "method=remove&parameters=" + _id + 
        "&projectId=" + This.id
      );
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




