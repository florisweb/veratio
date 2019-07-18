


function _MainContent_taskPage(_parent) {
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





	this.page 		= new _MainContent_taskPage_tabs(this);
	this.todoHolder = new _MainContent_todoHolder(this);

}





function _MainContent_taskPage_tabs(_parent) {
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
		this.open(this.curPage, MainContent.curProjectId);
	}


	this.open = function(_tabName = "Today", _projectId = false) {
		$(HTML.mainContentHolder.parentNode).animate({opacity: 0}, 50);
		_resetPage();
		setTimeout(function () {
			let tab = This.tabs[_tabName];
			if (!tab) return console.warn("MainContent.taskPage.tab.open: " + _tabName + " doesn't exist.");
			
			if (tab.hideLoadMoreButton) HTML.loadMoreButton.classList.add("hide"); else HTML.loadMoreButton.classList.remove("hide");
			MainContent.curProjectId = _projectId;
			This.curTab = _tabName;

			Parent.todoHolder.taskHolder.clear();
			Parent.todoHolder.taskHolder.addOverdue();
			
			tab.onOpen(_projectId);
		}, 55);


		$(HTML.mainContentHolder.parentNode).delay(50).animate({opacity: 1}, 50);	
	}


		
		

	function openToday() {
		let date = new Date();
		MainContent.header.setTitle("Today - " + date.getDate() + " " + date.getMonths()[date.getMonth()].name);
		MainContent.header.setMemberList([]);

		let todoList = MainContent.taskPage.todoHolder.renderSettings.applyFilter(Server.todos.getByDate(date));
		let taskHolder = Parent.todoHolder.taskHolder.add({displayProjectTitle: true, date: date});
		taskHolder.todo.renderTodoList(todoList);
	}


	function openInbox() {
		MainContent.header.setTitle("Inbox");
		MainContent.header.setMemberList([]);

		for (let i = 0; i < 7; i++)
		{
			let date = new Date().moveDay(i);
			let todoList = MainContent.taskPage.todoHolder.renderSettings.applyFilter(Server.todos.getByDate(date));
			let taskHolder = Parent.todoHolder.taskHolder.add({displayProjectTitle: true, date: date});
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
			let todoList = MainContent.taskPage.todoHolder.renderSettings.applyFilter(project.todos.getTodosByDate(date));
			let taskHolder = Parent.todoHolder.taskHolder.add(
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
			MainContent.taskpage.page.open("Project", _project.id);
		});
	} 
	

	function scrapeProjectData() {
		let project = {title: HTML.titleInputField.value};
		
		if (!project.title || project.title.length < 2) return "E_incorrectTitle";

		return project;
	}
}

















function _MainContent_memberPage(_parent) {
	let This = this;
	let Parent = _parent;
	
	let HTML = {
		memberHolder: $(".mainContentPage.memberPage .memberHolder")[0],
	}

	this.pageSettings = {
		pageName: "member",
		pageIndex: 2,
		hideHeader: true,
		onOpen: onOpen, 
	}	

	this.open = function(_projectId) {
		if (!_projectId) _projectId = Server.projectList[0].id;
		MainContent.openPage(this.pageSettings.pageName, _projectId);
	}



	function onOpen(_projectId) {
		let project = Server.getProject(_projectId);
		if (!project) return false;

		MainContent.header.setTitle("Members - " + project.title);

		This.setMemberItemsFromList(project.users.getList());
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
		html.innerHTML = '<img class="mainIcon icon" src="images/icons/memberIcon.png">' + 
						'<div class="titleHolder userText text">Dirk@dirkloop.com</div>' +
						'<div class="rightHand">' + 
							'<img src="images/icons/optionIcon.png" class="rightHandItem optionIcon onlyShowOnItemHover icon clickable">' +
							'<div class="rightHandItem text"></div>' + 
						'</div>';
		setTextToElement(html.children[1], _member.name);
		setTextToElement(html.children[2].children[1], _member.permissions);

		return html;
	}

}








