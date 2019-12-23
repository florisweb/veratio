

function _MainContent_taskPage(_ParentInheritance) {
	let HTML = {
		mainContent: mainContent,
		mainContentHolder: mainContentHolder,
		todoHolder: $("#mainContentHolder .todoListHolder")[0],
		loadMoreButton: $("#mainContentHolder .loadMoreButton")[0],
	}
	
	let Parent = _ParentInheritance;
	let This = this;

	const Private = {
		HTML: HTML
	}



	this.pageSettings = {
		pageName: "task",
		pageIndex: 0,
		customHeaderSetting: true
	}

	this.open = function(_projectId) {
		if (!_projectId) _projectId = MainContent.curProjectId;
		Parent.openPage(this.pageSettings.pageName, _projectId);
	
		if (!_projectId) return MainContent.taskPage.reopenCurTab();
		MainContent.taskPage.projectTab.open(_projectId);
	}


	this.taskHolder 	= new _MainContent_taskHolder();
	this.renderer 		= new _TaskRenderer(HTML.todoHolder);
	


	// tabs
	this.todayTab = new taskPage_tab(Private, {
		title: "today",
		onOpen: openToday,
		hideLoadMoreButton: true
	});

	this.weekTab = new taskPage_tab(Private, {
		title: "week",
		onOpen: openInbox,
		customFunctions: {
			loadMoreDays: loadMoreDays
		}
	});
	
	this.projectTab = new taskPage_tab(Private, {
		title: "project",
		onOpen: openProject,
		hideLoadMoreButton: true
	});
	

	this.curTab = "today";
	this.reopenCurTab = function() {
		if (this.curTab == "project" && !MainContent.curProjectId) this.curTab = "today";
		this[this.curTab + "Tab"].open(MainContent.curProjectId);
	}
		

	async function openToday() {
		let date = new Date();
		MainContent.header.setTitle("Today - " + date.getDate() + " " + date.getMonths()[date.getMonth()].name);
		MainContent.header.setMemberList([]);

		let taskHolder 	= MainContent.taskPage.taskHolder.add(
			"date",
			{
				displayProjectTitle: true, 
				displayDate: false
			}, 
			[date]
		);

		let taskList 	= await Server.global.tasks.getByDate(date);
		if (!taskList || !taskList[date]) return false;
		taskList = taskList[date];

		taskHolder.task.addTaskList(taskList);
	}


	async function openInbox() {
		MainContent.header.setTitle("Inbox");
		MainContent.header.setMemberList([]);
		let startDate = new Date();

		let dateList = await Server.global.tasks.getByDateRange(startDate, 7);

		for (let i = 0; i < 7; i++)
		{
			let date = startDate.copy().moveDay(i);
			let taskList = dateList[date.toString()];

			inbox_addTaskHolder(date, taskList);
		}
	}

	function inbox_addTaskHolder(_date, _taskList) {
		let taskHolder 	= MainContent.taskPage.taskHolder.add(
			"date",
			{
				displayProjectTitle: true, 
				displayDate: false
			}, 
			[_date]
		);

		if (!_taskList) return;
		taskHolder.task.addTaskList(_taskList);
	}


	async function loadMoreDays(_days = 1) {
		let startDate = getNewDate();
		let dateList = await Server.global.tasks.getByDateRange(startDate.copy().moveDay(1), _days);

		for (let i = 1; i < _days + 1; i++)
		{
			let date = startDate.copy().moveDay(i);
			let taskList = dateList[date.toString()];

			inbox_addTaskHolder(date, taskList);
		}
	}

	function getNewDate() {
		let lastTaskHolder = MainContent.taskPage.taskHolder.list.lastItem();
		if (lastTaskHolder.type != "date") return false;
		return lastTaskHolder.date;
	}




	async function openProject(_projectId) {
		let project = Server.getProject(_projectId);
		if (!project) return;
		
		MainContent.header.setTitle(project.title);
		MainContent.header.setMemberList(project.users.getLocalList());


		let plannedTasks 		= await project.tasks.getByDateRange(new Date(), 1000);
		if (Object.keys(plannedTasks).length)
		{
			let taskHolder_planned = MainContent.taskPage.taskHolder.add(
				"default",
				{
					displayProjectTitle: false, 
				}, 
				["Planned"]
			);
			
			let dates = Object.keys(plannedTasks);
			for (date of dates)
			{
				taskHolder_planned.task.addTaskList(
					plannedTasks[date]
				);
			}
			
		}
		


		let nonPlannedTasks = await project.tasks.getByGroup("default");		
		// nonPlannedTasks 	= MainContent.taskPage.renderer.settings.sort(nonPlannedTasks, []);
		
		let taskHolder_nonPlanned = MainContent.taskPage.taskHolder.add(
			"default",
			{
				displayProjectTitle: false, 
			}, 
			["Not Planned"]
		);

		taskHolder_nonPlanned.task.addTaskList(nonPlannedTasks);
	}
	
}




function taskPage_tab(_ParentInheritance, _settings) {
	let Parent = _ParentInheritance;
	let Settings = _settings;

	applyCustomFunctions(this);


	this.open = async function(_projectId = false) {
		if (MainContent.curPageName != "task") MainContent.taskPage.open(_projectId);
		
		MainContent.curProjectId = _projectId;
		MainContent.taskPage.curTab = Settings.title;
		MainContent.header.showItemsByPage("taskpage - " + Settings.title);


		MainContent.taskPage.taskHolder.clear();
		await MainContent.taskPage.taskHolder.addOverdue();

		applyTabSettings();
		resetPage();

		MainContent.startLoadingAnimation();
		Settings.onOpen(_projectId).then(function () {
			setTimeout(MainContent.stopLoadingAnimation, 100);
		});
	}


	function applyTabSettings() {
		if (Settings.hideLoadMoreButton) 
			Parent.HTML.loadMoreButton.classList.add("hide"); 
		else 
			Parent.HTML.loadMoreButton.classList.remove("hide");
	}

	function resetPage() {
		MainContent.optionMenu.close();
	}

	function applyCustomFunctions(This) {
		if (!Settings.customFunctions) return;
		for (functionName in Settings.customFunctions)
		{
			This[functionName] = Settings.customFunctions[functionName];
		}
	}
}






















function _MainContent_createProjectPage(_ParentInheritance) {
	let This = this;
	let Parent = _ParentInheritance;
	
	let HTML = {
		page: $(".mainContentPage.createProjectPage"),
		titleInputField: $(".mainContentPage.createProjectPage .inputField")[0],
	}

	this.pageSettings = {
		pageName: "createProject",
		pageIndex: 1,
		hideHeader: true
	}

	this.open = function(_projectId) {
		Parent.openPage(this.pageSettings.pageName, _projectId);

		HTML.titleInputField.value = null;
		HTML.titleInputField.focus();
		MainContent.header.setTitle("Create Project");
	}

	





	this.createProject = function() {
		let project = scrapeProjectData();
		if (typeof project != "object") return alert(project);

		Server.createProject(project.title).then(function (_project) {
			Server.getProject(_project.id).sync();
			SideBar.projectList.fillProjectHolder();
			MainContent.openPage("task", _project.id);
		});
	} 
	

	function scrapeProjectData() {
		let project = {title: HTML.titleInputField.value};
		
		if (!project.title || project.title.length < 2) return "E_incorrectTitle";

		return project;
	}
}




















function _MainContent_settingsPage(_ParentInheritance) {
	let This = this;
	let Parent = _ParentInheritance;
	
	let HTML = {
		Self: $(".mainContentPage.settingsPage")[0],
		memberHolder: $(".mainContentPage.settingsPage .memberHolder")[0],
		inviteMemberInput: $("#inviteMemberInput")[0],
		inviteMemberHolder: $(".inviteMemberHolder")
	}

	this.pageSettings = {
		pageName: "settings",
		pageIndex: 2
	}

	this.permissionsMenu = new _MainContent_settingsPage_permissionsMenu();



	this.open = async function(_projectId) {
		if (!_projectId) _projectId = Server.projectList[0].id;
		Parent.openPage(this.pageSettings.pageName, _projectId);

		let project = Server.getProject(_projectId);

		enableAllButtons();
		MainContent.header.setTitle("Settings - " + project.title);

		let users = await project.users.getAll();
		This.setMemberItemsFromList(users);

		// if (!project.users.Self.userActionAllowed("invite")) HTML.inviteMemberHolder.hide();
	}

	function enableAllButtons() {
		HTML.inviteMemberHolder.show();
	}




	this.optionMenu = new function() {
		let Menu = OptionMenu.create(HTML.Self);
		let curItem = "";
		let curMemberId = "";	

		Menu.addOption(
			"Remove user", 
			function () {
				let project 	= Server.getProject(MainContent.curProjectId);
				if (!project || !curMemberId) return false;

				let removed = project.users.remove(curMemberId);
				if (removed) curItem.classList.add("hide");

				return removed;
			}, 
			"images/icons/removeIcon.png"
		);

		Menu.addOption(
			"Change permissions", 
			function () {
				MainContent.settingsPage.permissionsMenu.open(curMemberId);
				return true;
			}, 
			"images/icons/changeIconDark.png"
		);

		this.open = function(_target) {
			curItem 		= _target.parentNode.parentNode;
			curMemberId 	= DOMData.get(curItem);

			let project = Server.getProject(MainContent.curProjectId);
			let member = project.users.get(curMemberId);
			if (!member || !project) return false;

			Menu.enableAllOptions();
			// if (!project.users.Self.userActionAllowed("remove", member)) Menu.options[0].disable();
			// if (!project.users.Self.userActionAllowed("update", member)) Menu.options[1].disable();

			return Menu.open(_target, {left: -100, top: -45});
		}

		this.openState 	= Menu.openState;
		this.close 		= Menu.close;
	}








	this.inviteUser = function() {
		let email = HTML.inviteMemberInput.value;
		let project = Server.getProject(MainContent.curProjectId);
		let promise = project.users.inviteUserByEmail(email);
		if (!isPromise(promise)) return alert(promise);
		promise.then(function () {
			project.users.sync().then(function () {
				This.open(MainContent.curProjectId);
			});
			HTML.inviteMemberInput.value = null;
		}, function (_error) {
			alert(_error);
		});
	}





	this.setMemberItemsFromList = function(_memberList) {
		HTML.memberHolder.innerHTML = '<div class="text header">Members (' + _memberList.length + ')</div>';
		for (member of _memberList)
		{
			this.addMemberItem(member);
		}
	}


	this.addMemberItem = function(_member) {
		let html = createMemberItemHtml(_member);
		HTML.memberHolder.append(html);
	}


	function createMemberItemHtml(_member) { 
		let html = document.createElement("div");
		html.className = "listItem memberItem";
		if (_member.Self) html.classList.add("isSelf");
		
		html.innerHTML = '<img class="mainIcon icon" src="images/icons/memberIcon.png">' + 
						'<div class="titleHolder userText text">Dirk@dirkloop.com</div>' +
						'<div class="rightHand">' + 
							'<img src="images/icons/optionIcon.png" class="rightHandItem optionIcon onlyShowOnItemHover icon clickable">' +
							'<div class="rightHandItem text"></div>' + 
						'</div>';

		if (_member.type == "invite") 	html.children[0].setAttribute("src", "images/icons/inviteIconDark.png");
		if (_member.type == "link") 	html.children[0].setAttribute("src", "images/icons/linkIconDark.png");
		if (_member.isOwner)			html.children[0].setAttribute("src", "images/icons/ownerIconDark.png");

		
		setTextToElement(html.children[1], _member.name);
		setTextToElement(html.children[2].children[1], _member.permissions);
		DoubleClick.register(html.children[2].children[1], function () {
			let project = Server.getProject(MainContent.curProjectId);
			// if (!project.users.Self.userActionAllowed("update", member)) return false;

			MainContent.settingsPage.permissionsMenu.open(_member.id);
		})

		html.children[2].children[0].onclick = function () {
			MainContent.settingsPage.optionMenu.open(html.children[2].children[0]);
		}


		DOMData.set(html, _member.id);
		return html;
	}
}







function _MainContent_settingsPage_permissionsMenu() {
	this.open = async function(_memberId) {
		let project	= Server.getProject(MainContent.curProjectId);
		let member 	= await project.users.get(_memberId);
		openPopupMenu(member);
	}


	function openPopupMenu(_member) {
		let builder = [
			{title: "CHANGE USER PERMISSIONS"},
			"<br><br>",
			{text: "Change "},
			{text: _member.name, highlighted: true},
			{text: _member.name.substr(_member.name.length - 1, 1).toLowerCase() == "s" ? "'" : "'s", highlighted: true},
			{text: " permissions to:"},
			"<br><br><br>",
			"<div id='PERMISSIONMENU'>" + 
				"<a class='text optionGroupLabel'>Create and finish tasks</a>" +
				"<div class='optionGroup'>" + 
					"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Own</div>" + 
					"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Assigned to</div>" + 
					"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>All</div>" + 
				"</div>" + 
				'<br><div class="HR"></div>' + 
				"<a class='text optionGroupLabel'>Invite and remove users</a>" + 
				"<div class='optionGroup'>" + 
					"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>None</div>" + 
					"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Can invite</div>" + 
					"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Can remove</div>" + 
				"</div>" + 
				'<br><div class="HR"></div>' + 
				
				"<a class='text optionGroupLabel'>User permissions</a>" +
				"<div class='optionGroup'>" + 
					"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>None</div>" + 
					"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>can change</div>" + 
				"</div>" +
				'<br><div class="HR"></div>' + 

				"<a class='text optionGroupLabel'>Rename and remove this project</a>" + 
				"<div class='optionGroup'>" + 
					"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>None</div>" + 
					"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Rename</div>" + 
					"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Remove</div>" + 
				"</div>" +
			"</div>",
	
			"<br><br><br><br>",
			{buttons: [
				{button: "CANCEL", onclick: Popup.close},
				{button: "CHANGE", onclick: 
					async function () 
					{
						let optionGroup = $("#PERMISSIONMENU .optionGroup");
						let newPermissions = [
							"2",
							String(optionGroup[0].value),
							String(optionGroup[1].value) + String(optionGroup[2].value),
							String(optionGroup[3].value)
						];

						newPermissions[1] += optionGroup[0].value > 0 ? optionGroup[0].value : 1;
						// Check if permissions are actually allowed to be given

						_member.permissions = JSON.stringify(newPermissions);
						
						let project = Server.getProject(MainContent.curProjectId);
						if (!project) return false;

						await project.users.update(_member);
						MainContent.settingsPage.open(MainContent.curProjectId);

						Popup.close();
					}, 
				important: true, color: COLOR.DANGEROUS}
			]}
		];

		Popup.showNotification(builder);

		let permissions = JSON.parse(_member.permissions);
		let optionGroup = $("#PERMISSIONMENU .optionGroup");

		optionGroup_select(
			optionGroup[0].children[
				parseInt(permissions[1][0])
			]
		);
		optionGroup_select(
			optionGroup[1].children[
				parseInt(permissions[2][0])
			]
		);
		
		optionGroup_select(
			optionGroup[2].children[
				parseInt(permissions[2][1])
			]
		);

		optionGroup_select(
			optionGroup[3].children[
				parseInt(permissions[3])
			]
		);
	}
}







