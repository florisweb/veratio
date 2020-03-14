
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








<h3>Backend Structure</h3>

<h4>Users</h4>
  
    - name [String]
    * id: [String] sha1 of florisweb.userId
    * type: [String]
      - member
      - link
      - invite
    * permissions: ["*", "**", "**", "*"]

    - isOwner [Boolean] DEFAULT: false



<h4>Tasks</h4>
  
    * title [String]
    * id: [String - random]
    
   


