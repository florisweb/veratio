

function _Server_project_tagComponent(_parent) {
  let Parent = _parent;

  let DTTemplate = new _Server_project_dataTypeTemplate( 
    Parent.id,
    {
      tag: {
        id:         "String",
        title:      "String",
        colour:     "String",
        creatorId:  "String"
      }
    }
  );

  this.list = DTTemplate.list;


  this.get = function(_id, _askServer = false)  {return DTTemplate.get(_id, _askServer);}
  this.update = function(_newItem)      {return DTTemplate.update(_newItem);}
  this.remove = function(_id)           {return DTTemplate.remove(_id);}


  this.sync = function() {
    DTTemplate.DB.getAll();
  }
}
