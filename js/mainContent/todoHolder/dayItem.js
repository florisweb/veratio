/* preferences:

// 	- class
	- title
*/


var _MainContent_todoHolder_dayItem_overdue;

function _MainContent_todoHolder_dayItem(_appendTo, _preferences = {}, _todoRenderPreferences = {}) {
	this.date = typeof _preferences.date == "string" ? new Date().toString(_preferences.date) : _preferences.date;
	this.preferences = _preferences;
	
	this.id = newId();

	let This = this;
	let HTML = {
		Parent: _appendTo,
		Self: null,
	}



	this.remove = function() {
		HTML.Self.parentNode.removeChild(HTML.Self);
		MainContent.menu["Main"].todoHolder.dayItem.remove(this.id);
	}




	this.onTaskFinish = function(_task) {
		console.warn("FINISH", _task);
	}

	this.onTaskRemove = function(_taskId) {
		console.warn("REMOVE", _taskId);
	}


	__construct(_todoRenderPreferences);

	function __construct(_todoRenderPreferences) {
		HTML.Self = _renderDayItem();
		HTML.Parent.append(HTML.Self);
		This.createMenu = new _MainContent_todoHolder_dayItem_createMenu(This);
		This.todo		= new _MainContent_todoHolder_dayItem_todo(This, _todoRenderPreferences);

		This.createMenu.close(false);
	}

		function _renderDayItem() {
			let html = document.createElement("div");
			html.className = "dayItem";
			if (This.preferences.class) html.classList.add(This.preferences.class);

			html.setAttribute("dayItemId", This.id);
			if (This.date) html.setAttribute("date", This.date.toString());


			html.innerHTML = 	'<div class="header dateHolder"></div>' + 
								'<div class="todoHolder"></div>' + 
								'<div class="todoItem createTodoHolder">' + 
								'</div>';

			let dayTitle = "";
			if (This.date) 				dayTitle = dateToDisplayText(This.date);
			if (This.preferences.title) dayTitle = This.preferences.title;

			setTextToElement(html.children[0], dayTitle);

			return html;
		}




	function _MainContent_todoHolder_dayItem_createMenu(_parent) {
		HTML.menuHolder = HTML.Self.children[2];
		let Parent = _parent;
		let This = this;

		let placeholderOptions = [
			'Read some books...',
			'Clean your room...',
			'Finish your project...',
			'Be a social person for once...',
			'Call an old friend...',
			'Add a todo...',
			'Make some homework...'
		];



		this.disabled = false;
		this.disable = function() {
			this.disabled = true;
			this.close();
			HTML.menuHolder.innerHTML = "";
		}


		this.openState = false;
		this.open = function(_editing = false) {
			if (this.disabled) return false;
			MainContent.menu.Main.todoHolder.dayItem.closeAllCreateMenus();

			this.openState = true;
			_addCreateMenuHtml(HTML.menuHolder, _editing);
			MainContent.searchOptionMenu.open(HTML.menuHolder.children[0].children[0]);
		}

		let edit_todo = null;
		let edit_todoHTML = null;
		this.openEdit = function(_todoHTML, _todoId) {
			if (this.disabled) return false;

			let todo = Server.todos.get(_todoId);
			if (!todo || !_todoHTML) return false;
			this.open(true);

			edit_todo = todo;
			edit_todoHTML = _todoHTML;
			edit_todoHTML.classList.add("hide");
			
			HTML.menuHolder.children[0].children[0].value = todo.title;
		}



		this.close = function(_animate) {
			this.openState = false;
			_addButtonHtml(HTML.menuHolder, _animate);
			resetEditMode();
		}

		function resetEditMode(_deleteTodo = false) {
			if (edit_todoHTML) edit_todoHTML.classList.remove("hide");
			if (edit_todoHTML && _deleteTodo) edit_todoHTML.parentNode.removeChild(edit_todoHTML);
			edit_todoHTML = null;
			edit_todo = "";
		}


			function _addCreateMenuHtml(_parent, _editing = false) {
				let newInnerHTML = '<div class="createMenuHolder hide">' + 
										'<input class="text inputField iBoxy clickable" placeholder="Read some books...">' + 
										'<div class="leftHand">' + 
											'<div class="text button bDefault bBoxy" style="float: left">Create</div>' + 
											'<div class="text button" style="float: left">Cancel</div>' + 
										'</div>' +
										'<div class="rightHand">Tags' + 
										'</div>' +
									'</div>';
				
				_parent.innerHTML = newInnerHTML;
				let createMenu = _parent.children[0];

				if (_editing) createMenu.children[1].children[0].innerHTML = "Change";
				createMenu.children[1].children[0].onclick = function () {Parent.createMenu.createTodo();}
				createMenu.children[1].children[1].onclick = function () {Parent.createMenu.close();}


				let placeholderText = placeholderOptions[Math.floor(Math.random() * placeholderOptions.length)];
				createMenu.children[0].placeholder = placeholderText;
				createMenu.children[0].focus();
				createMenu.classList.remove("hide");
			}


			function _addButtonHtml(_parent, _animate = true) {
				let id = newId();
				let newInnerHTML = '<div class="addButtonHolder smallTextHolder clickable" onclick="MainContent.dayItem.openCreateMenu(this.parentNode)">' + 
										'<a class="smallText smallTextIcon">+</a>' + 
										'<div class="smallText">Create Todo</div>' + 
									'</div>';
				_parent.innerHTML = newInnerHTML;
				let createMenuButton = _parent.children[0];

				createMenuButton.onclick = function () {Parent.createMenu.open();}

				if (!_animate) return false;
				createMenuButton.classList.add("hide");
				createMenuButton.setAttribute("id", "addButtonHolder" + id);

				
				setTimeout(function () {
					if (!$('#addButtonHolder' + id)[0]) return;
					$('#addButtonHolder' + id)[0].classList.remove('hide');
				}, 1);
			}





		this.constructor.prototype.createTodo = function() {
			let todo 		= _scrapeTodoData();

			let project 	= Server.getProject(todo.projectId);
			if (!project) 	return false;
			if (typeof todo != "object") return todo;

			resetEditMode(true);

			todo = project.todos.update(todo);
			Parent.todo.renderTodo(todo, Parent);
			
			this.close();
			MainContent.searchOptionMenu.close();

			return true;
		}


			function _scrapeTodoData() {
				let createMenuItems = HTML.menuHolder.children[0].children;
				if (!createMenuItems[0]) return false;

				let task = __inputValueToData(createMenuItems[0].value);

				if (!task.title || task.title.split(" ").join("").length < 1) return "E_InvalidTitle";
				
				task.groupType = "date";
				task.groupValue = Parent.date.copy();
				if (!task.groupValue) return "E_InvalidDate";

				return task;
			}
				function __inputValueToData(_value) {
					let todo = {};
					
					let project 	= Server.getProject(MainContent.menu.Main.page.curProjectId);
					todo.projectId 	= project ? project.id : Server.projectList[0].id;
					
					if (edit_todo) todo = edit_todo;
					

					todo.title 	= _value;
					let tag 	= ___findTagInValue(_value, todo.projectId);
					if (tag) 
					{
						todo.tagId = tag.id;
						todo.title = tag.value;
					}

					let members 	= ___findMembersInValue(todo.title, todo.projectId);
					todo.title 		= members.value;
					todo.assignedTo = members.memberList;
					

					todo.title 	= removeSpacesFromEnds(todo.title);
					return todo;
				}
					function ___findTagInValue(_value, _projectId) {
						let project = Server.getProject(_projectId);
						let tags = project.tags.list;

						for (let i = 0; i < tags.length; i++)
						{
							let parts = _value.split("#" + tags[i].title);
							if (parts.length <= 1) continue;
							return {id: tags[i].id, value: parts.join("")}
						}
					}

					function ___findMembersInValue(_value, _projectId) {
						let project = Server.getProject(_projectId);
						let members = project.users.getList();;
						let memberList = [];

						for (let i = 0; i < members.length; i++)
						{
							let parts = _value.split("@" + members[i].name);
							if (parts.length <= 1) continue;
							memberList.push(members[i].id);
							_value = parts.join("");
						}
						return {memberList: memberList, value: _value};
					}
	}




	function _MainContent_todoHolder_dayItem_todo(_Parent, _renderPreferences) {
		let Parent = _Parent;
		HTML.todoHolder = HTML.Self.children[1];
		let RenderPreferences = _renderPreferences;


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

		this.renderTodo = function(_todo, _location) {
			let todos = HTML.todoHolder.children;
			if (typeof _location != "number") _location = todos.length;
			_todo.dayItemId = Parent.id;

			let todo = MainContent.menu["Main"].todoHolder.renderer.renderToDo(_todo, Parent, RenderPreferences.displayProjectTitle);

			HTML.todoHolder.insertBefore(
				todo, 
				todos[parseInt(_location)]
			);
		}
	}


















	_MainContent_todoHolder_dayItem_overdue = function(_appendTo, _preferences = {}, _todoRenderPreferences = {}) {
		(function(_this) {
			_preferences.class = "overdue";
			_preferences.title = "Overdue";

			let extender = new _MainContent_todoHolder_dayItem(_appendTo, _preferences, _todoRenderPreferences);
			for (n of Object.keys(extender))
			{
				_this[n] = extender[n];
			}

			_this.createMenu.disable();
		})(this);
	}
}












// types
// 	day - default
// 	overdue
//	list


function _MainContent_dayItem() {
	let HTML = {
		todoHolder: $("#mainContentHolder .todoListHolder")[0],
	}
	this.list = [];

	this.add = function(_preferences = {}, _todoRenderPreferences = {}, _type = "day") {
		let constructor;
		switch (_type)
		{
			case "overdue": 	constructor =  _MainContent_todoHolder_dayItem_overdue; 	break;
			default: 			constructor =  _MainContent_todoHolder_dayItem;			 	break;
		}

		let dayItem = new constructor(
			HTML.todoHolder,
			_preferences,
			_todoRenderPreferences
		);

		this.list.push(dayItem);

		return dayItem;
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


	this.createTodo = function() {
		for (let i = 0; i < this.list.length; i++)
		{
			if (!this.list[i].createMenu.openState) continue;
			this.list[i].createMenu.createTodo();
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
















