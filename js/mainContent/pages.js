
function MainContent_page(_config) {
	this.name = _config.name;
	let onOpen = _config.onOpen;
	this.settings = {
		index: _config.index
	}

	const HTML = {
		pages: $("#mainContent .mainContentPage"),
	}



	this.open = function(_projectId) {
		// HTML.mainContent.classList.add("loading");
		MainContent.startLoadingAnimation();


		resetPage();
		
		MainContent.curPage			= this;
		MainContent.curProjectId 	= _projectId;

		openPageByIndex(this.settings.index);
		MainContent.header.showItemsByPage(this.name);

		onOpen(_projectId);


		MainContent.stopLoadingAnimation();
		// setTimeout('mainContent.classList.remove("loading");', 100);
	}

	
	function openPageByIndex(_index) {
		for (let i = 0; i < HTML.pages.length; i++) if (i != _index) HTML.pages[i].classList.add("hide");
		HTML.pages[parseInt(_index)].classList.remove("hide");
	}

	function resetPage() {
		MainContent.optionMenu.close();
	}
}






function MainContent_taskPage() {
	let This = this;
	MainContent_page.call(this, {
		name: "task",
		index: 0,
		onOpen: function() {This.reopenCurTab();}
	});

	const HTML = {
		todoHolder: $("#mainContentHolder .todoListHolder")[0],
	}


	this.renderer 		= new _TaskRenderer(HTML.todoHolder);
	

	this.curTab;
	this.todayTab 	= new taskPage_tab_today();
	this.weekTab	= new taskPage_tab_week();
	this.projectTab = new taskPage_tab_project();


	
	this.reopenCurTab = function() {
		if (!this.curTab) return this.todayTab.open();
		this.curTab.open(MainContent.projectId);
	}
}







function taskPage_tab(_settings) {
	this.name = _settings.name;
	let onOpen = _settings.onOpen;

	const HTML = {
		loadMoreButton: $("#mainContentHolder .loadMoreButton")[0],
	}
	


	this.open = async function(_projectId) {
		// HTML.mainContent.classList.add("loading");
		MainContent.startLoadingAnimation();


		applySettings(_settings);

		
		MainContent.taskPage.curTab	= this;
		MainContent.curProjectId 	= _projectId;

		resetPage();
		await MainContent.taskHolder.addOverdue();

		onOpen(_projectId);


		MainContent.stopLoadingAnimation();
		// setTimeout('mainContent.classList.remove("loading");', 100);
	}


	function applySettings(_settings) {
		HTML.loadMoreButton.classList.add("hide");
		if (_settings.showLoadMoreButton) HTML.loadMoreButton.classList.remove("hide");
	} 


	function resetPage() {
		MainContent.optionMenu.close();
		MainContent.taskHolder.clear();
	}
}



function taskPage_tab_today() {
	taskPage_tab.call(this, {
		name: "today",
		onOpen: onOpen
	});


	async function onOpen() {
		let date = new Date();

		MainContent.header.showItemsByPage("taskpage - " + this.name);
		MainContent.header.setTitle("Today - " + date.getDate() + " " + date.getMonths()[date.getMonth()].name);
		MainContent.header.setMemberList([]);

		let taskHolder 	= MainContent.taskHolder.add(
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
}





function taskPage_tab_week() {
	taskPage_tab.call(this, {
		name: "week",
		onOpen: onOpen,
		showLoadMoreButton: true
	});

	
	async function onOpen() {
		MainContent.header.showItemsByPage("week");
		MainContent.header.setTitle("This week");
		MainContent.header.setMemberList([]);

		let startDate = new Date();
		let dateList = await Server.global.tasks.getByDateRange(startDate, 7);

		for (let i = 0; i < 7; i++)
		{
			let date = startDate.copy().moveDay(i);
			let taskList = dateList[date.toString()];

			addTaskHolder(date, taskList);
		}
	}

	function addTaskHolder(_date, _taskList) {
		let taskHolder 	= MainContent.taskHolder.add(
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


	let loadingMoreDays = false;
	this.loadMoreDays = async function(_days = 1) {
		if (loadingMoreDays) return false;
		loadingMoreDays = true;
		
		let startDate = getNewDate();
		let dateList = await Server.global.tasks.getByDateRange(startDate.copy().moveDay(1), _days);

		for (let i = 1; i < _days + 1; i++)
		{
			let date = startDate.copy().moveDay(i);
			let taskList = dateList[date.toString()];

			addTaskHolder(date, taskList);
		}
		
		loadingMoreDays = false;
	}

	function getNewDate() {
		let lastTaskHolder = MainContent.taskHolder.list.lastItem();
		if (lastTaskHolder.type != "date") return false;
		return lastTaskHolder.date;
	}
}



function taskPage_tab_project() {
	taskPage_tab.call(this, {
		name: "project",
		onOpen: onOpen
	});


	async function onOpen(_projectId) {
		let project = Server.getProject(_projectId);
		if (!project) return;
		
		MainContent.header.showItemsByPage("project");
		MainContent.header.setTitle(project.title);
		MainContent.header.setMemberList(project.users.getLocalList());


		let plannedTasks 		= await project.tasks.getByDateRange(new Date(), 1000);
		if (Object.keys(plannedTasks).length)
		{
			let taskHolder_planned = MainContent.taskHolder.add(
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
		let taskHolder_nonPlanned = MainContent.taskHolder.add(
			"default",
			{
				displayProjectTitle: false, 
			}, 
			["Not Planned"]
		);

		taskHolder_nonPlanned.task.addTaskList(nonPlannedTasks);
	}
}






















function MainContent_settingsPage(_projectId) {
	MainContent_page.call(this, {
		name: "settings",
		index: 1,
		onOpen: onOpen
	});

	let This = this;
	
	let HTML = {
		Self: $(".mainContentPage.settingsPage")[0],
		memberHolder: $(".mainContentPage.settingsPage .memberHolder")[0],
		inviteMemberInput: $("#inviteMemberInput")[0],
		inviteMemberHolder: $(".inviteMemberHolder")
	}


	this.permissionsMenu = new _MainContent_settingsPage_permissionsMenu();



	async function onOpen(_projectId) {
		if (!_projectId) _projectId = Server.projectList[0].id;
		let project = Server.getProject(_projectId);

		MainContent.header.setTitle("Settings - " + project.title);

		let users = await project.users.getAll();
		This.setMemberItemsFromList(users);
	}






	this.inviteUser = async function() {
		let email 	= HTML.inviteMemberInput.value;
		let project = Server.getProject(MainContent.curProjectId);
		
		let returnVal = await project.users.inviteByEmail(email);
		if (returnVal !== true) console.error("An error accured while invite a user:", returnVal);
		
		HTML.inviteMemberInput.value = null;
		This.open(MainContent.curProjectId);
	}





	this.setMemberItemsFromList = function(_memberList) {
		HTML.memberHolder.innerHTML = '<div class="text header">Members (' + _memberList.length + ')</div>';
		for (member of _memberList) this.addMemberItem(member);
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
			MainContent.settingsPage.permissionsMenu.open(_member.id);
		})

		html.children[2].children[0].onclick = function () {
			MainContent.settingsPage.optionMenu.open(html.children[2].children[0]);
		}


		DOMData.set(html, _member.id);
		return html;
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







