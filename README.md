


Version 1.1
Planned features:
- [x] Midend / clientside datamanagement redesign
- [x] Drop-down-menu's for the taskHolders
- [ ] Drag and drop support for tasks
- [x] Overdue auto-setter
- [x] TaskOwnerIndicator: hover to see the task's owner



Version 1.2
Planned features:
- [ ] Tags (Creation, usage, and such)
- [ ] Project colours
? - [ ] Sorting and filtering UI
?    - [ ] Sort tasks by deadline
- [ ] Offline service


Version 1.3
Planned features:
- [ ] Tooltips to indicate what button does what
- [ ] Subtasks

Version 1.4
Planned features:
- [ ] Repeatable tasks










App
- 	Client:			UI and User Input, Page Generation, Filtration and Sorting		Only keeps project-data
\- 	ServiceWorker	Offline experience												Keeps local copy of data in indexedDB
- 	Server 			Permission checking, Database Storage							Keeps real data

Serviceworker should not be required, aka in case of install-failure







Client <-> ServiceWorker
            
	- update
	- remove
	

	- generatePage(pageName, projectId)




Client - Page Generation
- Today

- This Week

- Project - Id





Server
- getProjectList() -> [{id, title}]
- getUserList(projectId) -> [{id, name, permissions, isOwner}]
- getTagList(projectId) -> etc
- 





