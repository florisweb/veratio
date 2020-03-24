


Version 1.1
Planned features:
- [x] Midend / clientside datamanagement redesign
- [x] Drop-down-menu's for the taskHolders
- [x] Drag and drop support for tasks (Cross-date)
- [x] Overdue auto-setter
- [x] TaskOwnerIndicator: hover to see the task's owner
- [x] Option to invite using a link
- [x] Bug Fix: You can now mention members that have an '@' in their name
- [x] Bux Fix: When your session expires you will be prompted to login again




Version 1.2
Planned features:
- [ ] Tags (Creation, usage, and such)
- [x] Edit project-title by doubleclicking on it
- [ ] Redesigned permission-system
- [ ] Front-end permission-checking
- [ ] Escape will now allow you to cancel draging

- [ ] Project colours
- [ ] Offline service
? - [ ] Drag and drop support for tasks (Order?)
? - [ ] Sorting and filtering UI
?    - [ ] Sort tasks by planned date




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





