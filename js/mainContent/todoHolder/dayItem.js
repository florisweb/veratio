console.warn("mainContent/dayItem.js: loaded");

// preferences:
// 	- customTitle 
// 	- class



function _MainContent_todoHolder_dayItem(_date, _appendTo, _preferences = {}, _todoRenderPreferences = {}) {
	this.date = typeof _date == "string" ? new Date().toString(_date) : _date;
	this.preferences = _preferences;
	this.id = newId();

	let This = this;
	let HTML = {
		Parent: _appendTo,
		Self: null,
	}

	__construct(_date, _todoRenderPreferences);




	function __construct(_date, _todoRenderPreferences) {
		HTML.Self = _renderDayItem(_date);
		HTML.Parent.append(HTML.Self);
		This.createMenu = new _MainContent_todoHolder_dayItem_createMenu(This);
		This.todo		= new _MainContent_todoHolder_dayItem_todo(This, _todoRenderPreferences);

		This.createMenu.close(false);
	}

		function _renderDayItem(_date) {
			let html = document.createElement("div");
			html.className = "dayItem";
			html.setAttribute("date", _date.toString());
			html.setAttribute("dayItemId", This.id);

			html.innerHTML = 	'<div class="header dateHolder"></div>' + 
								'<div class="todoHolder"></div>' + 
								'<div class="todoItem createTodoHolder">' + 
								'</div>';
			
			let dayTitle = __giveDayTitleByDate(_date);
			if (This.preferences.customTitle) dayTitle = This.preferences.customTitle;
			if (This.preferences.class) html.classList.add(This.preferences.class);

			setTextToElement(html.children[0], dayTitle);

			return html;
		}

			function __giveDayTitleByDate(_date) {
				let dayTitle = "";
				let dayDifference = _date.getDateInDays(true) - new Date().getDateInDays(true);
				if (dayDifference == -1) dayTitle = "Yesterday";
				if (dayDifference == 0) dayTitle = "Today";
				if (dayDifference == 1) dayTitle = "Tomorrow";

				if (!dayTitle) dayTitle = _date.getDayName();
				let monthName = _date.getMonths()[_date.getMonth()].name;
				dayTitle += " - " + _date.getDate() + " " + monthName;

				if (_date.getFullYear() != new Date().getFullYear()) dayTitle += " " + _date.getFullYear();

				return dayTitle;
			}


	
	this.remove = function() {

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
			console.log("edit", todo.projectId);

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
			console.warn(todo);
			let project 	= Server.getProject(todo.projectId);
			if (!project) 	return false;
			if (typeof todo != "object") return todo;

			resetEditMode(true);

			project.todos.update(todo);
			this.close();
			MainContent.searchOptionMenu.close();

			todo = Server.todos.get(todo.id);
			Parent.todo.renderTodo(todo);

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

			let todo = MainContent.menu.Main.todoHolder.renderer.renderToDo(_todo, RenderPreferences.displayProjectTitle);

			HTML.todoHolder.insertBefore(
				todo, 
				todos[parseInt(_location)]
			);
		}

	}
}