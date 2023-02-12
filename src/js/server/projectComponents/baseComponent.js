
class Project_TypeComponentBaseClass {
  #type;
  #typeClass;
  _project;

  get #shortTypeName() {
    return this.#type.substr(0, this.#type.length - 1); 
  }

  constructor(_type, _typeClass, _project) {
    this.#type      = _type;
    this.#typeClass = _typeClass;
    this._project   = _project;
  }


  async remove(_id) {
    let url = 'database/action/' + this.#shortTypeName + '/remove.php'; 
    let response = await Server.fetchData(url, "id=" + _id + "&projectId=" + this._project.id);
    if (response.error) return response.error;
    return response.result;
  }

  async update(_newItem) {
    let url = 'database/action/' + this.#shortTypeName + '/update.php'; 
    let response = await Server.fetchData(url, "item=" + JSON.stringify(_newItem.export()) + "&projectId=" + this._project.id);
    if (response.error) return response.error;
    return new this.#typeClass(response.result, this._project);
  }
}
