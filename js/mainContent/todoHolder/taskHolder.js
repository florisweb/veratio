





function _MainContent_taskHolder() {
	let HTML = {
		todoHolder: $("#mainContentHolder .todoListHolder")[0],
	}
	
	this.list = [];
	this.add = function(_preferences = {customAttributes: []}, _taskRenderPreferences = {}, _type = "day") {
		let taskHolder = buildDayItem(
			HTML.todoHolder,
			_preferences,
			_taskRenderPreferences,
			_type
		);

		this.list.push(taskHolder);
		return taskHolder;
	}

	this.addOverdue = function() {
		let project = Server.getProject(MainContent.curProjectId);
		let todoList = []; 
		if (project) 
		{
			todoList = project.todos.getTodosByDate(new Date().moveDay(-1));
		} else {
			todoList = Server.todos.getByDate(new Date().moveDay(-1));
		}
		
		todoList 	= MainContent.taskPage.renderer.settings.filter(todoList, {
			finished: true
		});
		todoList 	= MainContent.taskPage.renderer.settings.sort(todoList, []);
		
		if (!todoList.length) return false;

		let item = this.add(
			{}, 
			{
				displayProjectTitle: !MainContent.curProjectId
			}, 
			"overdue"
		);

		item.createMenu.disable();
		item.todo.renderTodoList(todoList);
	}



	function buildDayItem(_appendTo, _preferences, _taskRenderPreferences, _type) {
		let constructor = _taskHolder_day;

		switch (_type)
		{
			case "overdue": constructor = _taskHolder_overdue; break;
			case "list": 	constructor = _taskHolder_list; break;
		}

		return new constructor(_appendTo, _preferences, _taskRenderPreferences);
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














function _taskHolder(_appendTo, _preferences, _renderPreferences, _type) {
	let This = this;
	this.id 			= newId();
	this.preferences 	= _preferences;
	this.type 			= _type;

	this.HTML = {
		Parent: _appendTo,
	}
	this.HTML.Self = renderDayItem(this),

	this.createMenu 	= new _taskHolder_createMenu(this);
	this.todo 			= new _taskHolder_task(this, _renderPreferences);


	this.remove = function() {
		this.HTML.Self.parentNode.removeChild(this.HTML.Self);
		MainContent.taskPage.taskHolder.remove(this.id);
	}

	this.onTaskFinish = function(_task) {
		console.warn("FINISH", _task);
	}

	this.onTaskRemove = function(_taskId) {
		console.warn("REMOVE", _taskId);
		this.todo.removeTask(_taskId);
	}

	function renderDayItem() {
		let html = document.createElement("div");
		html.className = "taskHolder";

		html.innerHTML = 	'<div class="header dateHolder"></div>' + 
							'<div class="todoHolder"></div>' + 
							'<div class="todoItem createTaskHolder close">' + 
								'<div class="createMenuHolder">' + 
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
								'</div>' + 
								'<div class="addButtonHolder smallTextHolder clickable" onclick="MainContent.taskHolder.openCreateMenu(this.parentNode)">' + 
									'<a class="smallText smallTextIcon">+</a>' + 
									'<div class="smallText">Create Task</div>' + 
								'</div>' +
							'</div>';

		This.HTML.createMenu = html.children[2];


		if (!This.preferences.title) html.style.marginTop = "0";
		setTextToElement(html.children[0], This.preferences.title);




		// if (_editing) createMenu.children[1].children[0].innerHTML = "Change";
		let createMenu = html.children[2].children[0];
		createMenu.children[1].children[0].onclick = function () {This.createMenu.createTask();}
		createMenu.children[1].children[1].onclick = function () {This.createMenu.close();}


		createMenu.children[2].children[0].onclick = function () {This.createMenu.openTagSelectMenu()}
		createMenu.children[2].children[1].onclick = function () {This.createMenu.openMemberSelectMenu()}
		createMenu.children[2].children[2].onclick = function () {This.createMenu.openProjectSelectMenu()}
		

		createMenu.children[0].placeholder = PLACEHOLDERTEXTS.randomItem();
		This.HTML.createMenu.children[1].onclick = function () {This.createMenu.open();}





		This.HTML.Parent.append(html);
		return html;
	}
}




function _taskHolder_createMenu(_Parent) {
	let Parent = _Parent;
	let This = this;
	let HTML = {
		inputField: Parent.HTML.createMenu.children[0].children[0]
	}

	let edit_todo = null;
	let edit_todoHTML = null;


	this.openState = false;
	this.enabled = true;

	function setup() {
		This.close(false);

		let project = Server.getProject(MainContent.curProjectId);
		if (!project || !project.users.Self) return;
		if (!project.users.Self.taskActionAllowed("update")) This.disable();
	};



	this.open = function(_editing = false) {
		if (!this.enabled) return;	

		MainContent.taskPage.taskHolder.closeAllCreateMenus();

		this.openState = true;
		Parent.HTML.createMenu.classList.remove("close");
		HTML.inputField.focus();
		HTML.inputField.value = null;



		let buttonTitle = "Create";
		if (_editing) buttonTitle = "Change";
		Parent.HTML.createMenu.children[0].children[1].children[0].innerHTML = buttonTitle;

		MainContent.searchOptionMenu.openWithInputField(Parent.HTML.createMenu.children[0].children[0]);
	}


	this.openEdit = function(_todoHTML, _todoId) {
		if (!this.enabled) return;

		let task = Server.todos.get(_todoId);
		if (!task || !_todoHTML) return false;
		this.open(true);

		edit_todo = task;
		edit_todoHTML = _todoHTML;
		edit_todoHTML.classList.add("hide");

		setEditModeData(task);
	}

	function setEditModeData(_task) {
		let createMenu = Parent.HTML.createMenu;
		let project = Server.getProject(_task.projectId);
		
		createMenu.children[0].children[0].value = _task.title;
	}



	this.close = function() {
		this.openState = false;
		Parent.HTML.createMenu.classList.add("close");
		resetEditMode();
	}




	this.disable = function() {
		this.enabled = false;
		Parent.HTML.createMenu.innerHTML = "";
	}






	this.createTask = function() {
		if (!this.enabled) return;

		let task 		= scrapeTaskData();
		let project 	= Server.getProject(task.projectId);

		if (!project) 	return false;
		if (typeof task != "object") return task;
		resetEditMode(true);

		project.todos.update(task);
		
		task.projectId = project.id; 
		if (!MainContent.curProjectId || MainContent.curProjectId == project.id) Parent.todo.renderTodo(task, Parent);
		
		this.close();
		MainContent.searchOptionMenu.close();
		
		return true;
	}


	this.openTagSelectMenu = function() {
		openSelectMenu(0, "#", Server.projectList[0].tags.list);
	}

	this.openMemberSelectMenu = function() {
		openSelectMenu(1, "@", Server.projectList[0].users.getList());
	}
		
	this.openProjectSelectMenu = function() {
		openSelectMenu(2, ".", Server.projectList);
	}

	function openSelectMenu(_iconIndex = 0, _indicator = ".", _items = []) {
		if (!This.openState) return false;
		let item = Parent.HTML.createMenu.children[0].children[2].children[_iconIndex];
		MainContent.searchOptionMenu.open(item);
		
		for (item of _items) 
		{
			MainContent.searchOptionMenu.addSearchItem(
				{item: item}, 
				_indicator
			);
		}
	}










	function resetEditMode(_deleteTodo = false) {
		if (edit_todoHTML) edit_todoHTML.classList.remove("hide");
		if (edit_todoHTML && _deleteTodo) edit_todoHTML.parentNode.removeChild(edit_todoHTML);
		edit_todoHTML = null;
		edit_todo = "";
	}




	function scrapeTaskData() {
		let createMenuItems = Parent.HTML.createMenu.children[0].children;
		if (!createMenuItems[0]) return false;

		let task = _inputValueToData(createMenuItems[0].value);

		if (!task.title || task.title.split(" ").join("").length < 1) return "E_InvalidTitle";
		
		switch (Parent.type)
		{
			case "list": 
				task.groupType = "default";
				task.groupValue = "";
			break;
			default: 
				task.groupType = "date";
				task.groupValue = Parent.date.copy().toString();
				if (!task.groupValue) return "E_InvalidDate";
			break;
		}

		return task;
	}

	function _inputValueToData(_value) {
		let task = {
			assignedTo: [],
			id: newId()
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
			let project 	= Server.getProject(MainContent.curProjectId);
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
			if (task.assignedTo.includes(member.id)) continue;
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

	setup();
}


function _taskHolder_task(_parent, _renderPreferences) {
	let Parent = _parent;
	let RenderPreferences = _renderPreferences;
	
	Parent.HTML.todoHolder = Parent.HTML.Self.children[1];
	
	

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
		let todos = Parent.HTML.todoHolder.children;
		if (typeof _location != "number") _location = todos.length;
		_task.taskHolderId = Parent.id;

		let task = MainContent.taskPage.renderer.renderToDo(_task, Parent, RenderPreferences.displayProjectTitle);

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











function _taskHolder_day(_appendTo, _preferences, _renderPreferences) {
	_preferences.title = dateToDisplayText(_preferences.date);
	this.date = _preferences.date;
	_taskHolder.call(this, _appendTo, _preferences, _renderPreferences, "day");
}


function _taskHolder_list(_appendTo, _preferences, _renderPreferences) {
	_preferences.title = "";
	_taskHolder.call(this, _appendTo, _preferences, _renderPreferences, "list");
}


function _taskHolder_overdue(_appendTo, _preferences, _renderPreferences) {
	_preferences.title = "Overdue";
	_taskHolder.call(this, _appendTo, _preferences, _renderPreferences, "overdue");

	// make overdue alterations
	this.HTML.Self.classList.add("overdue");
	
	this.onTaskRemove = this.onTaskFinish;
	this.onTaskFinish = function(_task) {
		let taskId = _task.id ? _task.id : _task;
		this.todo.removeTask(taskId);
		if (this.todo.taskList.length > 0) return;
		this.remove();
	}
}





