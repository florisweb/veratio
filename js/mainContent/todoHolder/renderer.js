
function _TaskRenderer() {
	let This = this;

	this.settings = new _TaskRenderer_settings();


	this.renderTask = function(_task, _taskHolder, _renderSettings) {
		if (!_task) return false;
		let project = Server.getProject(_task.projectId);
		if (!project) return false;

		let tag 	= false; //project.tags.get(_task.tagId);
		
		let todoRenderData = {
			id: 			_task.id,
			title: 			_task.title,
			taskHolderId: 	_taskHolder.id,
			finished: 		_task.finished,
			
			assignedToMe: 	_task.assignedTo.includes(project.users.Self.id),
			isMyTask: 		_task.creatorId == project.users.Self.id,

			memberText: 	_createMemberTextByUserIdList(_task.assignedTo, project),
		}
		if ((_task.groupType == "date" || _task.groupType == "overdue") && _renderSettings.displayDate !== false)
		{
			if (new Date().stringIsDate(_task.groupValue))
			{
				todoRenderData.deadLineText = DateNames.toString(
					new Date().setDateFromStr(_task.groupValue),
					true
				);
			}
		} 

		if (_renderSettings.displayProjectTitle !== false) todoRenderData.projectTitle = project.title;
		if (tag) todoRenderData.tagColour = tag.colour;
		
		let html = createTaskHTML(todoRenderData, _taskHolder);

		setDOMData(html, _task, _taskHolder);
		return html;
	}



		function setDOMData(_element, _task, _taskHolder) {
			let data = new taskConstructor(_element, _task, _taskHolder);

			DOMData.set(_element, data);
		}





		function _createMemberTextByUserIdList(_userIdList, _project) {
			if (!_project || !_userIdList || !_userIdList.length) return "";

			let projectUsers = _project.users.getLocalList();

			let memberList = [];
			for (id of _userIdList)
			{
				for (projectUser of projectUsers)
				{
					if (projectUser.id != id) continue;
					memberList.push(projectUser);
				}				
			}

			return App.delimitMemberText(memberList, 20);
		}





		function createTaskHTML(_toDoData, _taskHolder) {
			let html = document.createElement("div");
			html.className = "listItem taskItem dropTarget";
			if (_toDoData.finished) html.classList.add("finished");
			if (_toDoData.assignedToMe) html.classList.add("isSelf");
			if (_toDoData.isMyTask) html.classList.add("isMyTask");


			const statusCircleSVG = '<?xml version="1.0" standalone="no"?><svg class="statusCircle clickable" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 83 83" width="83" height="83"><defs><clipPath id="_clipPath_EvyxEBqQoipdaXxIJMEjCjvXV7edc1qw"><rect width="83" height="83"/></clipPath></defs><g clip-path="url(#_clipPath_EvyxEBqQoipdaXxIJMEjCjvXV7edc1qw)"><rect x="0.729" y="42.389" width="43.308" height="20" transform="matrix(0.707,0.707,-0.707,0.707,43.601,-0.482)"/><rect x="16.22" y="30.02" width="70" height="20" transform="matrix(0.707,-0.707,0.707,0.707,-13.296,47.939)"/></g></svg>';
			html.innerHTML = 	"<div class='isMyTaskIndicator'></div>" + 
								"<div class='statusCircleHitBox'>" + statusCircleSVG + "</div>" + 
								'<div class="titleHolder text userText"></div>' + 
							 	'<div class="functionHolder">' +
									'<img src="images/icons/optionIcon.png" onclick="MainContent.optionMenu.open(this)" class="functionItem optionIcon icon clickable">' +
									'<div class="functionItem projectHolder"></div>' +
									'<div class="functionItem deadLineHolder userText"></div>' +
									'<div class="functionItem memberList userText"></div>' +
								'</div>';


			setTextToElement(html.children[2], _toDoData.title);
			if (_toDoData.memberText) setTextToElement(html.children[3].children[3], _toDoData.memberText);
			if (_toDoData.deadLineText) setTextToElement(html.children[3].children[2], _toDoData.deadLineText);
			if (_toDoData.projectTitle) 
			{
				let projectTitleHolder = html.children[3].children[1];
				let projectTitleHtml =  '<img src="images/icons/projectIconDark.svg" class="functionItem projectIcon">' +
										'<div class="functionItem projectTitle userText"></div>';
				projectTitleHolder.innerHTML = projectTitleHtml;
				setTextToElement(projectTitleHolder.children[1], _toDoData.projectTitle);
			}


			if (_toDoData.tagColour)
			{
				let tagColour = stringToColour(_toDoData.tagColour);
				let colorTarget = html.children[1].children[0]; 
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
						{r: 130, g: 130, b: 130}, 
						.2
					)
				);
			}


			return assignEventHandlers(html, _toDoData, _taskHolder);
		}

			function assignEventHandlers(_html, _taskData, _taskHolder) {

				let lastDropTarget = false;
				DragHandler.register(
					_html, 
					function (_item, _dropTarget) {
						if (!_dropTarget) return;
						clearLastDropTarget();

						if (getChildIndex(_dropTarget) == 0 && getAboveStatus(_item, _dropTarget))
						{
							_dropTarget.style.marginTop 		= _dropTarget.offsetHeight + "px";
						} else _dropTarget.style.marginBottom 	= _dropTarget.offsetHeight + "px";

						lastDropTarget = _dropTarget;
					}, 
					async function (_item) {						
						clearLastDropTarget();

						let dropData = getDropData(_item);
						if (!dropData) return;
						let dropCoords = {
							x: dropData.x, 
							y: dropData.y
						}

						let task = await Server.global.tasks.get(_taskData.id);
						dropData.taskHolder.task.dropTask(task, dropData.index);

						if (dropData.taskHolder.id == _taskData.taskHolderId) return dropCoords;
						let prevTaskHolder = MainContent.taskPage.taskHolder.get(_taskData.taskHolderId);
						prevTaskHolder.task.removeTask(_taskData.id);

						return dropCoords;
					}
				);



				function clearLastDropTarget() {
					if (!lastDropTarget) return;
					lastDropTarget.style.marginTop	 	= "";
					lastDropTarget.style.marginBottom 	= "";
				}

				function getAboveStatus(_item, _dropTarget) {
					let dropTargetHeight 	= _dropTarget.offsetHeight;
					let dropTargetY 		= _dropTarget.getBoundingClientRect().top;
					return dropTargetY - _item.y > 0;
				}




				function getDropData(_item) {
					if (!lastDropTarget) return false;
					let data = {
						index: getDropIndex(_item),
					}

					let taskHolderId = lastDropTarget.parentNode.parentNode.getAttribute("taskHolderId");
					data.taskHolder  = MainContent.taskPage.taskHolder.get(taskHolderId);
					
					if (!data.taskHolder) return false;
					let positionObj = data.taskHolder.HTML.todoHolder;
					const taskHeight = positionObj.children[0].offsetHeight;
					
					let pos = positionObj.getBoundingClientRect();
					data.x = pos.left;
					data.y = pos.top + taskHeight * data.index;
					
					if (data.index === 0) data.y -= taskHeight - 10;
					
					return data;
				}


					function getDropIndex(_item) {
						let index = false;	

						let siblings = lastDropTarget.parentNode.children;
						let dragItemI = Infinity;

						for (let i = 0; i < siblings.length; i++)
						{
							if (siblings[i] == _item.html) dragItemI = i;
							if (siblings[i] != lastDropTarget) continue;
							index = i + 1 - (dragItemI < i) - getAboveStatus(_item, lastDropTarget);
						}

						return index;
					}









				_html.children[1].onclick = async function() {
					let data 	= DOMData.get(_html);
					let project = Server.getProject(data.projectId);
					let task 	= await project.tasks.get(data.taskId);
					
					// if (!project.users.Self.taskActionAllowed("finish", task)) return false;
					
					data.finish();
				}

				DoubleClick.register(_html, async function() {
					let data 	= DOMData.get(_html);
					let project = Server.getProject(data.projectId);
					let task 	= await project.tasks.get(data.taskId);
					
					// if (!project.users.Self.taskActionAllowed("update", task)) return false;
					data.openEdit();
				});

				RightClick.register(_html, function(_event, _html) {
					MainContent.optionMenu.open(_html.children[2].children[0], _event);
				});


				return _html;
			}	
}










function taskConstructor(_element, _task, _taskHolder) {
	this.task 			= _task;
	this.projectId 		= _task.projectId;
	this.html 			= _element;

	this.taskHolder = _taskHolder;


	this.finish = async function() {
		let task = await Server.global.tasks.get(this.task.id);
		
		if (task.finished)
		{
			this.html.classList.remove("finished");
			task.finished = false;
		} else {
			this.html.classList.add("finished");
			task.finished = true;
		}

		let project = Server.getProject(this.projectId);
		project.tasks.update(task, true);

		//notify the taskHolder
		this.taskHolder.onTaskFinish(task);
	}


	this.remove = function() {					
		let project = Server.getProject(this.projectId);
		project.tasks.remove(this.task.id);

		//notify the taskHolder
		this.taskHolder.onTaskRemove(this.task.id);
	}


	this.openEdit = function() {
		if (!this.taskHolder.createMenu) return;
		this.taskHolder.createMenu.openEdit(this.html, this.task.id);
	}

}