console.warn("mainContent/navigator.js: loaded");




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

	this.CreateProject = new _MainContent_menuCreateProject(this);




	



	this.curMenu = "";
	this.open = function(_menuName = "Main") {
		$(HTML.mainContentHolder.parentNode).animate({opacity: 0}, 50);
		_resetPage();

		let menu = This[_menuName];
		if (!menu || !menu.onOpen) return console.warn("MainContent.menu.openMenu: " + _menuName + " doesn't exist.");


		let pageIndex = menu.pageIndex;
		this.curMenu = _menuName;

		setTimeout(function () {
			if (menu.hideHeader) HTML.mainContentHeader.classList.add("hide"); else HTML.mainContentHeader.classList.remove("hide");

			_openMenuByIndex(pageIndex);

			menu.onOpen();
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

			Parent.todoHolder.dayItem.clear();
			Parent.todoHolder.dayItem.addOverdue();
			page.onOpen(_projectId);
		}, 55);


		$(HTML.mainContentHolder.parentNode).delay(50).animate({opacity: 1}, 50);	
	}


		
		

	function openToday() {
		let date = new Date();
		MainContent.header.setTitle("Today - " + date.getDate() + " " + date.getMonths()[date.getMonth()].name);
		MainContent.header.setMemberList([]);

		let todoList = MainContent.menu.Main.todoHolder.renderSettings.applyFilter(Server.todos.getByDate(date));
		let dayItem = MainContent.menu.Main.todoHolder.dayItem.add(date, false, {displayProjectTitle: true});
		dayItem.todo.renderTodoList(todoList);
	}


	function openInbox() {
		MainContent.header.setTitle("Inbox");
		MainContent.header.setMemberList([]);

		for (let i = 0; i < 7; i++)
		{
			let date = new Date().moveDay(i);
			let todoList = MainContent.menu.Main.todoHolder.renderSettings.applyFilter(Server.todos.getByDate(date));
			let dayItem = Parent.todoHolder.dayItem.add(date, false, {displayProjectTitle: true});
			dayItem.todo.renderTodoList(todoList);
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
			let dayItem = Parent.todoHolder.dayItem.add(date, false, {displayProjectTitle: false});
			dayItem.todo.renderTodoList(todoList);
		}
	}





	function _resetPage() {
		MainContent.optionMenu.close();
	}
}



















function _MainContent_menuCreateProject(_parent) {
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






