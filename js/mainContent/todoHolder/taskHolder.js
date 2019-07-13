
/*
	preferences: {
		title: "customTitle",
		class: "customClass",
		customAttributes: [{key: "click", value: function}]
	}
*/




function _MainContent_todoHolder_taskHolder() {
	return {
		setup: function(_appendTo, _preferences = {}) {
			this.id = newId();
			this.preferences = _preferences;

			this.HTML = {
				Parent: _appendTo,
				Self: renderDayItem(this),
			}
			this.HTML.Parent.append(this.HTML.Self);

			
			if (!this.preferences.customAttributes) return;
			for (attribute of this.preferences.customAttributes) 
			{
				this.HTML.Self.setAttribute(attribute.key, attribute.value);
			}
		},


		remove: function() {
			this.HTML.Self.parentNode.removeChild(this.HTML.Self);
			MainContent.menu["Main"].todoHolder.taskHolder.remove(this.id);
		},


		onTaskFinish: function(_task) {
			console.warn("FINISH", _task);
		},

		onTaskRemove: function(_taskId) {
			console.warn("REMOVE", _taskId);
			this.todo.removeTask(_taskId);
		}
	}


	function renderDayItem(This) {
		let html = document.createElement("div");
		html.className = "taskHolder";

		if (This.preferences.class) html.classList.add(This.preferences.class);

		html.setAttribute("taskHolderId", This.id);


		html.innerHTML = 	'<div class="header dateHolder"></div>' + 
							'<div class="todoHolder"></div>' + 
							'<div class="todoItem createTaskHolder">' + 
							'</div>';

		setTextToElement(html.children[0], This.preferences.title);

		return html;
	}
}







function _MainContent_todoHolder_taskHolder_createMenu() {
	let Parent;
	let This;

	let edit_todo = null;
	let edit_todoHTML = null;

	return {
		openState: false,

		setup: function(_parent) {
			This = this;
			Parent = _parent;
			Parent.HTML.menuHolder = Parent.HTML.Self.children[2];


			this.close(false);
		},


		open: function(_editing = false) {			
			MainContent.menu.Main.todoHolder.taskHolder.closeAllCreateMenus();

			this.openState = true;
			addCreateMenuHtml(Parent.HTML.menuHolder, _editing);
			MainContent.searchOptionMenu.openWithInputField(Parent.HTML.menuHolder.children[0].children[0]);
		},


		openEdit: function(_todoHTML, _todoId) {
			let todo = Server.todos.get(_todoId);
			if (!todo || !_todoHTML) return false;
			this.open(true);

			edit_todo = todo;
			edit_todoHTML = _todoHTML;
			edit_todoHTML.classList.add("hide");
			
			Parent.HTML.menuHolder.children[0].children[0].value = todo.title;
		},



		close: function(_animate) {
			this.openState = false;
			addButtonHtml(_animate);
			resetEditMode();
		},


		createTask: function() {
			let task 		= scrapeTodoData();
			let project 	= Server.getProject(task.projectId);

			if (!project) 	return false;
			if (typeof task != "object") return task;

			resetEditMode(true);	

			task = project.todos.update(task);

			let curProjectId = MainContent.menu["Main"].page.curProjectId;
			if (curProjectId == task.projectId || !curProjectId) Parent.todo.renderTodo(task, Parent);
			
			this.close();
			MainContent.searchOptionMenu.close();

			return true;
		},


		openTagSelectMenu: function() {
			openSelectMenu(0, "#", Server.projectList[0].tags.list);
		},

		openMemberSelectMenu: function() {
			openSelectMenu(1, "@", Server.projectList[0].users.getList());
		},
		
		openProjectSelectMenu: function() {
			openSelectMenu(2, ".", Server.projectList);
		}
	}







	function resetEditMode(_deleteTodo = false) {
		if (edit_todoHTML) edit_todoHTML.classList.remove("hide");
		if (edit_todoHTML && _deleteTodo) edit_todoHTML.parentNode.removeChild(edit_todoHTML);
		edit_todoHTML = null;
		edit_todo = "";
	}


	function addCreateMenuHtml(_parent, _editing = false) {
		let newInnerHTML = '<div class="createMenuHolder hide">' + 
								'<input class="text inputField iBoxy clickable" placeholder="Read some books...">' + 
								'<div class="leftHand">' + 
									'<div class="text button bDefault bBoxy" style="float: left">Create</div>' + 
									'<div class="text button" style="float: left">Cancel</div>' + 
								'</div>' +
								'<div class="rightHand">' + 
									'<img src="images/icons/tagIcon.png" class="icon tagIcon clickable">' +
									'<img src="images/icons/memberIcon.png" class="icon clickable">' +
									'<img src="images/icons/projectIconDark.svg" class="icon projectIcon clickable">' +
								'</div>' +
							'</div>';
		
		_parent.innerHTML = newInnerHTML;
		
		let createMenu = _parent.children[0];
		if (_editing) createMenu.children[1].children[0].innerHTML = "Change";
		createMenu.children[1].children[0].onclick = function () {Parent.createMenu.createTask();}
		createMenu.children[1].children[1].onclick = function () {Parent.createMenu.close();}


		createMenu.children[2].children[0].onclick = function () {Parent.createMenu.openTagSelectMenu()}
		createMenu.children[2].children[1].onclick = function () {Parent.createMenu.openMemberSelectMenu()}
		createMenu.children[2].children[2].onclick = function () {Parent.createMenu.openProjectSelectMenu()}
		

		let placeholderText = PLACEHOLDERTEXTS[Math.floor(Math.random() * PLACEHOLDERTEXTS.length)];
		createMenu.children[0].placeholder = placeholderText;
		createMenu.children[0].focus();
		createMenu.classList.remove("hide");
	}



	function addButtonHtml(_animate = true) {
		let id = newId();
		let newInnerHTML = '<div class="addButtonHolder smallTextHolder clickable" onclick="MainContent.taskHolder.openCreateMenu(this.parentNode)">' + 
								'<a class="smallText smallTextIcon">+</a>' + 
								'<div class="smallText">Create Todo</div>' + 
							'</div>';
		Parent.HTML.menuHolder.innerHTML = newInnerHTML;
		let createMenuButton = Parent.HTML.menuHolder.children[0];

		createMenuButton.onclick = function () {Parent.createMenu.open();}

		if (!_animate) return false;
		createMenuButton.classList.add("hide");
		createMenuButton.setAttribute("id", "addButtonHolder" + id);

		
		setTimeout(function () {
			if (!$('#addButtonHolder' + id)[0]) return;
			$('#addButtonHolder' + id)[0].classList.remove('hide');
		}, 1);
	}




	function scrapeTodoData() {
		let createMenuItems = Parent.HTML.menuHolder.children[0].children;
		if (!createMenuItems[0]) return false;

		let task = _inputValueToData(createMenuItems[0].value);

		if (!task.title || task.title.split(" ").join("").length < 1) return "E_InvalidTitle";
		
		task.groupType = "date";
		task.groupValue = Parent.date.copy().toString();
		if (!task.groupValue) return "E_InvalidDate";

		return task;
	}

	function _inputValueToData(_value) {
		let task = {
			assignedTo: []
		};

		if (edit_todo) task = edit_todo;

		// add projectId
		let projects = getListByValue(_value, ".");
		task.title 	= projects.value;
		if (projects.list[0]) 
		{
			task.projectId = projects.list[0].id;
		} else if (!edit_todo) 
		{
			let project 	= Server.getProject(MainContent.menu.Main.page.curProjectId);
			task.projectId 	= project ? project.id : Server.projectList[0].id;
		}

		
		// add tagId
		let tags = getListByValue(task.title, "#");
		task.title 	= tags.value;
		if (tags.list[0]) task.tagId = tags.list[0].id;


		// add assignedTo-list
		let members = getListByValue(task.title, "@");
		task.title 	= members.value;
		for (member of members.list)
		{
			if (inArray(task.assignedTo, member.id)) continue;
			task.assignedTo.push(member.id);
		}

		
		task.title 	= removeSpacesFromEnds(task.title);
		return task;
	}


	function getListByValue(_value, _type) {
		let items = MainContent.searchOptionMenu.getListByValue(_value, _type);
		let found = [];
		for (item of items)
		{
			if (item.score < 1) return {list: found, value: _value};
			found.push(item.item);
			
			let parts = _value.split(_type + item.str);
			_value = parts.join("");
		}

		return {list: found, value: _value};
	}



	function openSelectMenu(_iconIndex = 0, _indicator = ".", _items = []) {
		if (!This.openState) return false;
		let item = Parent.HTML.menuHolder.children[0].children[2].children[_iconIndex];
		MainContent.searchOptionMenu.open(item);
		
		for (item of _items) 
		{
			MainContent.searchOptionMenu.addSearchItem(
				{
					item: item,
				}, 
				_indicator
			);
		}
	}
}







function _MainContent_todoHolder_taskHolder_todo() {
	let Parent;
	let RenderPreferences;

	this.setup = function(_parent, _renderPreferences) {
		Parent = _parent;
		RenderPreferences = _renderPreferences;
		
		Parent.HTML.todoHolder = Parent.HTML.Self.children[1];
	}
	

	this.taskList = [];


	this.renderTodoList = function(_todoList, _location) {
		for (let i = 0; i < _todoList.length; i++)
		{
			if (location)
			{
				this.renderTodo(_todoList[i], _location + i);
				continue;
			}

			this.renderTodo(_todoList[i]);
		}
	}

	this.renderTodo = function(_task, _location) {
		console.log("render", _task);
		let todos = Parent.HTML.todoHolder.children;
		if (typeof _location != "number") _location = todos.length;
		_task.taskHolderId = Parent.id;

		let task = MainContent.menu["Main"].todoHolder.renderer.renderToDo(_task, Parent, RenderPreferences.displayProjectTitle);

		Parent.HTML.todoHolder.insertBefore(
			task, 
			todos[parseInt(_location)]
		);

		this.taskList.push({
			taskId: _task.id,
			html: task
		});
	}


	this.removeTask = function(_id) {
		for (let i = 0; i < this.taskList.length; i++)
		{
			if (this.taskList[i].taskId != _id) continue;
			
			let html = this.taskList[i].html;
			html.classList.add("hide");
			
			var loopTimer = setTimeout(
				function () {
					html.parentNode.removeChild(html)
				}, 
				500
			);


			this.taskList.splice(i, 1);

			return true;
		}

		return false;
	}
}






































function _MainContent_taskHolder() {
	let HTML = {
		todoHolder: $("#mainContentHolder .todoListHolder")[0],
	}
	this.list = [];

	this.add = function(_preferences = {customAttributes: []}, _todoRenderPreferences = {}, _type = "day") {
		let taskHolder = buildDayItem(
			HTML.todoHolder,
			_preferences,
			_todoRenderPreferences,
			_type
		);

		this.list.push(taskHolder);

		return taskHolder;
	}

	this.addOverdue = function() {
		let project = Server.getProject(MainContent.menu.Main.page.curProjectId);
		let todoList = []; 
		if (project) 
		{
			todoList = project.todos.getTodosByDate(new Date().moveDay(-1));
		} else {
			todoList = Server.todos.getByDate(new Date().moveDay(-1));
		}
		
		todoList = MainContent.menu.Main.todoHolder.renderSettings.applyFilter(
			todoList,
			{
				renderFinishedTodos: false,
			}
		);
		if (!todoList.length) return false;



		let item = this.add({}, {}, "overdue");
		item.todo.renderTodoList(todoList);
	}


	this.addList = function(_listName = "List") {
		let item = this.add( 
			{
				title: _listName, 
				class: "list", 
			},
			{},
			"list"
		);

		item.todo.renderTodoList(todoList);
	}








	function buildDayItem(_appendTo, _preferences, _todoRenderPreferences, _type) {
		let taskHolder 			= new _MainContent_todoHolder_taskHolder;
		taskHolder.createMenu 	= new _MainContent_todoHolder_taskHolder_createMenu;
		taskHolder.todo 		= new _MainContent_todoHolder_taskHolder_todo;

		extendTaskHolder(_type, taskHolder, _preferences)

		taskHolder.setup(_appendTo, _preferences);
		taskHolder.createMenu.setup(taskHolder);
		taskHolder.todo.setup(taskHolder, _todoRenderPreferences);

		return taskHolder;
	}


	function extendTaskHolder(_type, taskHolder, _preferences) {
		switch (_type)
		{
			case "overdue": extendOverdue(taskHolder, _preferences); break;
			default: 		extendDayItem(taskHolder, _preferences); break;
		}
	}


	function extendOverdue(taskHolder, _preferences) {
		_preferences.class = "overdue";
		_preferences.title = "Overdue";

		// taskHolder.createMenu.disable(); no longer supported

		taskHolder.onTaskFinish = function(_task) {
			let taskId = _task.id ? _task.id : _task;
			this.todo.removeTask(taskId);
			if (this.todo.taskList.length > 0) return;
			this.remove();
		}

		taskHolder.onTaskRemove = taskHolder.onTaskFinish;
	}


	function extendDayItem(taskHolder, _preferences) {		
		_preferences.title 	= dateToDisplayText(_preferences.date);
		taskHolder.date 	= _preferences.date;
		
		if (typeof _preferences.customAttributes != "object") _preferences.customAttributes = [];
		_preferences.customAttributes.push(
			{
				key: "date", 
				value: _preferences.date.toString()
			}
		);
	}










	this.get = function(_id) {
		for (let i = 0; i < this.list.length; i++)
		{
			if (this.list[i].id != _id) continue;
			return this.list[i];
		}
		return false;
	}

	this.remove = function(_id) {
		for (let i = 0; i < this.list.length; i++)
		{
			if (this.list[i].id != _id) continue;
			this.list.splice(i, 1);
			return true;
		}
		return false;
	}


	this.clear = function() {
		HTML.todoHolder.innerHTML = "";
		this.list = [];
	}


	this.createTask = function() {
		for (let i = 0; i < this.list.length; i++)
		{
			if (!this.list[i].createMenu.openState) continue;
			this.list[i].createMenu.createTask();
			return true;
		}
		return false;
	}


	this.closeAllCreateMenus = function() {
		let found = false;
		for (let i = 0; i < this.list.length; i++)
		{
			if (!this.list[i].createMenu.openState) continue;
			this.list[i].createMenu.close();
			found = true;
		}
		return found;
	}
}
















