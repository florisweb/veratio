
class Project_userComponent extends Project_TypeComponentBaseClass {
  #list = [];
  constructor(_project) {
    super("users", User, _project);
  }
  import(_users = []) {
    this.#list = _users.map(data => new User(data));
  }

  get(_id) {
    return this.#list.find((_user) => _user.id === _id);
  }
  get list() {
    return this.#list;
  }
  get self() {
    let self = this.#list.find((_user) => _user.self);
    return new Project_userComponent_Self(self);
  }

  async fetchAll() {
    let response = await Server.fetchData("database/action/user/getAll.php", "projectId=" + this._project.id);
    if (response.error) return response.error;
    this.#list = response.result.map(user => new User(user, this._project));
    return this.#list;
  }


  async inviteByEmail(_email) {
    let response = await Server.fetchData("database/action/user/invite/byEmail.php", "projectId=" + this._project.id + "&email=" + _email);
    if (!response.error) await this.fetchAll();
    return response;
  }
  async inviteByLink() {
    let response = await Server.fetchData("database/action/user/invite/byLink.php", "projectId=" + this._project.id);
    if (response.error) return false;
    await this.fetchAll();
    return response.result;
  }
}


function Project_userComponent_Self(_user) {
  let permissions = _user.permissions;

  let This = this;
  this.id           = _user.id;
  this.name         = _user.name;


  this.permissions  = new function () {
    this.value = permissions;

    this.project = new function() {
      this.rename = permissions >= 2;
      this.remove = permissions >= 3;
    }
    
    this.tasks = new function() {
      this.update  = permissions >= 1;
      this.remove  = permissions >= 1;
      this.finish  = function(_task) {
        if (_task.assignedTo.includes(This.id)) return true;
        return permissions >= 1;
      }
    }

    this.tags = new function() {
      this.update = permissions >= 1;
      this.remove = permissions >= 1;
    }


    this.users = new function() {
      this.invite = permissions >= 2;

      this.changePermissions = function(_user) {
        if (permissions < _user.permissions) return false;
        return permissions >= 2;
      }
      this.remove = function(_user) {
        if (permissions < _user.permissions) return false;
        return permissions >= 2;
      }
    }
  }
}