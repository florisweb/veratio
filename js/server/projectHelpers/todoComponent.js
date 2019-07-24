

function _Server_project_todoComponent(_parent) {
  let Parent = _parent;
  let This = this;

  let DTTemplate = new _Server_project_dataTypeTemplate( 
    Parent.id,
    {
      todos: {
        id: "String",
        title: "String",
        groupType: "String",
        groupValue: "String",
        projectId: "String",
        tagId: "String",
        assignedTo:  "Array",
        creatorId: "String",
        finished: "Boolean"
      }
    }
  );
  this.DTTemplate = DTTemplate;
  //temporarily

  this.list   = DTTemplate.list;
  this.get    = function(_id, _askServer) {return DTTemplate.get(_id, _askServer);}
  this.remove = function(_id) {return DTTemplate.remove(_id);}

  this.update = function(_newItem, _updateServer = true) {
    _newItem.projectId = Parent.id;

    // search if the task will be moved from another project, and if so, remove the previous one
    let foundTask = Server.todos.get(_newItem.id);
    if (foundTask && foundTask.projectId != Parent.id)
    {
      Server.getProject(foundTask.projectId).todos.remove(foundTask.id);
    }

    return DTTemplate.update(_newItem, _updateServer);
  }



  this.getTodosByDate = function(_date, _askServer) {
    let todosOnDate = [];
    let targetDate = new Date().setDateFromStr(_date);

    if (_askServer) DTTemplate.DB.getByDate(_date);

    for (let i = 0; i < DTTemplate.list.length; i++)
    {
      let curItem = DTTemplate.list[i];
      if (curItem.groupType != "date") continue;
      let curItemsDate = new Date().setDateFromStr(curItem.groupValue);
      if (!curItemsDate.compareDate(targetDate)) continue;
      todosOnDate.push(curItem);
    }
    return todosOnDate;
  }


  this.sync = function() {
    DTTemplate.DB.getByDateRange(new Date().moveDay(-1), 8);
  }










  // custom functions
  DTTemplate.DB.getAll = null;
  DTTemplate.DB.getByDate = function(_date) {
    return DTTemplate.DB.getByDateRange(_date, 1);
  }

  DTTemplate.DB.getByDateRange = function(_date, _range) {
    if (typeof _date == "object") _date = _date.toString();
    let actualParams = {date: _date, range: _range};
    let parameters = "projectId=" + Parent.id + "&dataType=" + DTTemplate.DataType + "&method=getByDateRange&parameter=" + JSON.stringify(actualParams);
    
    return REQUEST.send("database/project/simpleOperation.php", parameters).then(
      function (_results) {
        if (typeof _results != "object") return false;
        
        for (let i = 0; i < _results.length; i++) 
        {
          _results[i].projectId = Parent.id;
          This.DTTemplate.update(_results[i], false);
        }
      }
    ).catch(function () {});
  }

}



