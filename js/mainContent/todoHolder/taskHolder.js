




function _MainContent_taskHolder() {
	let HTML = {
		todoHolder: $("#mainContentHolder .todoListHolder")[0],
		taskPage: $(".mainContentPage")[0]
	}

	this.dateOptionMenu = function() {
		let Menu = OptionMenu.create(HTML.taskPage, true);
	
		Menu.removeAllOptions = function() {
			for (option of Menu.options) this.options[0].remove();
		}

		let menu_open = Menu.open;
		Menu.open = function(_item, _event) {
			menu_open.call(Menu, _item, {left: 0, top: -20}, _event);
			if (_item.tagName != "INPUT") return;
			
			_item.onkeyup = function(_e) {
				menu_open.call(Menu, _item, {left: 0, top: -20});
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

	this.curCreateMenu = false;






	this.list = [];
	this.add = function(_type = "default", _renderPreferences = {}, _parameters = []) {
		let taskHolder = buildTaskHolder(_type, _renderPreferences, _parameters);
		this.list.push(taskHolder);
		return taskHolder;
	}

	this.addOverdue = async function() {
		let project = await Server.getProject(MainContent.curProjectId);
		let taskList = []; 
		if (project) 
		{
			taskList = await project.tasks.getByGroup({type: "overdue", value: "*"});
		} else {
			let projectList = await Server.global.tasks.getByGroup({type: "overdue", value: "*"});
			for (project of projectList) taskList = taskList.concat(project);
		}
	
		if (!taskList || !taskList.length) return false;

		let item = this.add(
			"overdue", 
			{
				displayProjectTitle: !MainContent.curProjectId
			}
		);

		taskList = TaskSorter.defaultSort(taskList);
		item.task.addTaskList(taskList);
	}


	const constructors = {
		default: 	TaskHolder_default,
		date: 		TaskHolder_date,
		overdue: 	TaskHolder_overdue
	}

	function buildTaskHolder(_type, _renderPreferences, _parameters) {
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
			if (!taskHolder.shouldRenderTask(_task)) continue;
			taskHolder.task.addTask(_task);
			return true;
		}
	}



	this.closeAllCreateMenus = function(_ignorerer) {
		let closedCreateMenu = false;
		for (taskHolder of this.list)
		{
			if (!taskHolder.createMenu) continue;
			if (!taskHolder.createMenu.openState) continue;
			if (taskHolder == _ignorerer) continue;
			taskHolder.createMenu.close();
			closedCreateMenu = true;
		}
		return closedCreateMenu;
	}
}



















































// Types
function TaskHolder_default(_config, _title) {
	let This = this;
	_config.title = _title;
	TaskHolder.call(this, _config, "default");
	TaskHolder_createMenuConstructor.call(this, _config);
	
	let project; 
	Server.getProject(MainContent.curProjectId).then(function (_result) {
		project = _result;
		if (project && !project.users.Self.permissions.tasks.update) This.createMenu.disable();
	});
	


	this.shouldRenderTask = function(_task) {
		if (this.config.title == "Planned" && _task.groupType != "date") return false;
		if (_task.groupType != "default" && this.config.title != "Planned") return false;
		
		if (MainContent.curProjectId && MainContent.curProjectId != _task.projectId) return false;

		return true;
	}
}


function TaskHolder_date(_config, _date) {
	this.date = _date;
	_config.title = DateNames.toString(_date, false);

	TaskHolder.call(this, _config, "date");
	TaskHolder_createMenuConstructor.call(this, _config);

	
	let project; 
	Server.getProject(MainContent.curProjectId).then(function (_result) {
		project = _result;
		if (project && !project.users.Self.permissions.tasks.update) This.createMenu.disable();
	});

	this.shouldRenderTask = function(_task) {
		if (_task.groupType != "date") return false;
		if (MainContent.curProjectId && MainContent.curProjectId != _task.projectId) return false;

		let taskDate = new Date().setDateFromStr(_task.groupValue);
		if (!this.date.compareDate(taskDate)) return false;
		
		return true;
	}
}


function TaskHolder_overdue(_config) {
	_config.title 		= "Overdue";
	_config.html.class 	= "overdue";
	TaskHolder.call(this, _config, "overdue");

	this.shouldRenderTask = function(_task) {
		if (_task.groupType != "overdue") return false;
		if (MainContent.curProjectId && MainContent.curProjectId != _task.projectId) return false;

		return true;
	}
	
	this.onTaskFinish = function(_taskWrapper) {
		this.onTaskRemove(_taskWrapper.task.id)
	}

	this.onTaskRemove = function(_taskId) {
		this.task.removeTask(_taskId);
		if (this.task.taskList.length > 0) return;
		this.remove();
	}
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

	this.onTaskFinish = function(_task) {}

	this.onTaskRemove = function(_taskId) {
		this.task.removeTask(_taskId);
	}


	this.taskHolderOpenState = true;

	function renderTaskHolder(_parent) {
		let html = document.createElement("div");
		html.className = "taskHolder animateIn";
		setTimeout(function () {html.classList.remove("animateIn");}, 50);

		html.setAttribute("taskHolderId", This.id);

		if (This.config.html.class) html.className += " " + This.config.html.class;

		html.innerHTML = 	'<img src="images/icons/dropDownIconDark.png" class="dropDownButton clickable dropTarget">' +
							'<div class="header dateHolder dropTarget"></div>' + 
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
	

	this.removeTask = function(_id, _animate = true) {
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
		_task = updateTaskToNewTaskHolder(_task);
		let task = moveTaskToNewLocalPosition(_task, _taskIndex);
		task.render(_taskIndex);
	}

	async function updateTaskToNewTaskHolder(_task) {
		_task.groupType = Parent.type;
		if (Parent.type == "date") _task.groupValue = Parent.date.toString();
		
		let project = await Server.getProject(_task.projectId);
		project.tasks.update(_task);
		return _task;
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
			TaskHolder.taskList.splice(i, 1);
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
			

			finish: finish,
			openEdit: openEdit,
			remove: remove,

			removeHTML: removeHTML,
			render: render,
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

			let project = await Server.getProject(This.task.projectId);
			project.tasks.update(This.task, true);

			//notify the taskHolder
			This.taskHolder.onTaskFinish(This);
		}


		async function remove() {					
			let project = await Server.getProject(This.task.projectId);
			await project.tasks.remove(This.task.id);

			//notify the taskHolder
			This.taskHolder.onTaskRemove(This.task.id);
		}


		function openEdit() {
			if (!This.taskHolder.createMenu) return;
			This.taskHolder.createMenu.openEdit(This.html, This.task);
		}





		function removeHTML(_animate = true) {
			let html = This.html;
			if (!html) return false;

			html.classList.add("hide");
			setTimeout(
				function () {
					if (!html.parentNode) return;
					html.parentNode.removeChild(html);
				}, 
				500 * _animate
			);
		}
		
		async function render(_insertionIndex) {
			This.removeHTML(false);

			This.html = await MainContent.taskPage.renderer.renderTask(
				This, 
				Parent.config.renderPreferences
			);
			
			if (typeof _insertionIndex != "number" || _insertionIndex == TaskHolder.taskList.length) return Parent.HTML.todoHolder.append(This.html);

			let insertBeforeElement = Parent.HTML.todoHolder.children[_insertionIndex];
			Parent.HTML.todoHolder.insertBefore(This.html, insertBeforeElement);
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
							'<div class="statusCircle"></div>' + 
							'<input class="text inputField iBoxy clickable taskTitle">' + 
							'<input class="text inputField iBoxy clickable taskPlannedDate" placeholder="Planned Date">' + 
							'<div class="leftHand">' + 
								'<div class="text button bDefault bBoxy" style="float: left"></div>' + 
								'<div class="text button" style="float: left">Cancel</div>' + 
							'</div>' +
							'<div class="rightHand">' + 
								'<img src="images/icons/projectIconDark.svg" class="icon projectIcon clickable">' +
								'<img src="images/icons/memberIcon.png" class="icon clickable">' +
								'<img src="images/icons/tagIcon.png" class="icon tagIcon clickable">' +

								'<div class="assigneeHolder"></div>' + 
							'</div>' +
						'</div>' + 
						'<div class="addButtonHolder smallTextHolder clickable" onclick="MainContent.taskHolder.openCreateMenu(this.parentNode)">' + 
							'<a class="smallText smallTextIcon">+</a>' + 
							'<div class="smallText">Task</div>' + 
						'</div>';

		This.HTML.createMenuHolder 	= html;
		This.HTML.createMenu 		= html.children[0];
		This.HTML.tagIndicator 		= html.children[0].children[0];
		This.HTML.memberHolder 		= html.children[0].children[4].children[3];

		addEventListeners(This);

		return html;
	}

		function addEventListeners(This) {
			This.HTML.createMenuHolder.children[1].onclick 			= function () {This.createMenu.open();}

			This.HTML.createMenu.children[3].children[0].onclick 	= function () {This.createMenu.createTask();}
			This.HTML.createMenu.children[3].children[1].onclick 	= function () {This.createMenu.close();}

			This.HTML.createMenu.children[4].children[0].onclick 	= function () {This.createMenu.openProjectSelectMenu()};
			This.HTML.createMenu.children[4].children[1].onclick 	= function () {This.createMenu.openMemberSelectMenu()};
			This.HTML.createMenu.children[4].children[2].onclick 	= function () {This.createMenu.openTagSelectMenu()};
			
			

			
			This.HTML.inputField = This.HTML.createMenu.children[1];
			This.HTML.inputField.placeholder = getRandomItem(PLACEHOLDERTEXTS);


			This.HTML.plannedDateField = This.HTML.createMenu.children[2];
			
		
			This.HTML.plannedDateField.onfocus = This.HTML.plannedDateField.onfocusin = function() {
				MainContent.taskHolder.dateOptionMenu.open(This.HTML.plannedDateField);
			}

			This.HTML.plannedDateField.onblur = This.HTML.plannedDateField.onfocusout = function() {;
				if (!This.createMenu.openState) return;
				This.HTML.inputField.focus();				
				setTimeout(function () {MainContent.taskHolder.dateOptionMenu.close()}, 1);
			}
		}
}


















function TaskHolder_createMenu(_parent) {
	let Parent = _parent;
	let This = this;

	let editData = {
		html: false
	}

	this.id 		= newId();
	this.disabled 	= false;


	this.curTask	= false;
	this.openState 	= false;

	this.open = async function() {
		if (this.disabled) return false;
		MainContent.taskHolder.curCreateMenu = this;
		this.openState = true;


		Parent.HTML.inputField.readOnly = false;
		
		MainContent.taskHolder.closeAllCreateMenus(Parent);
		MainContent.searchOptionMenu.openWithInputField(Parent.HTML.inputField);
		

		Parent.HTML.createMenuHolder.classList.remove("close");
		Parent.HTML.inputField.focus();
		Parent.HTML.inputField.value 		= null;
		Parent.HTML.plannedDateField.value 	= null;


		this.curTask = new CreateMenu_curTask();
		await this.curTask.setup();
		
		setTaskMenuStatus(this.curTask.editing ? "change" : "add");
		if (Parent.date) Parent.HTML.plannedDateField.value = DateNames.toString(Parent.date);
	}


	this.openEdit = async function(_taskHTML, _task) {
		if (!_task || !_taskHTML) return false;
		
		let project = await Server.getProject(_task.projectId);
		MainContent.searchOptionMenu.curProject = project;

		resetEditMode(false);

		editData.html = _taskHTML;
		editData.html.classList.add("hide");


		this.open();
		this.curTask = new CreateMenu_curTask(_task);
		await this.curTask.setup();

		
		Parent.HTML.inputField.value = _task.title;
		if (_task.groupType == "date") Parent.HTML.plannedDateField.value = _task.groupValue;
	}



	this.close = function() {
		this.openState = false;
		Parent.HTML.inputField.readOnly = true;
		Parent.HTML.createMenuHolder.classList.add("close");
		resetEditMode(false);

		if (MainContent.taskHolder.curCreateMenu.id != this.id) return;
		MainContent.taskHolder.curCreateMenu = false;
	}
	






	this.disable = function() {
		this.disabled = true;
		Parent.HTML.createMenuHolder.classList.add("hide");
	}








	function setTaskMenuStatus(_value) {
		Parent.HTML.createMenu.classList.remove("uploading");
		let innerHTML = "Add";
		switch (_value) 
		{
			case "change": innerHTML = "Change"; break;
			case "loading": 
				innerHTML = "<img src='images/loading.gif' class='loadIcon'>"; 
				Parent.HTML.createMenu.classList.add("uploading");
			break;
			default: break;
		}

		Parent.HTML.createMenu.children[3].children[0].innerHTML = innerHTML;	
	}
	












	this.createTask = async function() {
		if (!this.curTask) return;
		
		setTaskMenuStatus("loading");
		let task 		= this.curTask.generateTaskData();

		if (!this.curTask.project) return false;
		if (!task || typeof task != "object")
		{
			setTaskMenuStatus();
			if (task) alert(task);
			return;
		}

		let newTask = await this.curTask.project.tasks.update(task);
		if (editData.task && task.projectId != editData.task.projectId && newTask) removeOldTask(editData.task); // FIX LATER

		resetEditMode(true);
		MainContent.taskHolder.renderTask(newTask);
		
		this.close();
		MainContent.searchOptionMenu.close();
		
		return true;
	}

	async function removeOldTask(_task) {
		let prevProject = await Server.getProject(_task.projectId);
		if (!prevProject) return false;
		return prevProject.tasks.remove(_task.id);
	}









	this.openTagSelectMenu = function() {
		openSelectMenu(2, "#");
	}	
	this.openMemberSelectMenu = function() {
		openSelectMenu(1, "@");
	}	
	this.openProjectSelectMenu = function() {
		openSelectMenu(0, ".");
	}





	async function openSelectMenu(_iconIndex = 0, _type = ".") {
		if (!This.openState) return false;

		let htmlElement = Parent.HTML.createMenu.children[4].children[_iconIndex];
		let items = await MainContent.searchOptionMenu.getItemListByType(_type);
		MainContent.searchOptionMenu.openWithList(htmlElement, items, _type);
	}




	function resetEditMode(_deleteTaskHTML = false) {
		if (editData.html) editData.html.classList.remove("hide");
		if (editData.html && _deleteTaskHTML) editData.html.parentNode.removeChild(editData.html);
		editData.html = false;
	}


	function filterDate(_strDate) {
		let date = DateNames.toDate(_strDate);
		if (date && date.getDateInDays()) return date;
		return false;
	}








	function setTagIndicator(_tag) {
		let tagColor = new Color();
		if (_tag.colour) tagColor = _tag.colour;

		Parent.HTML.tagIndicator.style.backgroundColor	= tagColor.merge(new Color("rgba(255, 255, 255, .1)"), .3).toRGBA();
		Parent.HTML.tagIndicator.style.borderColor 		= tagColor.merge(new Color("#fff"), .5).toRGBA();
	}


	function setMemberIndicators(_members) {
		Parent.HTML.memberHolder.innerHTML = "";

		for (member of _members)
		{
			let html = createMemberIndicatorHTML(member);
			Parent.HTML.memberHolder.appendChild(html);
		}
	}


	function createMemberIndicatorHTML(_member) {
		let html = document.createElement("div");
		html.classList.add("assigneeItem");
		html.classList.add("text");
		if (_member.Self) html.classList.add("isSelf");

		setTextToElement(html, _member.name);

		html.onclick = function() {
			for (let i = 0; i < This.curTask.assignedTo.length; i++)
			{
				if (This.curTask.assignedTo[i].id != _member.id) continue;
				This.curTask.assignedTo.splice(i, 1);
				break;
			}
			setMemberIndicators(This.curTask.assignedTo);
		}

		return html;
	}















	function CreateMenu_curTask(_task) {
		let This 			= this;

		this.editing		= !!_task;

		this.id 			= newId();
		this.tag 			= false;
		this.project 		= false;
		this.assignedTo 	= [];

		this.groupType 		= "default";
		this.groupValue 	= "";
		this.finished 		= false;

		

		this.setTag = function(_newTag) {
			this.tag = _newTag;
			setTagIndicator(this.tag);
		}
		
		this.setProject = function(_newProject) {
			this.project = _newProject;
		}
		
		this.addAssignee = function(_user) {	
			for (user of this.assignedTo) if (user.id == _user.id) return;

			this.assignedTo.push(_user);
			setMemberIndicators(this.assignedTo);
		}



		this.generateTaskData = function() {
			if (!Parent.HTML.inputField) return false;

			let task = {
				id: 			this.id,
				title: 			removeSpacesFromEnds(Parent.HTML.inputField.value),
				tagId: 			this.tag ? this.tag.id : false,
				finished: 		this.finished,
				assignedTo: 	this.assignedTo.map(function (user) {return user.id}),

				groupType: 		"default",
				groupValue: 	this.groupValue,
			}

			if (!task.title || task.title.split(" ").join("").length < 1) return "E_InvalidTitle";
			
			
			let taskDate 	= filterDate(Parent.HTML.plannedDateField.value);
			if (Parent.type == "date" && !taskDate) taskDate = Parent.date.copy();

			if (taskDate) 
			{
				task.groupType = "date";
				if (taskDate.getDateInDays() < new Date().getDateInDays()) task.groupType = "overdue";

				task.groupValue = taskDate.toString();
			}

			return task;
		}





		this.setup = async function() {
			This.setTag(false);
			setMemberIndicators([]);

			if (_task && _task.projectId) 	This.setProject(await Server.getProject(_task.projectId));
			if (!This.project) 				This.setProject(await Server.getProject(MainContent.curProjectId));
			if (!This.project)				This.setProject((await Server.getProjectList())[0]);

			if (!_task) return;
		
			This.finished 					= Boolean(_task.finished);
			This.id 						= _task.id;
			
			if (_task.tagId) 				This.setTag(await This.project.tags.get(_task.tagId));
			for (userId of _task.assignedTo) 	
			{
				This.project.users.get(userId).then(function (_user) {
					if (!_user) return;
					This.addAssignee(_user);
				});
			}
		}
	}




	// Setup
	This.close(false);
}





