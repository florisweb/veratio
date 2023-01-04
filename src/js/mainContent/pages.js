
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

	this.open = async function(_curProject = MainContent.curProject) {
		HTML.mainContent.classList.add("loading");

		resetPage();
		
		MainContent.curPage			= this;
		MainContent.curProject 		= _curProject;

		openPageByIndex(this.settings.index);
		MainContent.header.showItemsByPage(this.name);

		onOpen(_curProject);

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
		onOpen: function() {This.reopenCurTab()}
	});

	const HTML = {
		todoHolder: $("#mainContentHolder .todoListHolder")[0],
	}
	this.rendering		= false;

	this.renderer 		= new _TaskRenderer(HTML.todoHolder);
	

	this.curTab;
	this.todayTab 	= new taskPage_tab_today();
	this.weekTab	= new taskPage_tab_week();
	this.projectTab = new taskPage_tab_project();


	
	this.reopenCurTab = function() {
		if (!this.curTab) return this.todayTab.open();
		this.curTab.open(MainContent.curProject);
	}
}









function taskPage_tab(_settings) {
	const This = this;
	this.name = _settings.name;
	let onOpen = _settings.onOpen;
	let onSilentRender = _settings.onSilentRender;

	const HTML = {
		loadMoreButton: $("#mainContentHolder .loadMoreButton")[0],
	}
	

	this.open = async function(_project = false) {
		if (MainContent.taskPage.rendering) return;
		MainContent.taskPage.rendering = true;
		setTimeout(function() {MainContent.taskPage.rendering = false}, 5000);

		MainContent.startLoadingAnimation();
		HTML.loadMoreButton.classList.add("hide");
		

		MainContent.taskPage.curTab	= this;
		MainContent.curProject = _project;

		if (!MainContent.taskPage.isOpen()) MainContent.taskPage.open();
		resetPage();
		await this.addOverdue(true);

		MainContent.header.setTitleIcon(MainContent.taskPage.curTab.name);
		await onOpen(_project);

		MainContent.stopLoadingAnimation();
		await SideBar.updateTabIndicator();

		applySettings(_settings);
		MainContent.taskPage.rendering = false;

		this.silentRender(false);
	}

	let silentRenderPromise;
	this.silentRender = async function(_fromCache = true) {
		while (silentRenderPromise) await silentRenderPromise;

		MainContent.header.setTitleIcon('loading');		
		silentRenderPromise = new Promise(async function(resolve) {
			setTimeout(() => {resolve();}, 10 * 1000); // If there is an error this will prevent the application for stalling forever.

			let overdueTaskList = await getOverdueTasks(_fromCache);
			
			let firstTaskHolder = MainContent.taskHolder.list[0];
			if (firstTaskHolder && firstTaskHolder.type == 'overdue')
			{
				if (overdueTaskList.length) 
				{
					await firstTaskHolder.task.setTaskList(overdueTaskList);
				} 
				else firstTaskHolder.remove();
			} else if (overdueTaskList.length) await This.addOverdue(_fromCache);

			await onSilentRender(_fromCache);
			resolve();
		});
		
		await silentRenderPromise;
		
		silentRenderPromise = false;
		MainContent.header.setTitleIcon('finishedLoading');
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


	this.addOverdue = async function(_fromCache = true) {
		let taskList = await getOverdueTasks(_fromCache);
		if (!taskList) return false;

		let taskHolder = MainContent.taskHolder.add(
			"overdue", 
			{
				displayProjectTitle: !MainContent.curProjectId
			},
			null,
			0,
		);

		await taskHolder.task.addTaskList(taskList);
	}

	async function getOverdueTasks(_fromCache = true) {
		let project = MainContent.curProject;
		if (!project) project = Server.global;

		let taskList = await project.tasks.getByGroup({type: "overdue", value: "*"}, _fromCache);
		if (!taskList || !taskList.length) return false;
		return taskList;
	}
}



function taskPage_tab_today() {
	taskPage_tab.call(this, {
		name: "today",
		onOpen: onOpen,
		onSilentRender: onSilentRender
	});
	let This = this;


	async function onOpen() {
		let date = new Date();

		MainContent.header.showItemsByPage("taskpage - " + This.name);
		MainContent.header.setTitle("Today - " + date.getDate() + " " + date.getMonths()[date.getMonth()].name);
		MainContent.header.setMemberList([]);

		let taskHolder = MainContent.taskHolder.add(
			"date",
			{
				displayProjectTitle: true, 
				displayDate: false
			}, 
			[date]
		);

		let taskList = await getTodayTaskList(true); 
		await taskHolder.task.addTaskList(taskList, true);
	};

	async function onSilentRender(_fromCache = true) {
		for (let taskHolder of MainContent.taskHolder.list)
		{
			switch (taskHolder.type) 
			{
				case "overdue": break; // is being handled by the general tab-class
				case "date": 
					let taskList = await getTodayTaskList(_fromCache); 
					await taskHolder.task.setTaskList(taskList);
				break;
			}
		}
	}

	async function getTodayTaskList(_fromCache = true) {
		let taskList = await Server.accessPoints.todayTab.getTasks();
		if (!taskList) return [];

		let finalList = [];
		let promises = [];
		for (let task of taskList)
		{
			promises.push(shouldRenderTask(task, _fromCache).then(function (_result) {
				if (!_result) return;
				finalList.push(task);
			}));
		}
		await Promise.all(promises);
		return TaskSorter.defaultSort(finalList);
	}



	async function shouldRenderTask(_task, _fromCache) {
		if (_task.finished) return false;
		return await This.taskIsMine(_task, _fromCache);
	}


	this.taskIsMine = async function(_task, _fromCache) {
		return 	_task.assignedTo.length <= 0 || 
				_task.assignedTo.includes(_task.project.users.self.id)
	}
}





function taskPage_tab_week() {
	let This = this;
	taskPage_tab.call(this, {
		name: "week",
		onOpen: onOpen,
		showLoadMoreButton: true,
		onSilentRender: onSilentRender
	});

	
	async function onOpen() {
		MainContent.header.showItemsByPage("taskPage - week");
		MainContent.header.setTitle("This week");
		MainContent.header.setMemberList([]);

		This.loadMoreDays(7, new Date());
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
		taskHolder.task.addTaskList(_taskList);
	}

	async function onSilentRender(_fromCache) {
		for (let taskHolder of MainContent.taskHolder.list)
		{
			switch (taskHolder.type) 
			{
				case "overdue": break; // is being handled by the general tab-class
				case "date": 
					let taskList = await getTaskListByDate(taskHolder.date, _fromCache); 
					await taskHolder.task.setTaskList(taskList);
				break;
			}
		}
	}

	async function getTaskListByDate(_date, _fromCache) {
		let returnList = [];
		let taskList = [];
		if (_fromCache) 
		{ 
			taskList = await Server.global.getLocal().tasks.getByDate(_date);
		} else taskList = await Server.global.tasks.getByDate(_date);

		if (!taskList) return returnList;
		
		for (let task of taskList)
		{
			if (!(await shouldRenderTask(task))) continue;
			returnList.push(task);
		}
		return TaskSorter.defaultSort(returnList);
	}




	let loadingMoreDays = false;
	this.loadMoreDays = async function(_days = 1, _date) {
		if (loadingMoreDays) return false;
		loadingMoreDays = true;
		
		let startDate = _date;
		if (!startDate) startDate = getNewDate();

		let promises = [];
		let taskHolderDataList = [];
		for (let i = 0; i < _days; i++)
		{
			promises.push(new Promise(async function (resolve) {
				let date = startDate.copy().moveDay(i);

				let infoObj = {
					date: date, 
					taskList: []
				}
				taskHolderDataList.push(infoObj);

				let taskList = await getTaskListByDate(date, true);
				if (!taskList) return resolve();
				infoObj.taskList = taskList;
				
				resolve();
			}))	
		}

		await Promise.all(promises);
		for (let info of taskHolderDataList) addTaskHolder(info.date, info.taskList);

		loadingMoreDays = false;
		This.silentRender(false);
	}

	function getNewDate() {
		let lastTaskHolder = MainContent.taskHolder.list[MainContent.taskHolder.list.length - 1];
		if (lastTaskHolder.type != "date") return false;
		return lastTaskHolder.date.copy().moveDay(1);
	}
}



function taskPage_tab_project() {
	let This = this;
	taskPage_tab.call(this, {
		name: "project",
		onOpen: onOpen,
		onSilentRender: onSilentRender,
	});

	let project;
	async function onOpen(_project) {
		project = _project;
		if (!project) return;
		
		MainContent.header.showItemsByPage("project");
		MainContent.header.setTitle(project.title);
		MainContent.header.setMemberList(await project.users.getAll());

		await This.addNotPlannedTaskHolder(false, true);
		await This.addToBePlannedTaskHolder(true, true);
		await This.addPlannedTaskHolder(true, true);
	}


	async function onSilentRender(_fromCache) {
		let toBePlannedTasks = await getToBePlannedTaskList(_fromCache);
		let plannedTasks = await getPlannedTaskList(_fromCache);
		let plannedTaskHolderExists = false;
		let toBePlannedTaskHolderExists = false;

		for (let taskHolder of MainContent.taskHolder.list)
		{
			switch (taskHolder.type) 
			{
				case "overdue": break; // is being handled by the general tab-class
				case "toPlan": 
					toBePlannedTaskHolderExists = true;
					if (!toBePlannedTasks.length) 
					{
						taskHolder.remove();
						break;
					}
					await taskHolder.task.setTaskList(toBePlannedTasks);
				break;
				default: 
					if (taskHolder.config.title == 'Planned')
					{
						plannedTaskHolderExists = true;
						if (!plannedTasks.length)
						{
							taskHolder.remove();
							break;
						}
						await taskHolder.task.setTaskList(plannedTasks);
						break;
					}

					let taskList = await getNotPlannedTaskList(_fromCache);
					await taskHolder.task.setTaskList(taskList);
				break;
			}
		}

		if (toBePlannedTasks.length && !toBePlannedTaskHolderExists) await This.addToBePlannedTaskHolder(true, _fromCache);
		if (plannedTasks.length && !plannedTaskHolderExists) await This.addPlannedTaskHolder(true, _fromCache);
	}

	
	async function getNotPlannedTaskList(_fromCache) {
		let taskList =  await project.getInstance(_fromCache).tasks.getByGroup({type: "default", value: "*"});
		return TaskSorter.defaultSort(taskList);
	}

	this.addNotPlannedTaskHolder = async function(_collapseTaskList = false, _fromCache) {
		let taskHolder = MainContent.taskHolder.add(
			"default",
			{
				displayProjectTitle: false, 
			}, 
			['']
		);

		let tasks = await getNotPlannedTaskList(_fromCache);
		if (_collapseTaskList && tasks.length != 0) taskHolder.collapseTaskList();
		taskHolder.task.addTaskList(tasks);
	}



	async function getPlannedTaskList(_fromCache) {
		let taskList = await project.getInstance(_fromCache).tasks.getByDateRange({date: new Date(), range: 1000});
		return TaskSorter.defaultSort(taskList);
	}

	this.addPlannedTaskHolder = async function(_collapseTaskList = false, _fromCache = false) {
		let tasks = await getPlannedTaskList(_fromCache);
		if (!tasks.length) return;
		
		let taskHolder = MainContent.taskHolder.add(
			"default",
			{
				displayProjectTitle: false, 
			}, 
			["Planned"]
		);
		if (_collapseTaskList) taskHolder.collapseTaskList();
		taskHolder.task.addTaskList(tasks);
	}


	async function getToBePlannedTaskList(_fromCache) {
		let taskList = await project.getInstance(_fromCache).tasks.getByGroup({type: "toPlan", value: "*"});
		return TaskSorter.defaultSort(taskList);
	}

	this.addToBePlannedTaskHolder = async function(_collapseTaskList = false, _fromCache = false) {
		let tasks = await getToBePlannedTaskList(_fromCache);
		if (!tasks.length) return;
		
		let taskHolder = MainContent.taskHolder.add(
			"toPlan",
			{
				displayProjectTitle: false, 
			}, 
			[]
		);

		if (_collapseTaskList && tasks.length != 0) taskHolder.collapseTaskList();
		taskHolder.task.addTaskList(tasks);
	}
}






















function MainContent_settingsPage() {
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
		{name: "Read-only", description: "Can't do anything except finish tasks assigned to them.", 										icon: "images/icons/projectIconDark.svg"},
		{name: "Member", 	description: "Can do everthing except user-related actions, like inviting someone and changing permissions.", 	icon: "images/icons/memberIcon.png"},
		{name: "Admin", 	description: "Allowed to do everthing except removing the project.", 											icon: "images/icons/adminIcon.png"},
		{name: "Owner", 	description: "Allowed to do everthing.", 																		icon: "images/icons/ownerIconDark.png"}
	 ];




	async function onOpen(_project) {
		if (!_project) _project = (await Server.getProjectList(true))[0];
		
		HTML.inviteHolder.classList.add("hide");

		MainContent.header.setTitle("Settings - " + _project.title);
		MainContent.header.setTitleIcon('settings');

		let users = await _project.users.getAll(true);
		if (_project.users.self.permissions.users.invite) HTML.inviteHolder.classList.remove("hide");
		This.setMemberItemsFromList(users);
	}




	this.inviteUserByLink = async function() {
		let response = await MainContent.curProject.users.inviteByLink();
		if (response.error) console.error("An error accured while inviting a user:", response);

		Popup.inviteByLinkCopyMenu.open(window.location.href.split('?')[0] + "?link=" + response.result.id);
		This.open(MainContent.curProject);
	}


	this.setMemberItemsFromList = function(_memberList) {
		HTML.memberHolder.innerHTML = '<div class="text header">Members (' + _memberList.length + ')</div>';
		for (let member of _memberList) this.addMemberItem(member);
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
		DoubleClick.register(html.children[2].children[1], function () {
			if (!MainContent.curProject.users.self.permissions.users.changePermissions(_member)) return false;
			Popup.permissionMenu.open(_member.id);
		})

		html.children[2].children[0].onclick = function () {
			MainContent.settingsPage.optionMenu.open(html.children[2].children[0]);
		}


		DOMData.set(html, _member.id);
		return html;
	}




	this.optionMenu = new function() {
		let Menu = OptionMenu.create();
		let curItem = "";
		let curMemberId = "";	

		Menu.addOption(
			"Remove user", 
			async function () {
				if (!curMemberId) return false;
				let member = await MainContent.curProject.users.get(curMemberId);
				if (!member) return;


				let actionValidated = await Popup.showMessage({
					title: "Remove " + member.name + "?", 
					text: "Are you sure you want to remove " + member.name + " from " + MainContent.curProject.title + "?",
					buttons: [
						{title: "Remove", value: true, filled: true, color: COLOUR.DANGEROUS}, 
						{title: "Cancel", value: false}
					]
				});

				if (!actionValidated) return;

				let removed = await MainContent.curProject.users.remove(curMemberId);
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
			
			let member 		= await MainContent.curProject.users.get(curMemberId);

			Menu.enableAllOptions();
			if (!MainContent.curProject.users.self.permissions.users.remove(member))				Menu.options[0].disable();
			if (!MainContent.curProject.users.self.permissions.users.changePermissions(member)) 	Menu.options[1].disable();

			return Menu.open(_target, {left: -75, top: 30});
		}

		this.openState 	= Menu.openState;
		this.close 		= Menu.close;
	}
}












function MainContent_plannerPage() {
	MainContent_page.call(this, {
		name: "planner",
		index: 2,
		onOpen: onOpen
	});

	let This = this;

	async function onOpen() {
		MainContent.header.showItemsByPage("planner");
		MainContent.header.setTitleIcon('planner');
		MainContent.header.setTitle("Planner");
		MainContent.header.setMemberList([]);
	}
}




