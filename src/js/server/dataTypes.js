
// DataObjects only contain data and do simple data manipulations - only considers public variables to be data the rest are just working variables
class DataObject {
  export() {
    return Object.assign({}, this);
  }
  import(_obj) {
    Object.assign(this, _obj);
    return this;
  }
}



class Tag extends DataObject {
  id;
  title;
  creatorId;
  colour;

  #project;

  constructor(_data, _project) {
    super();
    this.import(_data);
    this.#project = _project;
  }

  import(_data) {
    let impData = Object.assign({}, _data);
    impData.colour = new Color(impData.colour);
    return super.import(impData);
  }
  export() {
    let exData = super.export();
    exData.colour = exData.colour.toHex();
    return exData;
  }
}

class User extends DataObject {
  id;
  name;
  permissions;
  type;
  self;

  #project;
  constructor(_data, _project) {
    super();
    this.import(_data);
    this.#project = _project;
  }
}

class Task extends DataObject {
  id;
  tagId;
  projectId;
  title;
  finished;
  deadline;

  groupType;
  groupValue;
  assignedTo = [];
  creatorId;
  
  personalIndex;
  indexInProject;

  #project;
  get project() {
    if (this.#project) return this.#project;
    return Server.getProject(this.projectId);
  }

  constructor(_data, _project) {
    super();
    this.import(_data);
    this.#project = _project;
  }
}



class ProjectData extends DataObject {
  id;
  title;
  
  export() {
    let data = super.export();
    delete data.users;
    delete data.tags;
    delete data.tasks;
    return data;
  }  
}


