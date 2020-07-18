

<h1>Permissions</h1>
                       create/   create/
                      (re)move   remove    invite   remove   change user   rename     remove
              finish    tasks    tags      users    users    permissions   project    project
3 Owner       x         x        x         x        x        x             x          x
2 Admin       x         x        x         x        <=       <=            x          /
1 Member      x         x        x         /        /        /             /          /
0 Read-only   assigned  /        /         /        /        /             /          /

<=: Means that the action is only available on users that have the same or a lower permission-rank



<h1>Definitions</h1>

    - Task is mine: 
      Assigned to me ||
      Creator = self, Assigned to no-one ||
      NOT: Assigned to someone else but not to me


    - TaskHolder and Task-types: [DEFAULT: 'Default']
      1. default 
      2. overdue
      3. date


    - task
      - title           String
      - finished        Bool
      - groupType:      String    See Types /\
      - groupValue:     String    Dependant on Type
      - assignedTo      [userIds]
      
      - id              String
      - tagId           String
      - creatorId       String
      - projectId       String








<h5>Types</h5>

<h6>Type: overdue {extends default}</h6>
    
    let taskHolder = new TaskHolder_overdue(config)

    - Class: 'overdue'
    - Title: 'Overdue'
    - Autohide finished tasks
    - Remove on tasksList empty
    ? PostPoneButton



<h6>Type: date {extends default}</h6>

    let taskHolder = new TaskHolder_date(config, date)
    
    - Title: dateToString
    - Has custom paramater: date
      - Will automatically be set to the createTaskMenu








<h3>TaskWrapper</h3>

    task              taskObject
    html              htmlObject
    taskHolder        taskHolderObject

    finish            DB-function
    remove            DB-function
    
    openEdit          function
    
    removeHTML        function
    render            function













<h1>Connection</h1>
    Client
      /\  
      |       - Postmessage
      \/
  ServiceWorker
      |
      |      - Fetch
      \/
    Server



<h2>Client - ServiceWorker</h2>
To SW: {
  type: "" of ["task", "tag", "user", "project"]
  action: "" of - see Actions -
  projectId: "",
  parameters: {},

  sendId: 123432432124..
}

From SW: {
  response: {}
  returnId: /\
}





Actions
Client                                        
- project
  m leave = user.remove(self)               
  - remove
  - rename
  - create
  - getAll

- task
  - get
  - getByDate
  - getByDateRange
  - getByGroup
  - remove
  - update

- users
  - get
  - getAll
  - update
  - remove
  - inviteByEmail
  - inviteByLink

- tags
  - get
  - getAll
  - update
  - remove


