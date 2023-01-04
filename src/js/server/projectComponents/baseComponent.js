
class Project_TypeComponentBaseClass {
  #type;
  #typeClass;
  #project;

  constructor(_type, _typeClass, _project) {
    this.#type      = _type;
    this.#typeClass = _typeClass;
    this.#project   = _project;
  }

  
  // async get(_id) {
  //   let functionRequest = {
  //       action: "get",
  //       type: Type,
  //       parameters: _id,
  //       projectId: This.id,
  //   };

  //   let response = await Server.fetchFunctionRequest(functionRequest);
  //   if (response.error) return await Local[Type].get(_id);

  //   let item = Encoder.decodeObj(response.result);
  //   if (!item) return false;

  //   Local[Type].update(new TypeClass(item, This));

  //   return new TypeClass(item, This);
  // }



  async remove(_id) {
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

  async update(_newItem) {
    let functionRequest = {
        action: "update",
        type: Type,
        parameters: _newItem.export(),
        projectId: This.id,
    };

    let response = await Server.fetchFunctionRequest(functionRequest);

    if (response.error == "E_noConnection" && Local) 
    {
      _newItem.creatorId = This.users.self.id;
      Local[Type].update(_newItem);
      Local.addCachedOperation(functionRequest);
      return new TypeClass(_newItem, This);
    };
    
    if (response.error) return response.result;
    let obj = new TypeClass(response.result, This);
    Local[Type].update(obj);
    return obj;
  }

}
