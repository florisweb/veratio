

class Server_AccessPoints {
  todayTab    = new TodayTabAccessPoint();
  projectTab  = new ProjectTabAccessPoint();
  weekTab     = new WeekTabAccessPoint();
  generalTab  = new GeneralTabAccessPoint();
  constructor() {

  }


}


// AccessPoint: High level request system
class AccessPoint {
  constructor() {

  }
}


class GeneralTabAccessPoint extends AccessPoint {
  async getOverdueTasks(_projectId, _fromCache) {
    let project = Server.getProject(_projectId);
    if (!project) project = Server.global;
    return await project.tasks.getByGroup({groupType: 'overdue'}, _fromCache);
  }
}

class TodayTabAccessPoint extends AccessPoint {
  async getTasks(_fromCache = false) {
    return await Server.global.tasks.getByDate(new Date(), _fromCache);
  }
}



class ProjectTabAccessPoint extends AccessPoint {
  async getPlannedTasks(_projectId, _fromCache) {
    let project = Server.getProject(_projectId);
    if (!project || isError(project)) return false;
    return await project.tasks.getByDateRange({date: new Date(), range: 365}, _fromCache);
  }
  async getDefaultTasks(_projectId, _fromCache) {
    let project = Server.getProject(_projectId);
    if (!project) return false;
    return await project.tasks.getByGroup({groupType: 'default'}, _fromCache);
  }
  async getToBePlannedTasks(_projectId, _fromCache) {
    let project = Server.getProject(_projectId);
    if (!project) return false;
    return await project.tasks.getByGroup({groupType: 'toPlan'}, _fromCache);
  }
}


class WeekTabAccessPoint extends AccessPoint {
  async getTasksByDateRange(_info, _fromCache) {
    let tasks = await Server.global.tasks.getByDateRange(_info, _fromCache);

    let shouldRenderTasks = [];
    for (let task of tasks) {
       if (!(await MainContent.taskPage.todayTab.taskIsMine(task))) continue;
       shouldRenderTasks.push(task);
    }

    return shouldRenderTasks;
  }
}







