
<h1>Definitions</h1>

<h2>Tasks</h2>
  
    - IsYours: 
      1. Assigned to me
      2. creator = self & assigned to no-one





<h1>Definitions and Structure</h1>







STRUCTURE

<h2>MainContent</h2>
    
    Pages:
    - Task (Tabs \/)
      - Today
      - Inbox
      - Project
    - Settings
    - Create Project

    

    v: curProjectId
    v: curPageName

    o: header

    o: taskPage
    o: settingsPage
    o: createProjectPage


<h3>Page constructor</h3>

    f: open
    v: pageSettings
       * pageName
       * pageIndex (The page-html's index)
       - hideHeader [Boolean]
       - 



<h3>Page: taskPage</h3>
    
    Tabs:
    - Today
    - Inbox
    - Project

    f: openTab
        [0] TabName       {As defined in MainContent.taskPage.tabs}
        [1] projectId     Only required when TabName == Project, if absent redirect to page Today


    o: TaskHolder

<h5>Page: TaskPage: TaskHolder</h5>

    f: add    Params: 
              [0] type                              {As defined in Taskholder.types} 
              [1] [Object] renderPreferences        {As defined in Taskholder.configuration} 
              [2] [Array]                           Type-Specific parameters















<h4>TaskHolder</h4>

    Holds a list of tasks.
    let taskHolder = new TaskHolder(config, type)

    - Types: [DEFAULT: 'Default']
      1. Default 
      2. Overdue
      3. Date

    - Configuration
      * html:
        * appendTo: The html object to which the taskHolder will be appended
        - class: The class to be applied to the html parent object
      * title [String]
      - renderPreferences
        - [Boolean] displayProjectTitle
        - [Boolean] displayDate



<h5>Modules</h5>
 
    A module must create it's own html and eventhandlers.


<h6>Module: TaskHolder_createMenu</h6>
  
    v: openState [boolean]

    f: open
    f: openEdit       Parameters: [0] The html of the task that has to be edited, [1] The id of the task
    f: close
    f: createTask     - Creates a tasks from the createMenu's html (Input fields)
   
    f: openTagSelectMenu
    f: openMemberSelectMenu
    f: openProjectSelectMenu




<h5>Types</h5>

<h6>Type: Overdue {extends default}</h6>
    
    let taskHolder = new TaskHolder_overdue(config)

    - Class: 'overdue'
    - Title: 'Overdue'
    - Autohide finished tasks
    - Remove on tasksList empty
    ? PostPoneButton




<h6>Type: Date {extends default}</h6>

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
    
   











* = Required
? = Unsure

v = Variable
o = Object
f = Function







DayItems:
- type
	- dayItem 		[day]
	- overdue 		[overdue]
	- listItem 		[list]
- OnCreation:
	preferences: {
		title: "customTitle",
		class: "customClass",
		customAttributes: [{key: "click", value: function}]
	}




Tasks:
* title
* groupType
	- 'default' 	- A projects item without date
	- 'date'
		- 'overdue'
* groupValue


- assignedTo
- tagId
- finished
- creatorId
- id



