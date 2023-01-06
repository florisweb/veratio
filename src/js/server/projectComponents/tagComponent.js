
class Project_tagComponent extends Project_TypeComponentBaseClass {
  #list = [];
  constructor(_project) {
    super("tags", Tag, _project);
  }
  import(_tags = []) {
    this.#list = _tags.map(data => new Tag(data));
  }

  get(_id) {
    return this.#list.find((_user) => _user.id === _id);
  }
  get list() {
    return this.#list;
  }


  async fetchAll() {
    let response = await Server.fetchData("database/action/tag/getAll.php", "projectId=" + this._project.id);
    if (response.error) return response.error;
    console.log(response);
    this.#list = response.result.map(tag => new Tag(tag, this._project));
    return this.#list;
  }
}