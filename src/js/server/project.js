

class Project extends ProjectData {
  _Local;
  users = new Project_userComponent(this);
  tasks = new Project_taskComponent(this);
  tags  = new Project_tagComponent(this);

  constructor() {
    super();
  }

  update() {

  }

  async rename(_newTitle) {
    let response = await Server.fetchData('database/action/project/rename.php', "projectId=" + this.id + "&title=" + _newTitle);
    if (response.error) return response.error;
    this.title = response.title;
    return response.result;
  }

  async remove() {

  }



  async import(_data) {
    this.users.import(_data.users);
    this.tags.import(_data.tags);
    delete _data.users;
    delete _data.tags;
    let response = super.import(_data);
    
    // Garantees that the _Local project is always present - and if not, create a new one locally.
    let access = await LocalDB.getProjectAccess();
    this._Local = await access.getProject(this.id, this);
    if (this._Local.error === E_LocalProjectNotFound)
    {
      this._Local = await access.createLocalProject(this);
    }

    return response;
  }

  async importFromLocalProject(_local) {
    super.import({
      id: _local.id,
      title: _local.title
    });
    this.users.import(await _local.users.getAll());
    this.tags.import(await _local.tags.getAll());
    this._Local = _local;
    return this;
  }
}

