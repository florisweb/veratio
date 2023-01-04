
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
}