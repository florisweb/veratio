
class Project_taskComponent extends Project_TypeComponentBaseClass {
  #list = [];
  constructor(_project) {
    super("tasks", Task, _project);
  }

    //  this.moveInFrontOf = async function({id, inFrontOfId, isPersonal}) {
    //   let functionRequest = {
    //     action:       "moveInFrontOf",
    //     type:         "tasks",
    //     parameters:   {id: id, inFrontOfId: inFrontOfId, isPersonal: !!isPersonal},
    //     projectId:    This.id,
    //   };

    //   let response = await Server.fetchFunctionRequest(functionRequest);

    //   if (response.error == 'E_noConnection')
    //   {
    //     await Local.addCachedOperation(functionRequest);
    //     if (!isPersonal)
    //     {
    //       await Local.tasks.moveInFrontOf({id: id, inFrontOfId: inFrontOfId});
    //     } else {
    //       await Server.global.getLocal().tasks.moveInFrontOf({id: id, inFrontOfId: inFrontOfId});
    //     }
    //   } else if(!response.error && response.result)
    //   {
    //     if (!isPersonal)
    //     {
    //       Local.tasks.moveInFrontOf({id: id, inFrontOfId: inFrontOfId});
    //     } else {
    //       Server.global.getLocal().tasks.moveInFrontOf({id: id, inFrontOfId: inFrontOfId});
    //     }
    //   }

    //   return response.result;
    // }

  async fetchAll() {
    let response = await Server.fetchData("database/project/getProjectTasks.php", "projectId=" + this._project.id);
    if (response.error) return response.error;
    return response.result.map(task => new Task(task, this._project));
  }


  async getByDate(_date) {
      return await this.getByDateRange({date: _date, range: 0});
  }
  
  async getByDateRange({date = new Date(), range = 1}, _fromCache) {
    let response = await Server.fetchData('database/action/task/getByDateRange.php', "date=" + date.toString() + "&range=" + Math.max(0, range) + "&projectId=" + this._project.id);
    if (response.error) return response.error;
    return response.result.map(task => new Task(task, this._project));
  }
  
  async getByGroup({groupType = 'default', groupValue = '*'}, _fromCache) {
    let response = await Server.fetchData('database/action/task/getByGroup.php', "groupType=" + groupType + "&groupValue=" + groupValue + "&projectId=" + this._project.id);
    if (response.error) return response.error;
    return response.result.map(task => new Task(task, this._project));
  }


  // async getByDateRange(_info = {date: false, range: 1}, _fromCache) {
  //   if (_info.date && _info.date.constructor.name == "Date") _info.date = _info.date.toString();

  //   let functionRequest = {
  //     action:       "getByDateRange",
  //     type:         "tasks",
  //     parameters:   _info,
  //     projectId:    This.id,
  //   };

  //   let response = await Server.fetchFunctionRequest(functionRequest);
  //   if (response.error) return await Local.tasks.getByDateRange(_info);
  //   response.result = response.result.map(r => new Task(r, This));

  //   new Promise(async function (resolve) { // Store data Localily  
  //     let foundTasks = await Local.tasks.getByDateRange(_info);

  //     for (let i = 0; i < foundTasks.length; i++) await Local.tasks.remove(foundTasks[i]);
  //     for (let task of response.result) await Local.tasks.update(task);
  //     resolve();
  //   });

  //   return response.result;
  // }

  // async getByGroup(_info = {type: "", value: "*"}) {
  //   let functionRequest = {
  //     action:       "getByGroup",
  //     type:         "tasks",
  //     parameters:   _info,
  //     projectId:    This.id,
  //   };

  //   let response = await Server.fetchFunctionRequest(functionRequest);
  //   if (response.error) return await Local.tasks.getByGroup(_info);
  //   response.result = response.result.map(r => new Task(r, This));

  //   Local.tasks.getByGroup(_info).then((_result) => {
  //     this.#overWriteLocalData(response.result, _result);
  //   });

  //   return response.result;
  // }


  // async #overWriteLocalData(_result, _localEquivalant) {
  //   for (let i = 0; i < _localEquivalant.length; i++)   await Local.tasks.remove(_localEquivalant[i].id);
  //   for (let i = 0; i < _result.length; i++)            await Local.tasks.update(_result[i]);
  // }
}