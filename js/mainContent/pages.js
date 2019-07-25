


function _MainContent_taskPage(_parent) {
	let HTML = {
		todoHolder: $("#mainContentHolder .todoListHolder")[0],
	}


	this.pageSettings = {
		pageName: "task",
		pageIndex: 0,
		onOpen: onOpen, 
	}

	function onOpen(_projectId) {

	}


	this.open = function(_projectId) {
		MainContent.openPage(this.pageSettings.pageName, _projectId);
	}



	this.tab 		= new _MainContent_taskPage_tab(this);

	this.taskHolder 	= new _MainContent_taskHolder();
	this.renderSettings = new _MainContent_renderSettings();
	this.renderer 		= new _TodoRenderer(HTML.todoHolder);


	this.loadMoreDays = function(_extraDays = 1) {
		loadExtraDay().then(
			function () {
				if (_extraDays <= 1) return;
				MainContent.taskPage.loadMoreDays(_extraDays - 1)
			}
		);
	}


	function loadExtraDay() {
		return new Promise(function (resolve, error) {
			let date = getNewDate();			
			let project = Server.getProject(MainContent.curProjectId);
			let mainPromise;

			
			if (project) 
			{
				mainPromise = project.todos.DTTemplate.DB.getByDate(date);
			} else mainPromise = getAllTodosByDate(date);

			mainPromise.then(
				function () {
					_renderExtraDay(date);
					resolve();
				}, 
				function() {error()}
			);

		});




		function getAllTodosByDate(_date) {
			return new Promise(function (resolve, error) {
				let promises = [];
				for (let i = 0; i < Server.projectList.length; i++) 
				{
					let project = Server.projectList[i];
					promises.push(project.todos.DTTemplate.DB.getByDate(_date));
				}


				Promise.all(promises).then(function() {
					resolve();
				}, function() {
					error();
				});
			});
		}


		function getNewDate() {
			let taskHolders = $("#mainContentHolder .taskHolder");
			let date = taskHolders[taskHolders.length - 1].getAttribute("date");
			return new Date().setDateFromStr(date).moveDay(1);
		}

		function _renderExtraDay(_date) {
			let project = Server.getProject(MainContent.curProjectId);
			let todoList = [];
			
			if (project)
			{
				todoList = project.todos.getTodosByDate(_date);
			} else todoList = Server.todos.getByDate(_date);


			todoList = MainContent.taskPage.renderSettings.applyFilter(todoList);
			let taskHolder = MainContent.taskPage.taskHolder.add({date: _date}, {displayProjectTitle: !project});
			taskHolder.todo.renderTodoList(todoList);
		}
	}
}





function _MainContent_taskPage_tab(_parent) {
	let Parent = _parent;
	let This = this;

	let HTML = {
		mainContentHolder: mainContentHolder,
		todoHolder: $("#mainContentHolder .todoListHolder")[0],
		loadMoreButton: $("#mainContentHolder .loadMoreButton")[0],
	}


	this.tabs = {
		Today: {
			hideLoadMoreButton: true,
			onOpen: openToday
		},
		Inbox: {
			onOpen: openInbox
		},
		Project: {
			onOpen: openProject
		}
	}



	this.curTab = "Today";
	
	this.reopenCurPage = function() {
		this.open(this.curTab, MainContent.curProjectId);
	}


	this.open = function(_tabName = "Today", _projectId = false) {
		MainContent.taskPage.open(_projectId);

		$(HTML.mainContentHolder.parentNode).animate({opacity: 0}, 50);
		_resetPage();
		setTimeout(function () {
			let tab = This.tabs[_tabName];
			if (!tab) return console.warn("MainContent.taskPage.tab.open: " + _tabName + " doesn't exist.");
			
			if (tab.hideLoadMoreButton) HTML.loadMoreButton.classList.add("hide"); else HTML.loadMoreButton.classList.remove("hide");
			MainContent.curProjectId = _projectId;
			This.curTab = _tabName;

			Parent.taskHolder.clear();
			Parent.taskHolder.addOverdue();
			
			tab.onOpen(_projectId);
		}, 55);


		$(HTML.mainContentHolder.parentNode).delay(50).animate({opacity: 1}, 50);	
	}


		
		

	function openToday() {
		let date = new Date();
		MainContent.header.setTitle("Today - " + date.getDate() + " " + date.getMonths()[date.getMonth()].name);
		MainContent.header.setMemberList([]);

		let todoList = MainContent.taskPage.renderSettings.applyFilter(Server.todos.getByDate(date));
		let taskHolder = Parent.taskHolder.add({displayProjectTitle: true, date: date});
		taskHolder.todo.renderTodoList(todoList);
	}


	function openInbox() {
		MainContent.header.setTitle("Inbox");
		MainContent.header.setMemberList([]);

		for (let i = 0; i < 7; i++)
		{
			let date = new Date().moveDay(i);
			let todoList = MainContent.taskPage.renderSettings.applyFilter(Server.todos.getByDate(date));
			let taskHolder = Parent.taskHolder.add({displayProjectTitle: true, date: date});
			taskHolder.todo.renderTodoList(todoList);
		}
	}


	function openProject(_projectId) {
		let project = Server.getProject(_projectId);
		if (!project) return;
		
		MainContent.header.setTitle(project.title);
		MainContent.header.setMemberList(project.users.getList());

		for (let i = 0; i < 7; i++)
		{
			let date = new Date().moveDay(i);
			let todoList = MainContent.taskPage.renderSettings.applyFilter(project.todos.getTodosByDate(date));
			let taskHolder = Parent.taskHolder.add(
				{displayProjectTitle: false, date: date}, 
				{displayProjectTitle: false}
			);
			
			taskHolder.todo.renderTodoList(todoList);
		}
	}




	function _resetPage() {
		MainContent.optionMenu.close();
	}
}
























function _MainContent_createProjectPage(_parent) {
	let This = this;
	let Parent = _parent;
	
	let HTML = {
		page: $(".mainContentPage.createProjectPage"),
		titleInputField: $(".mainContentPage.createProjectPage .inputField")[0],
	}

	this.pageSettings = {
		pageName: "createProject",
		pageIndex: 1,
		hideHeader: true,
		onOpen: onOpen, 
	}

	this.open = function(_projectId) {
		MainContent.openPage(this.pageSettings.pageName, _projectId);
	}

	function onOpen(_projectId) {
		HTML.titleInputField.value = null;
		HTML.titleInputField.focus();
	}







	this.createProject = function() {
		let project = scrapeProjectData();
		if (typeof project != "object") return alert(project);

		Server.createProject(project.title).then(function (_project) {
			App.update();
			MainContent.openPage("task");
			MainContent.taskPage.tab.open("Project", _project.id);
		});
	} 
	

	function scrapeProjectData() {
		let project = {title: HTML.titleInputField.value};
		
		if (!project.title || project.title.length < 2) return "E_incorrectTitle";

		return project;
	}
}




















function _MainContent_settingsPage(_parent) {
	let This = this;
	let Parent = _parent;
	
	let HTML = {
		Self: $(".mainContentPage.settingsPage")[0],
		memberHolder: $(".mainContentPage.settingsPage .memberHolder")[0],
		inviteMemberInput: $("#inviteMemberInput")[0]
	}

	this.pageSettings = {
		pageName: "settings",
		pageIndex: 2,
		onOpen: onOpen, 
	}

	this.permissionsMenu = new _MainContent_settingsPage_permissionsMenu();



	this.open = function(_projectId) {
		if (!_projectId) _projectId = Server.projectList[0].id;
		MainContent.openPage(this.pageSettings.pageName, _projectId);
	}



	function onOpen(_projectId) {
		let project = Server.getProject(_projectId);
		if (!project) return false;

		MainContent.header.setTitle("Settings - " + project.title);

		This.setMemberItemsFromList(project.users.getList());
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
			if (!project.users.Self.userActionAllowed("remove", member)) Menu.options[0].disable();
			if (!project.users.Self.userActionAllowed("update", member)) Menu.options[1].disable();

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
			This.open(MainContent.curProjectId);
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
		
		setTextToElement(html.children[1], _member.name);
		setTextToElement(html.children[2].children[1], _member.permissions);
		DoubleClick.register(html.children[2].children[1], function () {
			let project = Server.getProject(MainContent.curProjectId);
			if (!project.users.Self.userActionAllowed("update", member)) return false;

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

	this.open = function(_memberId) {
		let project	= Server.getProject(MainContent.curProjectId);
		let member 	= project.users.get(_memberId);

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
					function () 
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

						project.users.update(_member);
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















