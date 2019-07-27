

function _Server_project_userComponent(_parent) {
  let Parent = _parent;
  let This = this;

  let DTTemplate = new _Server_project_dataTypeTemplate( 
    Parent.id,
    {
      users: {
        id:           "String",
        name:         "String",
        permissions:  "String",
        Self:         "Boolean",
        isOwner:      "Boolean",
        type:         "String"
      }
    }
  );

  this.DTTemplate = DTTemplate;

  this.Self     = false;

  this.get      = function(_id)       {return DTTemplate.get(_id);}
  this.update   = function(_newItem)  {return DTTemplate.update(_newItem);}
  this.remove   = function(_id)       {return DTTemplate.remove(_id);}

  this.getList  = function()          {return DTTemplate.list;}
  this.sync     = function()          {return DTTemplate.DB.getAll();}


  this.inviteUserByEmail = function(_email) {
    _email = String(_email);
    if (_email.length < 5)              return "E_emailTooShort";
    if (_email.split("@").length == 1)  return "E_invalidEmail";
    if (_email.split(".").length == 1)  return "E_invalidEmail";

    return DTTemplate.DB.inviteUserByEmail(_email);
  }

  // custom functions
  DTTemplate.DB.getAll = function() {
    if (typeof _date == "object") _date = _date.toString();
    let parameters = "projectId=" + Parent.id + "&dataType=" + DTTemplate.DataType + "&method=getAll"
    
    return REQUEST.send("database/project/simpleOperation.php", parameters).then(
      function (_results) {
        if (typeof _results != "object") return false;
        DTTemplate.list = [];
        for (let i = 0; i < _results.length; i++)
        {
          if (_results[i].Self) This.Self = new _Server_project_userComponent_Self(_results[i]);
          DTTemplate.update(_results[i], false);
        }
      }
    ).catch(function () {});
  }
  DTTemplate.DB.inviteUserByEmail = function(_email) {
    return REQUEST.send("/git/todo/database/project/simpleOperation.php", 
      "projectId=" + Parent.id + "&dataType=users&method=inviteByEmail&parameter=" + Encoder.encodeString(_email)
    );
  }
}



function _Server_project_userComponent_Self(_user) {
  this.id           = _user.id;
  this.name         = _user.name;
  let isOwner       = _user.isOwner;
  let Permissions   = JSON.parse(_user.permissions);




  this.taskActionAllowed = function(_action, _task) {
    switch (String(_action).toLowerCase())
    {
      case "remove":
        if (Permissions[1][1] >= 2)                                         return true;
        if (Permissions[1][1] >= 1 && _task.creatorId == this.id)           return true;
      break;
      case "update": 
        if (Permissions[1][1] >= 2)                                         return true;
        if (Permissions[1][1] >= 1 && !_task)                               return true;
        if (Permissions[1][1] >= 1 && _task.creatorId == this.id)           return true;
      break;
      case "finish": 
        if (Permissions[1][0] >= 2) return true;
        if (Permissions[1][0] >= 1 && inArray(_task.assignedTo, this.id))   return true;
        if (Permissions[1][0] >= 0 && _task.creatorId == this.id)           return true;
      break; //finish
      default: 
        console.error("Server.project.users.Self.taskActionAllowed: Action ", _action, " was not found.");
      break;
    }

    return false;
  }

  this.userActionAllowed = function(_action, _user) {
    switch (String(_action).toLowerCase())
    {
      case "remove":
        if (Permissions[2][0] >= 2 && (!_user.isOwner || isOwner)) return true;
      break;
      case "update": 
        if (Permissions[2][1] >= 1 && (!_user.isOwner || isOwner)) return true;
      break;
      case "invite": 
        if (Permissions[2][0] >= 1) return true;
      break;
      default: 
        console.error("Server.project.users.Self.userActionAllowed: Action ", _action, " was not found.");
      break;
    }

    return false;
  }

   this.projectActionAllowed = function(_action) {
    switch (String(_action).toLowerCase())
    {
      case "remove":
        if (Permissions[3][0] >= 2) return true;
      break;
      case "rename": 
        if (Permissions[3][0] >= 1) return true;
      break;
      default: 
        console.error("Server.project.users.Self.projectActionAllowed: Action ", _action, " was not found.");
      break;
    }

    return false;
  }
}






