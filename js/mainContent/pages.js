
function MainContent_page(_config) {
	this.name = _config.name;
	let onOpen = _config.onOpen;
	this.settings = {
		index: _config.index
	}

	const HTML = {
		pages: $("#mainContent .mainContentPage"),
		mainContent: mainContent
	}

	this.isOpen = function() {return this.name == MainContent.curPage.name}

	this.open = async function(_projectId) {
		HTML.mainContent.classList.add("loading");

		resetPage();
		
		MainContent.curPage			= this;
		if (_projectId) MainContent.curProjectId = _projectId;

		openPageByIndex(this.settings.index);
		MainContent.header.showItemsByPage(this.name);

		onOpen(_projectId);

		await SideBar.updateTabIndicator();
		setTimeout('mainContent.classList.remove("loading");', 100);
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
		onOpen: function() {if (!This.curTab) This.todayTab.open()}
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
		this.curTab.open(MainContent.curProjectId);
	}
}







function taskPage_tab(_settings) {
	this.name = _settings.name;
	let onOpen = _settings.onOpen;

	const HTML = {
		loadMoreButton: $("#mainContentHolder .loadMoreButton")[0],
	}
	


	this.open = async function(_projectId = false) {
		MainContent.startLoadingAnimation();

		HTML.loadMoreButton.classList.add("hide");
		

		MainContent.taskPage.curTab	= this;
		MainContent.curProjectId 	= _projectId;

		if (!MainContent.taskPage.isOpen()) MainContent.taskPage.open();
		resetPage();
		

		await MainContent.taskHolder.addOverdue();

		await onOpen(_projectId);

		MainContent.stopLoadingAnimation();
		await SideBar.updateTabIndicator();

		applySettings(_settings);
	}


	function applySettings(_settings) {
		if (_settings.showLoadMoreButton) setTimeout(function () {
			HTML.loadMoreButton.classList.remove("hide");
		}, 100);
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
	let This = this;


	async function onOpen() {
		let date = new Date();

		MainContent.header.showItemsByPage("taskpage - " + This.name);
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

		let finalList = [];
		for (task of taskList)
		{
			if (!(await shouldRenderTask(task))) continue;
			finalList.push(task);
		}

		finalList = TaskSorter.defaultSort(finalList);

		taskHolder.task.addTaskList(finalList);
	}

	async function shouldRenderTask(_task) {
		if (_task.finished) return false;
		return await This.taskIsMine(_task);
	}


	this.taskIsMine = async function(_task) {
		let project = await Server.getProject(_task.projectId);
		let userId = project.users.Self.id;

		if (_task.assignedTo.length == 0 && _task.creatorId != userId) return false;

		if (
			_task.assignedTo.length > 0 && 
			!_task.assignedTo.includes(userId)
		) return false;

		return true;
	}
}





function taskPage_tab_week() {
	taskPage_tab.call(this, {
		name: "week",
		onOpen: onOpen,
		showLoadMoreButton: true
	});

	
	async function onOpen() {
		MainContent.header.showItemsByPage("taskPage - week");
		MainContent.header.setTitle("This week");
		MainContent.header.setMemberList([]);

		let startDate = new Date();
		let dateList = await Server.global.tasks.getByDateRange({date: startDate, range: 7});

		for (let i = 0; i < 7; i++)
		{
			let date = startDate.copy().moveDay(i);
			let taskList = dateList[date.toString()];

			let finalList = [];
			
			if (taskList) 
			{
				for (task of taskList)
				{
					if (!(await shouldRenderTask(task))) continue;
					finalList.push(task);
				}
			}

			addTaskHolder(date, finalList);
		}
	}

	async function shouldRenderTask(_task) {
		return await MainContent.taskPage.todayTab.taskIsMine(_task);
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
		_taskList = TaskSorter.defaultSort(_taskList);

		taskHolder.task.addTaskList(_taskList);
	}


	let loadingMoreDays = false;
	this.loadMoreDays = async function(_days = 1) {
		if (loadingMoreDays) return false;
		loadingMoreDays = true;
		
		let startDate = getNewDate();
		let dateList = await Server.global.tasks.getByDateRange({date: startDate.copy().moveDay(1), range: _days});

		for (let i = 1; i < _days + 1; i++)
		{
			let date = startDate.copy().moveDay(i);
			let taskList = dateList[date.toString()];

			addTaskHolder(date, taskList);
		}
		
		loadingMoreDays = false;
	}

	function getNewDate() {
		let lastTaskHolder = MainContent.taskHolder.list[MainContent.taskHolder.list.length - 1];
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
		let project = await Server.getProject(_projectId);
		if (!project) return;
		
		MainContent.header.showItemsByPage("project");
		MainContent.header.setTitle(project.title);
		MainContent.header.setMemberList(await project.users.getAll());


		let plannedTasks 		= await project.tasks.getByDateRange({date: new Date(), range: 1000});
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
				plannedTasks[date] = TaskSorter.defaultSort(plannedTasks[date]);
				taskHolder_planned.task.addTaskList(
					plannedTasks[date]
				);
			}	
		}


		let nonPlannedTasks = await project.tasks.getByGroup({type: "default", value: "*"});
		let taskHolder_nonPlanned = MainContent.taskHolder.add(
			"default",
			{
				displayProjectTitle: false, 
			}, 
			["Not Planned"]
		);

		nonPlannedTasks = TaskSorter.defaultSort(nonPlannedTasks);
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
		inviteHolder: $(".mainContentPage.settingsPage .inviteMemberHolder")[0],
	}
	
	this.permissionData = [
		{name: "Read-only", description: "Can't do anything except finish tasks assigned to him.", 											icon: "images/icons/projectIconDark.svg"},
		{name: "Member", 	description: "Can do everthing except user-related actions, like inviting someone and changing permissions.", 	icon: "images/icons/memberIcon.png"},
		{name: "Admin", 	description: "Allowed to do everthing except removing the project.", 											icon: "images/icons/adminIcon.png"},
		{name: "Owner", 	description: "Allowed to do everthing.", 																		icon: "images/icons/ownerIconDark.png"}
	 ];




	async function onOpen(_projectId) {
		if (!_projectId) _projectId = (await Server.getProjectList())[0].id;
		let project = await Server.getProject(_projectId);
		
		HTML.inviteHolder.classList.add("hide");

		MainContent.header.setTitle("Settings - " + project.title);

		let users = await project.users.getAll();

		if (project.users.Self.permissions.users.invite) HTML.inviteHolder.classList.remove("hide");
		This.setMemberItemsFromList(users);
	}




	this.inviteUserByLink = async function() {
		let project = await Server.getProject(MainContent.curProjectId);
		
		let returnVal = await project.users.inviteByLink();
		if (typeof returnVal !== "string") console.error("An error accured while inviting a user:", returnVal);

		Popup.inviteByLinkCopyMenu.open("https://florisweb.tk/git/veratio/invite?id=" + returnVal);
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
		if (_member.permissions === 3)	html.children[0].setAttribute("src", "images/icons/ownerIconDark.png");

		
		setTextToElement(html.children[1], _member.name);
		setTextToElement(html.children[2].children[1], This.permissionData[parseInt(_member.permissions)].name);
		DoubleClick.register(html.children[2].children[1], async function () {
			let project = await Server.getProject(MainContent.curProjectId);
			if (!project.users.Self.permissions.users.changePermissions(_member)) return false;
			Popup.permissionMenu.open(_member.id);
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
			async function () {
				let project 	= await Server.getProject(MainContent.curProjectId);
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
				Popup.permissionMenu.open(curMemberId);
				return true;
			}, 
			"images/icons/changeIconDark.png"
		);

		this.open = async function(_target) {
			curItem 		= _target.parentNode.parentNode;
			curMemberId 	= DOMData.get(curItem);
			
			let project 	= await Server.getProject(MainContent.curProjectId);
			let member 		= await project.users.get(curMemberId);

			Menu.enableAllOptions();
			if (!project.users.Self.permissions.users.remove(member))				Menu.options[0].disable();
			if (!project.users.Self.permissions.users.changePermissions(member)) 	Menu.options[1].disable();

			return Menu.open(_target, {left: -100, top: -45});
		}

		this.openState 	= Menu.openState;
		this.close 		= Menu.close;
	}
}







