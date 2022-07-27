
<h1>API</h1>    

<h2>Project-actions</h2>
    API/projects

    - getProjectList       API/project/getProjectList
    - create project       API/project/create       title=
    - remove project       API/project/remove       projectId=

                                                                            - leave project        API/project/leave        projectId=
    - rename project       API/project/rename       projectId, newTitle




<h2>Project-contents</h2>

  if 'projectId' is '*' the action will be applied for all (available) projects

  <h3>User</h3>

    API/projects/user.php
    - action: update, remove, getAll, inviteByEmail
    - projectId
    - parameters (JSON object)


  <h3>Task</h3>

    API/projects/task.php
    - action:   update, remove, get, getByDate, getByDateRange
                getByGroup: groupValue defaults to * (any task with this group)
    - projectId
    - parameters (JSON object)

  
  <h3>Tag</h3>

    API/projects/tag.php
    - action: update, remove, getAll
    - projectId
    - parameters (JSON object)





















<h1>BACKEND STRUCTURE</h1>



A call falls into a certain catagory based on whether or not it requires permissions and or a project.
- Requires Permissions/User specific
- Requires a project



const DatabaseManager
const CurUser
- id
- isLinkUser                  bool
- signedIn()                  bool




new Project(_projectId_)
- userInProject(_userId_)     bool
- projectExists()             bool
- setCurUser(_CurUser_)       - overwrites the user's name and sets their permissions from DB



new TaskComponent(_Project_)
new UserComponent(_Project_)
new TagComponent(_Project_)
new InviteComponent(_Project_)




Example: updateTask.php ?task=?&projectId=?
``
` if (!$CurUser->signedIn()) die(E_NO_AUTH)
` $project = new Project(projectId)
` if (!$project->projectExists()) die(E_PROJECT_NOT_FOUND)
` if (!$project->userInProject(CurUser->id)) die(E_USER_NOT_IN_PROJECT)
`
` $taskComponent = new TaskComponent($project)
` 
` $result = $taskComponent->update(task);     ERROR || TASK
` 
``




<h2>BACKEND STRUCTURE</h2>



new DataTypeTemplate(_project_, _dataTypeTemplate_)







<h2>ERRORS</h2>
E_PROJECT_NOT_FOUND
E_USER_NOT_IN_PROJECT
E_ACTION_NOT_ALLOWED
E_NO_AUTH
E_INTERNAL
E_INVALID_PARAMETERS









