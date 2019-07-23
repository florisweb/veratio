

function _Server_project_userComponent(_parent) {
  let Parent = _parent;
  let This = this;

  let DTTemplate = new _Server_project_dataTypeTemplate( 
    Parent.id,
    {
      users: {
        id: "String",
        name: "String",
        permissions: "String",
        Self: "Boolean",
        isOwner: "Boolean"
      }
    }
  );

  this.DTTemplate = DTTemplate;

  this.ownId    = "";

  this.get      = function(_id)       {return DTTemplate.get(_id);}
  this.update   = function(_newItem)  {return DTTemplate.update(_newItem);}
  this.remove   = function(_id)       {return DTTemplate.remove(_id);}

  this.getList  = function()          {return DTTemplate.list;}
  this.sync     = function()          {DTTemplate.DB.getAll();}




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
          if (_results[i].Self) This.ownId = _results[i].id;
          DTTemplate.update(_results[i], false);
        }
      }
    ).catch(function () {});
  }
}



