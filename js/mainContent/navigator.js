


function _MainContent_menu() {
	let This = this;

	let HTML = {
		mainContentHolder: mainContentHolder,
		mainContentHeader: mainContentHeader,
		menus: $("#mainContentHolder .mainContentMenu"),
	}



	// the menus
	this.Main = new function() {
		this.pageIndex 	= 0;
		this.page 		= new _MainContent_menuMain_page(this);
		this.todoHolder = new _MainContent_todoHolder(this);

		this.onOpen 	= function() {}
	}

	this.CreateProject 	= new _MainContent_menu_CreateProject(this);
	this.Member 		= new _MainContent_menu_Member(this);




	



	this.curMenu = "";
	this.curProjectId = false;
	this.open = function(_menuName = "Main", _projectId = false) {
		$(HTML.mainContentHolder.parentNode).animate({opacity: 0}, 50);
		_resetPage();

		let menu = This[_menuName];
		if (!menu || !menu.onOpen) return console.warn("MainContent.menu.openMenu: " + _menuName + " doesn't exist.");


		let pageIndex 		= menu.pageIndex;
		this.curMenu 		= _menuName;
		this.curProjectId 	= _projectId;

		setTimeout(function () {
			if (menu.hideHeader) HTML.mainContentHeader.classList.add("hide"); else HTML.mainContentHeader.classList.remove("hide");

			_openMenuByIndex(pageIndex);

			menu.onOpen(_projectId);
		}, 55);


		$(HTML.mainContentHolder.parentNode).delay(50).animate({opacity: 1}, 50);	
	}


	function _openMenuByIndex(_index) {
		for (let i = 0; i < HTML.menus.length; i++) if (i != _index) HTML.menus[i].classList.add("hide");
		HTML.menus[parseInt(_index)].classList.remove("hide");
	}

	function _resetPage() {
		MainContent.optionMenu.close();
	}
}




















function _MainContent_menuMain_page(_parent) {
	let Parent = _parent;
	let This = this;

	let HTML = {
		mainContentHolder: mainContentHolder,
		todoHolder: $("#mainContentHolder .todoListHolder")[0],
		loadMoreButton: $("#mainContentHolder .loadMoreButton")[0],
	}


	this.pages = {
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



	this.curPage = "Today";
	this.curProjectId = false;
	
	this.reopenCurPage = function() {
		this.open(this.curPage, this.curProjectId);
	}


	this.open = function(_pageName = "Today", _projectId = false) {
		$(HTML.mainContentHolder.parentNode).animate({opacity: 0}, 50);
		_resetPage();
		setTimeout(function () {
			let page = This.pages[_pageName];
			if (!page) return console.warn("MainContent.menu.Main.page.open: " + _pageName + " doesn't exist.");
			
			if (page.hideLoadMoreButton) HTML.loadMoreButton.classList.add("hide"); else HTML.loadMoreButton.classList.remove("hide");
			This.curProjectId = _projectId;
			This.curPage = _pageName;

			Parent.todoHolder.taskHolder.clear();
			Parent.todoHolder.taskHolder.addOverdue();
			
			page.onOpen(_projectId);
		}, 55);


		$(HTML.mainContentHolder.parentNode).delay(50).animate({opacity: 1}, 50);	
	}


		
		

	function openToday() {
		let date = new Date();
		MainContent.header.setTitle("Today - " + date.getDate() + " " + date.getMonths()[date.getMonth()].name);
		MainContent.header.setMemberList([]);

		let todoList = MainContent.menu.Main.todoHolder.renderSettings.applyFilter(Server.todos.getByDate(date));
		let taskHolder = Parent.todoHolder.taskHolder.add({displayProjectTitle: true, date: date});
		taskHolder.todo.renderTodoList(todoList);
	}


	function openInbox() {
		MainContent.header.setTitle("Inbox");
		MainContent.header.setMemberList([]);

		for (let i = 0; i < 7; i++)
		{
			let date = new Date().moveDay(i);
			let todoList = MainContent.menu.Main.todoHolder.renderSettings.applyFilter(Server.todos.getByDate(date));
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
			let todoList = MainContent.menu.Main.todoHolder.renderSettings.applyFilter(project.todos.getTodosByDate(date));
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



















function _MainContent_menu_CreateProject(_parent) {
	let This = this;
	let Parent = _parent;
	
	let HTML = {
		page: $(".mainContentMenu.createProjectPage"),
		titleInputField: $(".mainContentMenu.createProjectPage .inputField")[0],
	}



	this.pageIndex 	= 1;
	this.hideHeader	= true;
	this.onOpen 	= function() {
		HTML.titleInputField.value = null;
		HTML.titleInputField.focus();
	}


	this.createProject = function() {
		let project = _scrapeProjectData();
		if (typeof project != "object") return alert(project);
		Server.createProject(project.title).then(function (_project) {
			App.update();
			Parent.open("Main");
			Parent.Main.page.open("Project", _project.id);
		});
	} 
	

		function _scrapeProjectData() {
			let project = {title: HTML.titleInputField.value};
			
			if (!project.title || project.title.length < 2) return "E_incorrectTitle";

			return project;
		}
}




function _MainContent_menu_Member(_parent) {
	let This = this;
	let Parent = _parent;
	
	let HTML = {
		Self: $(".mainContentMenu.memberPage")[0],
		memberHolder: $(".mainContentMenu.memberPage .memberHolder")[0],
	}

	this.pageIndex 	= 2;
	this.hideHeader	= false;


	this.onOpen = function(_projectId) {
		let project = Server.getProject(_projectId);
		if (!project) return false;

		MainContent.header.setTitle("Members - " + project.title);

		this.setMemberItemsFromList(project.users.getList());
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








