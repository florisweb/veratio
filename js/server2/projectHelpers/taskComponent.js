

function _Server_project_taskComponent(_parent) {
  let Parent = _parent;
  let This = this;

  let DTTemplate = new _Server_project_dataTypeTemplate( 
    Parent.id,
    {
      task: {
        id:         "String",
        title:      "String",
        groupType:  "String",
        groupValue: "String",
        projectId:  "String",
        tagId:      "String",
        assignedTo: "Array",
        creatorId:  "String",
        finished:   "Boolean"
      }
    }
  );
  this.DTTemplate = DTTemplate;
  //temporarily

  this.get    = function(_id,) {return DTTemplate.get(_id);}
  this.remove = function(_id) {return DTTemplate.remove(_id);}

  this.update = async function(_newItem) {
    _newItem.projectId = Parent.id;
    if (!_newItem.creatorId) _newItem.creatorId = Parent.users.Self.id;

    // search if the task will be moved from another project, and if so, remove the previous one
    let foundTask = await Server.global.tasks.get(_newItem.id);
    if (foundTask && foundTask.projectId != Parent.id)
    {
      Server.getProject(foundTask.projectId).tasks.remove(foundTask.id);
    }

    return DTTemplate.update(_newItem);
  }


  this.getTasksByGroup = function(_type = "", _value = "") {
    return DTTemplate.DB.getByGroup(_type, _value);
  }

  this.getTasksByDateRange = function(_date, _range) {
    return DTTemplate.DB.getByDateRange(_date, _range);
  }


  this.getTasksByDate = function(_date) {
    return DTTemplate.DB.getByDate(_date);
  }


  // custom functions
  DTTemplate.DB.getAll = null;
  DTTemplate.DB.getByGroup = function(_groupName, _groupValue) {
    let parameters = "projectId=" + Parent.id + "&dataType=" + DTTemplate.DataType + "&method=getByGroup&parameter=" + JSON.stringify({type: _groupName, value: _groupValue});
    return REQUEST.send("database/project/task.php", parameters).then(
      function (_results) {
        if (typeof _results != "object") return false;
        
        for (let i = 0; i < _results.length; i++) 
        {
          _results[i].projectId = Parent.id;
          DTTemplate.update(_results[i], false);
        }
      }
    ).catch(function () {});
  }

  DTTemplate.DB.getByDate = function(_date) {
    return DTTemplate.DB.getByDateRange(_date, 1);
  }

  DTTemplate.DB.getByDateRange = function(_date, _range) {
    if (typeof _date == "object") _date = _date.toString();
    let actualParams = {date: _date, range: _range};
    let parameters = "projectId=" + Parent.id + "&dataType=" + DTTemplate.DataType + "&method=getByDateRange&parameter=" + JSON.stringify(actualParams);
    
    return REQUEST.send("database/project/task.php", parameters).then(
      function (_results) {
        if (typeof _results != "object") return false;
        
        for (let i = 0; i < _results.length; i++) 
        {
          _results[i].projectId = Parent.id;
          DTTemplate.update(_results[i], false);
        }
      }
    ).catch(function () {});
  }

}



