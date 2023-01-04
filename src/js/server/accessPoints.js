

class Server_AccessPoints {
  todayTab = new TodayTabAccessPoint();
  projectTab = new ProjectTabAccessPoint();
  constructor() {

  }


}


// AccessPoint: High level request system
class AccessPoint {
  constructor() {

  }
}


class TodayTabAccessPoint extends AccessPoint {
  async getTasks(_fromCache = false) {
    let todayResponse = await Server.global.tasks.getByDate(new Date(), _fromCache);
    if (todayResponse.error) return todayResponse.error;
    return todayResponse.result;
  }
}



class ProjectTabAccessPoint extends AccessPoint {
  async getTasks(_projectId, _fromCache = false) {
    if (_fromCache)
    {

    }

    return 
  }
}