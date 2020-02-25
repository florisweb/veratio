




function _MainContent_taskHolder() {
	let HTML = {
		todoHolder: $("#mainContentHolder .todoListHolder")[0],
		taskPage: $(".mainContentPage")[0]
	}

	this.deadLineOptionMenu = function() {
		let Menu = OptionMenu.create(HTML.taskPage, true);
	
		Menu.removeAllOptions = function() {
			for (option of Menu.options) this.options[0].remove();
		}

		let menu_open = Menu.open;
		Menu.open = function(_item, _event) {
			menu_open(_item, {left: 0, top: -20}, _event);
			if (_item.tagName != "INPUT") return;
			
			_item.onkeyup = function(_e) {
				menu_open(_item, {left: 0, top: -20});
				Menu.openState = true;
				Menu.removeAllOptions();

				let optionDate = DateNames.toDate(_item.value);
				if (!optionDate) return Menu.close();

				Menu.addOption(DateNames.toString(optionDate), function () {
					_item.value = optionDate.toString();
					Menu.close();
				}, "");
			
			}
		}

		return Menu;
	}();






	this.list = [];
	this.add = function(_type = "default", _renderPreferences = {}, _parameters = []) {
		let taskHolder = buildDayItem(_type, _renderPreferences, _parameters);
		this.list.push(taskHolder);
		return taskHolder;
	}

	this.addOverdue = async function() {
		let project = Server.getProject(MainContent.curProjectId);
		let todoList = []; 
		if (project) 
		{
			todoList = await project.tasks.getByGroup("overdue", "*");
		} else {
			let projectList = await Server.global.tasks.getByGroup("overdue", "*");
			for (project of projectList) todoList = todoList.concat(project);
		}
	
		if (!todoList || !todoList.length) return false;

		let item = this.add(
			"overdue", 
			{
				displayProjectTitle: !MainContent.curProjectId
			}
		);
		item.task.addTaskList(todoList);
	}


	const constructors = {
		default: 	TaskHolder_default,
		date: 		TaskHolder_date,
		overdue: 	TaskHolder_overdue
	}

	function buildDayItem(_type, _renderPreferences, _parameters) {
		const config = {
			html: {
				appendTo: HTML.todoHolder
			},
			renderPreferences: _renderPreferences
		}
		
		let parameters = [config].concat(_parameters);
		return new constructors[_type](...parameters);
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




	this.renderTask = function(_task) {
		for (taskHolder of this.list) 
		{
			if (!taskHolder.task.shouldRenderTask(_task)) continue;
			taskHolder.task.addTask(_task);
			return true;
		}
	}

	this.createTask = function() {
		for (taskHolder of this.list)
		{
			if (!taskHolder.createMenu) continue;
			if (!taskHolder.createMenu.openState) continue;
			taskHolder.createMenu.createTask();
			return true;
		}
		return false;
	}


	this.closeAllCreateMenus = function() {
		let closedCreateMenu = false;
		for (taskHolder of this.list)
		{
			if (!taskHolder.createMenu) continue;
			if (!taskHolder.createMenu.openState) continue;
			taskHolder.createMenu.close();
			closedCreateMenu = true;
		}
		return closedCreateMenu;
	}
}



















































// Types
function TaskHolder_default(_config, _title) {
	_config.title = _title;
	TaskHolder.call(this, _config, "default");
	TaskHolder_createMenuConstructor.call(this, _config, "default");
}


function TaskHolder_date(_config, _date) {
	this.date = _date;
	_config.title = DateNames.toString(_date, false);

	TaskHolder.call(this, _config, "date");
	TaskHolder_createMenuConstructor.call(this, _config, "default");
}


function TaskHolder_overdue(_config) {
	_config.title 		= "Overdue";
	_config.html.class 	= "overdue";
	TaskHolder.call(this, _config, "overdue");

	
	this.onTaskFinish = function(_taskWrapper) {
		this.task.removeTask(_taskWrapper.task.id, true);
		if (this.task.taskList.length > 0) return;
		this.remove();
	}
	this.onTaskRemove = this.onTaskFinish;
}


































function TaskHolder(_config = {}, _type = "default") {
	let This = this;
	this.id 			= newId();
	this.config 		= _config;
	this.type 			= _type;

	this.HTML = {
		Parent: _config.html.appendTo,
	}
	this.HTML.Self 	= renderTaskHolder(this.HTML.Parent);
	
	this.task 		= new TaskHolder_task(this);


	this.remove = function() {
		this.HTML.Self.parentNode.removeChild(this.HTML.Self);
		MainContent.taskHolder.remove(this.id);
	}

	this.onTaskFinish = function(_task) {
		console.warn("FINISH", _task);
	}

	this.onTaskRemove = function(_taskId) {
		console.warn("REMOVE", _taskId);
		this.task.removeTask(_taskId);
	}


	this.taskHolderOpenState = true;

	function renderTaskHolder(_parent) {
		let html = document.createElement("div");
		html.className = "taskHolder animateIn";
		setTimeout(function () {html.classList.remove("animateIn");}, 50);

		html.setAttribute("taskHolderId", This.id);

		if (This.config.html.class) html.className += " " + This.config.html.class;

		html.innerHTML = 	'<img src="images/icons/dropDownIconDark.png" class="dropDownButton clickable">' +
							'<div class="header dateHolder"></div>' + 
							'<div class="todoHolder"></div>';


		html.onclick = function(_e) {
			if (_e.target.classList.contains("dropDownButton")) return;
			This.taskHolderOpenState = true;
			html.classList.remove("hideTasks");
		}

		html.children[0].onclick = function() {
			This.taskHolderOpenState = !This.taskHolderOpenState;
			let Function = This.taskHolderOpenState ? "remove" : "add";
			html.classList[Function]("hideTasks");
		}

		if (!This.config.title) html.style.marginTop = "0";
		setTextToElement(html.children[1], This.config.title);
		
		_parent.append(html);

		return html;
	}
}







function TaskHolder_task(_parent) {
	const Parent = _parent;
	let TaskHolder = this;
	
	Parent.HTML.todoHolder = Parent.HTML.Self.children[2];
	

	this.taskList = [];
	this.addTaskList = function(_taskList) {
		if (!_taskList) return;
		for (task of _taskList) this.addTask(task);
	}

	this.addTask = function(_task) {
		this.removeTask(_task.id, false);

		let task = new _taskWrapper(_task);
		this.taskList.push(task);
		task.render();

		return task;
	}


	this.reRenderTaskList = function() {
		for (task of this.taskList) task.render();
	}
	

	this.removeTask = function(_id, _animate = false) {
		for (let i = 0; i < this.taskList.length; i++)
		{
			if (this.taskList[i].task.id != _id) continue;
			this.taskList[i].removeHTML(_animate);
			this.taskList.splice(i, 1);
			return true;
		}
		return false;
	}



	this.dropTask = function(_task, _taskIndex) {
		let task = moveTaskToNewLocalPosition(_task, _taskIndex);
		updateTaskToNewTaskHolder(_task);
		this.reRenderTaskList();
	}

	function updateTaskToNewTaskHolder(_task) {
		_task.groupType = Parent.type;
		if (Parent.type == "date") _task.groupValue = Parent.date.toString();
		
		let project = Server.getProject(_task.projectId);
		project.tasks.update(_task);
	}





	this.shouldRenderTask = function(_task) {
		let renderTask = true;

		switch (_task.groupType)
		{
			case "date": 
				if (Parent.type != "date" ||
					!Parent.date.compareDate(new Date().setFromStr(_task.groupValue))
				) renderTask = false;
			break;
			case "default": 
				if (Parent.type != "default") renderTask = false;
			break;
			case "overdue": 
				if (Parent.type != "overdue") renderTask = false;
			break;
		}

		if (MainContent.curProjectId && MainContent.curProjectId != _task.projectId) renderTask = false;
		return renderTask;
	}


	function get(_id) {
		for (task of TaskHolder.taskList) 
		{
			if (task.id == _id) return task;
		}
		return false;
	}


	function moveTaskToNewLocalPosition(_task, _taskIndex) {
		if (typeof _taskIndex != "number") _taskIndex = TaskHolder.taskList.length;

		for (let i = 0; i < TaskHolder.taskList.length; i++)
		{
			if (TaskHolder.taskList[i].id != _task.id) continue;
			let task = TaskHolder.taskList.splice(i, 1)[0];
			TaskHolder.taskList.splice(_taskIndex, 0, task);
			return task;
		}

		let newTask = new _taskWrapper(_task);
		TaskHolder.taskList.splice(_taskIndex, 0, newTask);
		return newTask;
	}









	function _taskWrapper(_task) {
		let This = {
			task: _task,
			html: false,
			taskHolder: Parent,
			render: render,
			removeHTML: removeHTML,

			finish: finish,
			openEdit: openEdit,
			remove: remove
		}


		async function finish() {		
			if (This.task.finished)
			{
				This.html.classList.remove("finished");
				This.task.finished = false;
			} else {
				This.html.classList.add("finished");
				this.task.finished = true;
			}

			let project = Server.getProject(This.task.projectId);
			project.tasks.update(This.task, true);

			//notify the taskHolder
			This.taskHolder.onTaskFinish(This);
		}


		async function remove() {					
			let project = Server.getProject(This.task.projectId);
			await project.tasks.remove(This.task.id);

			//notify the taskHolder
			This.taskHolder.onTaskRemove(This.task.id);
		}


		function openEdit() {
			if (!This.taskHolder.createMenu) return;
			This.taskHolder.createMenu.openEdit(This.html, This.task.id);
		}





		function removeHTML(_animate) {
			let html = This.html;
			if (!html) return false;

			html.classList.add("hide");
			setTimeout(
				function () {
					html.parentNode.removeChild(html);
				}, 
				500 * _animate
			);
		}

		let lastTaskIndex = Infinity;
		
		function render() {
			let taskIndex = getTaskListIndex();
			if (taskIndex == lastTaskIndex) return;
			lastTaskIndex = taskIndex;

			This.removeHTML(false);

			This.html = MainContent.taskPage.renderer.renderTask(
				This, 
				Parent.config.renderPreferences
			);

			if (taskIndex == TaskHolder.taskList.length) return Parent.HTML.todoHolder.append(This.html);

			let insertBeforeElement = Parent.HTML.todoHolder.children[taskIndex];
			Parent.HTML.todoHolder.insertBefore(This.html, insertBeforeElement);
		}

		function getTaskListIndex() {
			for (let i = 0; i < TaskHolder.taskList.length; i++)
			{
				if (TaskHolder.taskList[i].id != This.id) continue;
				return i;
			}
			return TaskHolder.taskList.length;
		}

		return This;
	}
}















function TaskHolder_createMenuConstructor(_config, _type) {
	this.HTML.Self.append(createCreateMenuHTML(this));

	this.createMenu = new TaskHolder_createMenu(this);

	function createCreateMenuHTML(This) {
		let html = document.createElement("div");
		html.className = "taskItem createTaskHolder close";

		html.innerHTML = '<div class="createMenuHolder">' + 
							'<input class="text inputField iBoxy clickable taskTitle">' + 
							'<input class="text inputField iBoxy clickable taskDeadLine" placeholder="Deadline">' + 
							'<div class="leftHand">' + 
								'<div class="text button bDefault bBoxy" style="float: left"></div>' + 
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
							'<div class="smallText">Add Task</div>' + 
						'</div>';

		This.HTML.createMenuHolder 	= html;
		This.HTML.createMenu 		= html.children[0];

		addEventListeners(This);

		return html;
	}

		function addEventListeners(This) {
			This.HTML.createMenuHolder.children[1].onclick 			= function () {This.createMenu.open();}

			This.HTML.createMenu.children[2].children[0].onclick 	= function () {This.createMenu.createTask();}
			This.HTML.createMenu.children[2].children[1].onclick 	= function () {This.createMenu.close();}

			This.HTML.createMenu.children[3].children[0].onclick 	= function () {This.createMenu.openTagSelectMenu()}
			This.HTML.createMenu.children[3].children[1].onclick 	= function () {This.createMenu.openMemberSelectMenu()}
			This.HTML.createMenu.children[3].children[2].onclick 	= function () {This.createMenu.openProjectSelectMenu()}
			
			
			This.HTML.inputField = This.HTML.createMenu.children[0];
			This.HTML.inputField.placeholder = PLACEHOLDERTEXTS.randomItem();


			This.HTML.deadLineField = This.HTML.createMenu.children[1];
			
			This.HTML.deadLineField.onfocusin = function() {
				MainContent.taskHolder.deadLineOptionMenu.open(This.HTML.deadLineField);
			}
			This.HTML.deadLineField.onfocusout = function() {
				This.HTML.createMenu.children[0].focus();
			}
		}
}


function TaskHolder_createMenu(_parent) {
	let Parent = _parent;
	let This = this;

	let editData = {
		task: false,
		html: false
	}


	this.openState = false;
	this.open = function() {
		MainContent.taskHolder.closeAllCreateMenus();
		MainContent.searchOptionMenu.openWithInputField(Parent.HTML.inputField);

		this.openState = true;

		Parent.HTML.createMenuHolder.classList.remove("close");
		Parent.HTML.inputField.focus();
		Parent.HTML.inputField.value 	= null;
		Parent.HTML.deadLineField.value = null;

		let buttonTitle = editData.task ? "Change" : "Add";
		Parent.HTML.createMenu.children[2].children[0].innerHTML = buttonTitle;	

		if (Parent.date) Parent.HTML.deadLineField.value = DateNames.toString(Parent.date);
	}

	this.openEdit = async function(_taskHTML, _taskId) {
		let task = await Server.global.tasks.get(_taskId);
		if (!task || !_taskHTML) return false;

		editData.task = task;
		editData.html = _taskHTML;
		editData.html.classList.add("hide");

		this.open();
	
		Parent.HTML.createMenu.children[0].value = task.title;
		if (task.groupType == "date") Parent.HTML.createMenu.children[1].value = task.groupValue;
	}


	this.close = function() {
		this.openState = false;
		Parent.HTML.createMenuHolder.classList.add("close");
		resetEditMode();
	}


	this.createTask = async function() {
		let task 		= scrapeTaskData();
		let project 	= Server.getProject(task.projectId);

		if (!project) 	return false;
		if (typeof task != "object") return task;
		resetEditMode(true);

		let newTask = await project.tasks.update(task);
		MainContent.taskHolder.renderTask(newTask);
		
		this.close();
		MainContent.searchOptionMenu.close();
		
		return true;
	}

	this.openTagSelectMenu = function() {
		openSelectMenu(0, "#", Server.projectList[0].tags.list);
	}
	this.openMemberSelectMenu = function() {
		openSelectMenu(1, "@", Server.projectList[0].users.getLocalList());
	}	
	this.openProjectSelectMenu = function() {
		openSelectMenu(2, ".", Server.projectList);
	}



	// Setup
	This.close(false);

	// let project = Server.getProject(MainContent.curProjectId);
	// if (!project || !project.users.Self) return;
	// if (!project.users.Self.taskActionAllowed("update")) This.disable();




	function openSelectMenu(_iconIndex = 0, _indicator = ".", _items = []) {
		if (!This.openState) return false;
		let item = Parent.HTML.createMenu.children[3].children[_iconIndex];
		MainContent.searchOptionMenu.openWithList(item, _items, _indicator);
	}




	function resetEditMode(_deleteTaskHTML = false) {
		if (editData.html) editData.html.classList.remove("hide");
		if (editData.html && _deleteTaskHTML) editData.html.parentNode.removeChild(editData.html);
		editData.html = false;
		editData.task = false;
	}




	function scrapeTaskData() {
		let createMenuItems = Parent.HTML.createMenu.children;
		if (!createMenuItems[0]) return false;

		let task = _inputValueToData(createMenuItems[0].value);
		let taskDate = filterDate(createMenuItems[1].value);

		if (!task.title || task.title.split(" ").join("").length < 1) return "E_InvalidTitle";
		
		task.groupType = "default";
		
		if (Parent.type == "date" && !taskDate) taskDate = Parent.date.copy().toString();

		if (taskDate) 
		{
			task.groupType = "date";
			task.groupValue = taskDate;
		}

		return task;
	}

	function _inputValueToData(_value) {
		let task = {
			assignedTo: [],
			id: newId()
		};

		if (editData.task) task = editData.task;

		// add projectId
		let projects = getListByValue(_value, ".");
		task.title 	= projects.value;
		if (projects.list[0]) 
		{
			task.projectId = projects.list[0].id;
		} else if (!editData.task) 
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

	function filterDate(_strDate) {
		let date = DateNames.toDate(_strDate);
		if (date && date.getDateInDays()) return date.toString();
		return false;
	}
}













