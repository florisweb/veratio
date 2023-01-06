




function _MainContent_taskHolder() {
	let HTML = {
		todoHolder: $("#mainContentHolder .todoListHolder")[0],
		taskPage: $(".mainContentPage")[0]
	}
	this.dropRegionId = 'Maincontent.taskHolder.dropRegionId';


	this.dateOptionMenu = function() {
		let Menu = OptionMenu.create({phoneModeLocationSensitive: true});
	
		Menu.removeAllOptions = function() {
			for (let option of Menu.options) this.options[0].remove();
		}

		let menu_open = Menu.open;
		Menu.open = function(_item, _event) {
			menu_open.call(Menu, _item, {left: 10, top: 25}, _event);
			if (_item.tagName != "INPUT") return;
			
			_item.onkeyup = function(_e) {
				menu_open.call(Menu, _item, {left: 0, top: 25});
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
	this.add = function(_type = "default", _renderPreferences = {}, _parameters = [], _taskHolderIndex) {
		if (typeof _taskHolderIndex != "number") _taskHolderIndex = this.list.length;
		let taskHolder = buildTaskHolder(_type, _renderPreferences, _parameters, _taskHolderIndex);
		this.list.splice(_taskHolderIndex, 0, taskHolder);
		return taskHolder;
	}

	const constructors = {
		default: 	TaskHolder_default,
		toPlan: 	TaskHolder_toPlan,
		date: 		TaskHolder_date,
		overdue: 	TaskHolder_overdue
	}

	function buildTaskHolder(_type, _renderPreferences, _parameters, _taskHolderIndex) {
		const config = {
			html: {
				appendTo: HTML.todoHolder
			},
			renderPreferences: _renderPreferences
		}
		
		let parameters = [config, _taskHolderIndex].concat(_parameters);
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




	this.renderTask = async function(_task) {
		for (let taskHolder of this.list) 
		{
			if (!taskHolder.shouldRenderTask(_task)) continue;
			await taskHolder.task.addTask(_task);
			return true;
		}

		switch (_task.groupType)
		{
			case "overdue": await MainContent.taskPage.curTab.addOverdue(); break;
			case "toPlan": 
				if (!MainContent.taskPage.curTab || MainContent.taskPage.curTab.name != "project") return;
				await MainContent.taskPage.projectTab.addToBePlannedTaskHolder(); 
			break;
			default: 
				if (!MainContent.taskPage.curTab || MainContent.taskPage.curTab.name != "project") return;
				await MainContent.taskPage.projectTab.addPlannedTaskHolder(); 
			break;
		}
	}

	this.closeAllCreateMenus = function(_ignorerer) {
		let closedCreateMenu = false;
		for (let taskHolder of this.list)
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
function TaskHolder_default(_config, _taskHolderIndex, _title) {
	let This = this;
	_config.title = _title;
	TaskHolder.call(this, _config, "default", _taskHolderIndex);
	TaskHolder_createMenuConstructor.call(this, _config);
	
	let project = Server.getProject(MainContent.curProjectId)
	if (project && !project.users.self.permissions.tasks.update) This.createMenu.disable();

	this.shouldRenderTask = function(_task) {
		if (this.config.title == "Planned" && _task.groupType != "date") return false;
		if (_task.groupType != "default" && this.config.title != "Planned") return false;
		
		if (MainContent.curProject && MainContent.curProject.id != _task.project.id) return false;

		return true;
	}
}


function TaskHolder_toPlan(_config, _taskHolderIndex) {
	let This = this;
	_config.title = "To Be Planned";

	TaskHolder.call(this, _config, "toPlan", _taskHolderIndex);
	TaskHolder_createMenuConstructor.call(this, _config);
	
	let project = Server.getProject(MainContent.curProjectId);
	if (project && !project.users.self.permissions.tasks.update) This.createMenu.disable();
	

	this.shouldRenderTask = function(_task) {
		if (_task.groupType != "toPlan") return false;		
		return !(MainContent.curProject && MainContent.curProject.id != _task.project.id);
	}

	const updateProjectInfo = () => {SideBar.projectList.updateProjectInfo(true)};
	this.onTaskFinish 	= updateProjectInfo;
	this.onDropTaskFrom = updateProjectInfo;
	this.onDropTaskTo 	= updateProjectInfo;
	this.onTaskRemove 	= updateProjectInfo;
	this.onTaskCreate 	= updateProjectInfo;
}



function TaskHolder_date(_config, _taskHolderIndex, _date) {
	this.date 			= _date;
	_config.title 		= DateNames.toString(_date, false);
	_config.subTitle 	= getSubTitle(_date);

	TaskHolder.call(this, _config, "date", _taskHolderIndex);
	TaskHolder_createMenuConstructor.call(this, _config);

	
	let project = Server.getProject(MainContent.curProjectId);
	if (project && !project.users.self.permissions.tasks.update) This.createMenu.disable();

	this.shouldRenderTask = function(_task) {
		if (_task.groupType != "date") return false;
		if (MainContent.curProject && MainContent.curProject.id != _task.project.id) return false;

		let taskDate = new Date().setDateFromStr(_task.groupValue);
		if (!this.date.compareDate(taskDate)) return false;
		
		return true;
	}

	function getSubTitle(_date) {
		if (_date.getDateInDays(true) - new Date().getDateInDays(true) > 7) return '';
		return '- ' + DateNames.toString(_date, true, false);
	} 
}


function TaskHolder_overdue(_config, _taskHolderIndex) {
	let This = this;
	_config.title 		= "Overdue";
	_config.subTitle 	= "Add all to planner";
	_config.html.class 	= "overdue";
	TaskHolder.call(this, _config, "overdue", _taskHolderIndex);

	this.HTML.subTitle.onclick = function() {
		This.addAllToPlanner();
	}

	this.shouldRenderTask = function(_task) {
		if (_task.groupType != "overdue") return false;
		return !(MainContent.curProject && MainContent.curProject.id != _task.project.id);
	}
	
	this.onTaskFinish = function(_taskWrapper) {
		this.task.removeTask(_taskWrapper.task.id, true);
		this.onTaskRemove();
	}
	this.onDropTaskFrom = function(_taskWrapper) {
		this.onTaskRemove(_taskWrapper.task.id)
	}
	
	this.onTaskRemove = function() {
		if (this.task.taskList.length > 0) return;
		this.remove();
	}

	this.addAllToPlanner = function() {
		let promises = [];
		for (task of this.task.taskList)
		{
			promises.push(task.addToPlanner());
		}
		return Promise.all(promises);
	}
}


































function TaskHolder(_config = {}, _type = "default", _taskHolderIndex) {
	let This = this;
	this.id 			= newId();
	this.config 		= _config;
	this.type 			= _type;

	this.HTML = {
		Parent: _config.html.appendTo,
	}
	this.HTML.Self 	= renderTaskHolder(this.HTML.Parent, _taskHolderIndex);
	
	this.task 		= new TaskHolder_task(this);


	this.remove = function() {
		this.HTML.Self.parentNode.removeChild(this.HTML.Self);
		MainContent.taskHolder.remove(this.id);
	}

	// Custom eventhandlers:
	this.onTaskCreate = function() {console.log('onTaskCreate is not assigned', ...arguments)};
	this.onTaskFinish = function() {console.log('onTaskFinish is not assigned', ...arguments)};
	this.onDropTaskFrom = function() {console.log('onDropTaskFrom is not assigned', ...arguments)};
	this.onDropTaskTo = function() {console.log('onDropTaskTo is not assigned', ...arguments)};
	this.onTaskRemove = function(_taskId) {console.log('onTaskRemove is not assigned', ...arguments)};

	this.taskListExpanded = true;
	this.collapseTaskList = function() {
		this.taskListExpanded = false;
		this.HTML.Self.classList.add("hideTasks");
	}

	this.expandTaskList = function() {
		this.taskListExpanded = true;
		this.HTML.Self.classList.remove("hideTasks");
	}

	function renderTaskHolder(_parent, _taskHolderIndex) {
		let html = document.createElement("div");
		html.className = "taskHolder animateIn";
		setTimeout(function () {html.classList.remove("animateIn");}, 50);

		html.setAttribute("taskHolderId", This.id);

		if (This.config.html.class) html.className += " " + This.config.html.class;

		html.innerHTML = 	'<img src="images/icons/dropDownIconDark.png" class="dropDownButton clickable">' +
							'<div class="header titleHolder"></div>' + 
							'<div class="header subTitleHolder"></div>' + 
							'<div class="todoHolder"></div>';

		This.HTML.title = html.children[1];
		This.HTML.subTitle = html.children[2];

		DragHandler.registerDropRegion(html.children[0], true, MainContent.taskHolder.dropRegionId);
		DragHandler.registerDropRegion(This.HTML.title, true, MainContent.taskHolder.dropRegionId);
		DragHandler.registerDropRegion(This.HTML.subTitle, true, MainContent.taskHolder.dropRegionId);

		html.onclick = function(_e) {
			if (_e.target.classList.contains("dropDownButton")) return;
			This.expandTaskList();
		}

		html.children[0].onclick = function() {
			if (This.taskListExpanded) return This.collapseTaskList();
			This.expandTaskList();
		}

		if (!This.config.title) html.style.marginTop = "-5px";
		setTextToElement(This.HTML.title, This.config.title);
		if (This.config.subTitle) setTextToElement(This.HTML.subTitle, This.config.subTitle);
		
		if (_taskHolderIndex < _parent.children.length)
		{
			let appendBeforeSibling = _parent.children[_taskHolderIndex];
			_parent.insertBefore(html, appendBeforeSibling);
		} else _parent.append(html);
		

		return html;
	}
}







function TaskHolder_task(_parent) {
	const Parent = _parent;
	const TaskHolder = this;
	
	Parent.HTML.todoHolder = Parent.HTML.Self.children[3];
	

	this.taskList = new TaskList();
	this.addTaskList = function(_taskList, _fromCache = false) {
		if (!_taskList) return;
		let promises = [];
		for (let task of _taskList) promises.push(this.addTask(task, _fromCache));
		return Promise.all(promises);
	}

	this.addTask = async function(_task, _fromCache = false) {
		let taskWrapper = this.taskList.add(_task);
		await taskWrapper.render(undefined, _fromCache);
		return taskWrapper;
	}

	this.setTaskList = async function(_newTaskList) {
		this.taskList = new TaskList();
		
		let taskWrappers = [];
		for (let task of _newTaskList) taskWrappers.push(this.taskList.add(task));

		// Parent.HTML.todoHolder.innerHTML = '';
		// let promises = [];
		// for (let taskWrapper of taskWrappers) promises.push(taskWrapper.render(undefined, true));
		// await Promise.all(promises);
		await this.reRenderTaskList();
	}

	this.reRenderTaskList = async function() {
		let promises = [];
		Parent.HTML.todoHolder.innerHTML = '';
		for (let task of this.taskList) promises.push(task.render(undefined));
		return Promise.all(promises);
	}


	this.removeTask = function(_id, _animate = true) {
		for (let i = 0; i < this.taskList.length; i++)
		{
			if (this.taskList[i].task.id != _id) continue;
			this.taskList[i].removeHTML(_animate);
			this.taskList.remove(_id);
			return true;
		}
		return false;
	}



	this.dropTaskTo = async function(_taskWrapper, _taskIndex, _fromTaskHolder) {
		let wrapper = this.taskList.add(_taskWrapper.task, _taskIndex);
		await updateTaskToNewTaskHolder(_taskWrapper.task);
		await this.reRenderTaskList();
		Parent.onDropTaskTo(wrapper, _taskIndex);
	}
	this.dropTaskFrom = async function(_taskWrapper, _taskIndex, _toTaskHolder) {
		if (Parent.id != _toTaskHolder.id) this.taskList.remove(_taskWrapper.task.id);
		Parent.onDropTaskFrom(_taskWrapper, _taskIndex);
	}

	async function updateTaskToNewTaskHolder(_task) {
		_task.groupType = Parent.type;
		if (Parent.config.title == 'Planned') _task.groupType = 'date';
		if (Parent.type == "date") _task.groupValue = Parent.date.toString();		
		
		let inFrontOfId = false;
		for (let i = 0; i < TaskHolder.taskList.length - 1; i++) // - 1 because the last task wouldn't have a task behind it to write as it's inFrontOfId
		{
			if (TaskHolder.taskList[i].task.id != _task.id) continue;
			inFrontOfId = TaskHolder.taskList[i + 1].task.id;
			break;
		}

		return await Promise.all([
			_task.project.tasks.update(_task),
			_task.project.tasks.moveInFrontOf({
				id: _task.id, 
				inFrontOfId: inFrontOfId,
				isPersonal: MainContent.taskPage.curTab.name != 'project'
			})
		]);
	}	




	function TaskList() {
		let list = [];

		list.add = function(_task, _index = this.length) {
			this.remove(_task.id);

			let task = new _taskWrapper(_task);
			this.splice(_index, 0, task);
			return task;
		}
		list.remove = function(_id) {
			for (let i = 0; i < this.length; i++)
			{
				if (this[i].task.id != _id) continue;
				this.splice(i, 1);
				return true;
			}
			return false;
		}
		return list;
	}


	


	








	function _taskWrapper(_task) {
		let This = {
			task: _task,
			html: false,
			taskHolder: Parent,
			

			finish: finish,
			openEdit: openEdit,
			remove: remove,
			addToPlanner: addToPlanner,
			removeFromPlanner: removeFromPlanner,

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
				This.task.finished = true;
			}

			await This.task.project.tasks.update(This.task, true);

			//notify the taskHolder
			This.taskHolder.onTaskFinish(This);
		}


		async function remove() {					
			await This.task.project.tasks.remove(This.task.id);
			This.taskHolder.task.removeTask(This.task.id);

			//notify the taskHolder
			This.taskHolder.onTaskRemove(This.task.id);
		}


		function openEdit() {
			if (!This.taskHolder.createMenu) return;
			This.taskHolder.createMenu.openEdit(This.html, This.task);
		}

		async function addToPlanner() {
			This.task.groupType = "toPlan";
			let result = await This.task.project.tasks.update(This.task);
			if (!result) return;

			SideBar.projectList.updateProjectInfo(true);
			This.taskHolder.task.removeTask(This.task.id);
			This.taskHolder.onTaskRemove(This.task.id);

			MainContent.taskHolder.renderTask(This.task);
		}

		async function removeFromPlanner() {
			This.task.groupType = "default";
			let result = await This.task.project.tasks.update(This.task);
			if (!result) return;

			SideBar.projectList.updateProjectInfo(true);
			This.taskHolder.task.removeTask(This.task.id);
			This.taskHolder.onTaskRemove(This.task.id);
			MainContent.taskHolder.renderTask(This.task);
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
		
		async function render(_insertionIndex, _fromCache = true) {
			This.removeHTML(false);
			This.html = await MainContent.taskPage.renderer.renderTask(
				This, 
				Parent.config.renderPreferences,
				_fromCache
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
							'<input class="text inputField clickable taskTitle">' + 
							'<input class="text inputField clickable taskPlannedDate" placeholder="Planned Date">' + 
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
		This.HTML.memberHolder 		= html.children[0].children[4].children[3];

		DragHandler.registerDropRegion(This.HTML.createMenuHolder, false, MainContent.taskHolder.dropRegionId);

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
		Parent.expandTaskList();
		MainContent.taskHolder.curCreateMenu = this;
		this.openState = true;

		Parent.HTML.inputField.readOnly = false;
		
		MainContent.taskHolder.closeAllCreateMenus(Parent);
		MainContent.searchOptionMenu.openWithInputField(Parent.HTML.inputField);
		
		document.body.classList.add('createTaskMenuOpen');
		Parent.HTML.createMenuHolder.classList.remove("close");
		Parent.HTML.inputField.focus();
		setTimeout(() => {
			let newScrollTop = mainContentHolder.scrollTop + Parent.HTML.inputField.getBoundingClientRect().top - (window.innerHeight - 540); // TODO: 300 is hardcoded, 
			scrollTo(mainContentHolder, newScrollTop, 300);
		}, 1); // for safari on ios

		Parent.HTML.inputField.value 		= null;
		Parent.HTML.plannedDateField.value 	= null;


		this.curTask = new CreateMenu_curTask();
		await this.curTask.setup();
		
		setTaskMenuStatus(this.curTask.editing ? "change" : "add");
		if (Parent.date) Parent.HTML.plannedDateField.value = DateNames.toString(Parent.date);
	}


	this.openEdit = async function(_taskHTML, _task) {
		if (!_task || !_taskHTML) return false;
		MainContent.searchOptionMenu.curProject = _task.project;

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
		document.body.classList.remove('createTaskMenuOpen');
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
		let task = this.curTask.generateTaskData();

		if (!this.curTask.project) return false;
		if (!task || typeof task != "object")
		{
			setTaskMenuStatus();
			if (task) alert(task);
			return;
		}

		let newTask = await this.curTask.project.tasks.update(task);
		
		if ( // User moved an edit-task to another project
			newTask &&
			this.curTask.editing && 
			this.curTask.originalTask.project.id != newTask.project.id
		) await removeOldTask(this.curTask.originalTask);

		resetEditMode(true);
		await MainContent.taskHolder.renderTask(newTask);
		
		this.close();
		MainContent.searchOptionMenu.close();
		try {
			Parent.onTaskCreate(newTask);
		} catch (e) {};

		return true;
	}

	async function removeOldTask(_task) {
		return _task.project.tasks.remove(_task.id);
	}









	this.openTagSelectMenu = function() {
		openSelectMenu(2, tagType);
	}	
	this.openMemberSelectMenu = function() {
		openSelectMenu(1, userType);
	}	
	this.openProjectSelectMenu = function() {
		openSelectMenu(0, projectType);
	}





	async function openSelectMenu(_iconIndex = 0, _type = projectType) {
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
		let tagCircle = MainContent.taskPage.renderer.createTagCircle(_tag);
		tagCircle.classList.remove("clickable");
		Parent.HTML.createMenu.insertBefore(tagCircle, Parent.HTML.createMenu.children[0]);
		Parent.HTML.createMenu.removeChild(Parent.HTML.createMenu.children[1]);
	}


	function setMemberIndicators(_members) {
		Parent.HTML.memberHolder.innerHTML = "";

		for (let member of _members)
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

		this.finished 		= false;

		this.originalTask 	= _task;



		this.setup = async function() {
			This.setTag(false);
			setMemberIndicators([]);

			if (_task && _task.project) 					This.setProject(_task.project);
			if (!This.project && MainContent.curProject) 	This.setProject(MainContent.curProject);
			if (!This.project)								This.setProject((await Server.getProjectList())[0]);

			if (!_task || !This.project) return;
		
			This.finished 					= Boolean(_task.finished);
			This.id 						= _task.id;
			
			if (_task.tagId) 				This.setTag(await This.project.tags.get(_task.tagId, false));
			for (let userId of _task.assignedTo) 	
			{
				This.project.users.get(userId, false).then(function (_user) {
					if (!_user) return;
					This.addAssignee(_user);
				});
			}
		}

		this.setTag = function(_newTag) {
			if (_newTag.isNoOptionItem) _newTag = false;
			this.tag = _newTag;
			setTagIndicator(this.tag);
		}
		
		this.setProject = function(_newProject) {
			this.project = _newProject;
			if (!this.project) return;
			this.project.tags.needsUpdate	= true;
			this.project.users.needsUpdate 	= true;
		}
		
		this.addAssignee = function(_user) {	
			for (let user of this.assignedTo) if (user.id == _user.id) return;

			this.assignedTo.push(_user);
			setMemberIndicators(this.assignedTo);
		}



		this.generateTaskData = function() {
			if (!Parent.HTML.inputField) return false;
			let task = new Task({
				id: 			this.id,
				projectId: 		this.project.id,

				title: 			removeSpacesFromEnds(Parent.HTML.inputField.value),
				tagId: 			this.tag ? this.tag.id : false,
				finished: 		this.finished,
				assignedTo: 	this.assignedTo.map(function (user) {return user.id}),

				groupType: 		Parent.type,
				groupValue: 	'',
				creatorId: 		this.project.users.self.id,
			}, this.project);
			console.log('create task', 'has project:', this.project);

			if (!task.title || task.title.split(" ").join("").length < 1) return "E_InvalidTitle";
			
			let taskDate = filterDate(Parent.HTML.plannedDateField.value);
			if (Parent.type == "date" && !taskDate) taskDate = Parent.date.copy();

			if (taskDate) 
			{
				task.groupType = "date";
				if (taskDate.getDateInDays(true) < new Date().getDateInDays(true)) task.groupType = "overdue";
				task.groupValue = taskDate.toString();
			}

			return task;
		}
	}




	// Setup
	This.close(false);
}





