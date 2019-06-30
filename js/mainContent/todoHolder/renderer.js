console.warn("mainContent/renderer.js: loaded");


function _TodoRenderer() {
	let This = this;


	this.renderToDo = function(_todo, _displayProjectTitle) {
		if (!_todo) return false;
		let project = Server.getProject(_todo.projectId);
		let tag = project.tags.get(_todo.tagId);

		let todoRenderData = {
			id: _todo.id,
			title: _todo.title,
			dayItemId: _todo.dayItemId,
			finished: _todo.finished,
			memberText: _createMemberTextByUserIdList(_todo.assignedTo, project),
		}

		if (_displayProjectTitle !== false) todoRenderData.projectTitle = project.title;
		if (tag) todoRenderData.tagColour = tag.colour;
		
		return _createTodoHTML(todoRenderData);
	}


		function _createMemberTextByUserIdList(_userIdList, _project) {
			let memberList = [];
			for (id of _userIdList)
			{
				let user = _project.users.get(id);
				if (!user || isPromise(user)) continue;
				memberList.push(user);
			}

			return App.delimitMemberText(memberList, 20);
		}





		function _createTodoHTML(_toDoData) {
			let html = document.createElement("div");
			html.className = "todoItem";
			if (_toDoData.finished) html.classList.add("finished");


			let statusCircleSVG = '<?xml version="1.0" standalone="no"?><svg class="statusCircle clickable" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 83 83" width="83" height="83"><defs><clipPath id="_clipPath_EvyxEBqQoipdaXxIJMEjCjvXV7edc1qw"><rect width="83" height="83"/></clipPath></defs><g clip-path="url(#_clipPath_EvyxEBqQoipdaXxIJMEjCjvXV7edc1qw)"><rect x="0.729" y="42.389" width="43.308" height="20" transform="matrix(0.707,0.707,-0.707,0.707,43.601,-0.482)"/><rect x="16.22" y="30.02" width="70" height="20" transform="matrix(0.707,-0.707,0.707,0.707,-13.296,47.939)"/></g></svg>';
			html.innerHTML = "<div class='statusCircleHitBox'>" + statusCircleSVG + "</div>" + 
							 '<div class="titleHolder userText"></div>' + 
							 '<div class="functionHolder">' +
								'<img src="images/icons/optionIcon.png" onclick="MainContent.optionMenu.open(this, \'' + _toDoData.id + '\')" class="functionItem optionIcon icon clickable">' +
								'<div class="functionItem projectHolder"></div>' +
								'<div class="functionItem memberList userText"></div>' +
							'</div>';


			setTextToElement(html.children[1], _toDoData.title);
			if (_toDoData.memberText) setTextToElement(html.children[2].children[2], _toDoData.memberText);

			if (_toDoData.projectTitle) 
			{
				let projectTitleHolder = html.children[2].children[1]
				let projectTitleHtml =  '<img src="images/icons/projectIconDark.svg" class="functionItem projectIcon">' +
										'<div class="functionItem projectTitle userText"></div>';
				projectTitleHolder.innerHTML = projectTitleHtml;
				setTextToElement(projectTitleHolder.children[1], _toDoData.projectTitle);
			}


			if (_toDoData.tagColour)
			{
				let tagColour = stringToColour(_toDoData.tagColour);
				let colorTarget = html.children[0].children[0]; 
				colorTarget.style.backgroundColor = colourToString(
					mergeColours(
						tagColour,
						{r: 255, g: 255, b: 255, a: 0.1}, 
						.15
					)
				);
				colorTarget.style.borderColor = colourToString(
					mergeColours(
						tagColour,
						{r: 220, g: 220, b: 220}, 
						.2
					)
				);
				colorTarget.style.fill = colourToString(
					mergeColours(
						tagColour,
						{r: 120, g: 120, b: 120}, 
						.2
					)
				);
			}


			return _assignEventHandlers(html, _toDoData);
		}

			function _assignEventHandlers(_html, _toDoData) {
				_html.children[0].onclick = function() {
					let todo = Server.todos.get(_toDoData.id);
					
					if (todo.finished)
					{
						_html.classList.remove("finished");
						todo.finished = false;
					} else {
						_html.classList.add("finished");
						todo.finished = true;
					}

					let project = Server.getProject(todo.projectId);
					project.todos.update(todo, true);
				}

				DoubleClick.register(_html, function() {
					let dayItem = MainContent.menu.Main.todoHolder.dayItem.get(_toDoData.dayItemId);
					if (!dayItem) return;

					dayItem.createMenu.openEdit(this.html, _toDoData.id)
				});

				RightClick.register(_html, function(_event, _html) {
					MainContent.optionMenu.open(_html.children[2].children[0], _toDoData.id, _event);
				});


				return _html;
			}	
}

