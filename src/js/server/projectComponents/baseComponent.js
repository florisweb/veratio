
class Project_TypeComponentBaseClass {
  #type;
  #typeClass;
  _project;

  constructor(_type, _typeClass, _project) {
    this.#type      = _type;
    this.#typeClass = _typeClass;
    this._project   = _project;
  }


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
    let url = 'database/action/' + this.#type.substr(0, this.#type.length - 1) + '/update.php'; // substr to remove the s
    let response = await Server.fetchData(url, "item=" + JSON.stringify(_newItem.export()) + "&projectId=" + this._project.id);
    if (response.error) return response.error;
    return new this.#typeClass(response.result, this._project);
  }
}
