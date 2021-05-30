

Version 1.4
Planned features:
- [x] Preloading - Huge performance increase
- [ ] PWA
- [ ] Properly implement Drag And Drop
- [ ] Task order
- [x] To be Planned-taskholder
	- [x] An 'Add all to planner'-button on the overdue-menu
- [x] Implement full-data-caching


Version 1.5
Planned features:
- [ ] Planner

Version 1.6
Planned features:
- [ ] Data encryption


Future Features:
- [ ] Repeatable tasks
- [ ] Tooltips to indicate what button does what
- [ ] Subtasks
- [ ] Project colours
? - [ ] Drag and drop support for tasks (Order?)
? - [ ] Sorting and filtering UI
?    - [ ] Sort tasks by planned date
- [ ] Extended offline support
		- [ ] Removing projects
		- [ ] Creating projects






====== Released versions ======

Version 1.3
Planned features:
- [x] Offline service
- [x] Redesigned the taskCreateMenu
	- [x] When creating a task there will now be a little loading-icon-indicator to show when it's being uploaded.
	- [x] Added the ability to remove assignees and tags from a task.
- [x] Implemented the adding of taskHolders for tasks that have to be rendered but whose taskHolder isn't yet created.
- [x] Some small visual changes, including the tagCircle's new look.
- [x] Made the date-popup assume that when entering for example '15 august', it will choose the next one, instead of the one that has already been passed.
- [x] Added 'are you sure'-messages to 'dangerous' actions, like removing or leaving a project.
- [x] The 'Planned'-taskholder in the project-tab will be collapsed by default now
- [x] Inline project-creation
- [x] Redesigned the invite system:
	- [x] Bind link-user to actual user

Version 1.2
Planned features:
- [x] Tags (Creation, usage, and such)
- [x] Redesigned permission-system
- [x] Curtab indicator

- [x] Escape will now allow you to cancel draging
- [x] Edit project-title by doubleclicking on it
- [x] OptionMenu will now go above the inputfield if there isn't enough space underneath

- [x] Front-end permission-checking
- [x] Offline-indicator


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






