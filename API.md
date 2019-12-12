
<h1>API</h1>    

<h2>Project-actions</h2>
    API/projects

    - create project       API/project/create       title=
    - remove project       API/project/remove       projectId=

    - leave project        API/project/leave        projectId=
    - rename project       API/project/rename       projectId, newTitle




<h2>Project-contents</h2>

  if 'projectId' is '*' the action will be applied for all (available) projects

  <h3>User</h3>

    API/projects/user.php
    - action: update, remove, getAll
    - projectId
    - parameters (JSON object)


  <h3>Task</h3>

    API/projects/task.php
    - action: update, remove, get
    - projectId
    - parameters (JSON object)

  
  <h3>Tag</h3>

    API/projects/tag.php
    - action: update, remove, getAll
    - projectId
    - parameters (JSON object)




