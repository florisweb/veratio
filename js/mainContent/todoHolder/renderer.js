
function _TaskRenderer() {
	let This = this;


	this.renderTask = function(_taskWrapper, _renderSettings) {
		if (!_taskWrapper) return false;
		let project = Server.getProject(_taskWrapper.task.projectId);
		if (!project) return false;

		let tag 	= false; //project.tags.get(_task.tagId);
		
		let todoRenderData = {
			project: 		project,
			
			id: 			_taskWrapper.task.id,
			title: 			_taskWrapper.task.title,
			taskHolder: 	_taskWrapper.taskHolder,
			finished: 		_taskWrapper.task.finished,
			
			assignedToMe: 	_taskWrapper.task.assignedTo.includes(project.users.Self.id),
			taskOwner: 		project.users.getLocal(_taskWrapper.task.creatorId),

			memberText: 	_createMemberTextByUserIdList(_taskWrapper.task.assignedTo, project),
		}
		
		if (
			(_taskWrapper.task.groupType == "date" || _taskWrapper.task.groupType == "overdue") && 
			_renderSettings.displayDate !== false &&
			new Date().stringIsDate(_taskWrapper.task.groupValue)
		) {
			todoRenderData.plannedDateText = DateNames.toString(
				new Date().setDateFromStr(_taskWrapper.task.groupValue),
				true
			);
		} 

		if (_renderSettings.displayProjectTitle !== false) todoRenderData.projectTitle = project.title;
		if (tag) todoRenderData.tagColour = tag.colour;
		
		let html = createTaskHTML(todoRenderData);

		DOMData.set(html, _taskWrapper);

		return html;
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





		function createTaskHTML(_toDoData) {
			let html = document.createElement("div");
			html.className = "listItem taskItem dropTarget";
			if (_toDoData.finished) html.classList.add("finished");
			if (_toDoData.assignedToMe) html.classList.add("isSelf");
			


			const statusCircleSVG = '<?xml version="1.0" standalone="no"?><svg class="statusCircle clickable" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 83 83" width="83" height="83"><defs><clipPath id="_clipPath_EvyxEBqQoipdaXxIJMEjCjvXV7edc1qw"><rect width="83" height="83"/></clipPath></defs><g clip-path="url(#_clipPath_EvyxEBqQoipdaXxIJMEjCjvXV7edc1qw)"><rect x="0.729" y="42.389" width="43.308" height="20" transform="matrix(0.707,0.707,-0.707,0.707,43.601,-0.482)"/><rect x="16.22" y="30.02" width="70" height="20" transform="matrix(0.707,-0.707,0.707,0.707,-13.296,47.939)"/></g></svg>';
			html.innerHTML = 	"<div class='taskOwnerIndicator'></div>" + 
								"<div class='statusCircleHitBox'>" + statusCircleSVG + "</div>" + 
								'<div class="titleHolder text userText"></div>' + 
							 	'<div class="functionHolder">' +
									'<img src="images/icons/optionIcon.png" onclick="MainContent.optionMenu.open(this)" class="functionItem optionIcon icon clickable">' +
									'<div class="functionItem projectHolder"></div>' +
									'<div class="functionItem plannedDateHolder userText"></div>' +
									'<div class="functionItem memberList userText"></div>' +
								'</div>';

			setOwnerIndicator(_toDoData, html);

			setTextToElement(html.children[2], _toDoData.title);
			if (_toDoData.memberText) setTextToElement(html.children[3].children[3], _toDoData.memberText);
			if (_toDoData.plannedDateText) setTextToElement(html.children[3].children[2], _toDoData.plannedDateText);
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


			return assignEventHandlers(html, _toDoData);
		}

			function setOwnerIndicator(_taskData, _html) {
				if (_taskData.taskOwner || _taskData.taskOwner.id == _taskData.project.users.Self.id) return;
				_html.classList.add("isMyTask");
				let ownerIndicator = _html.children[0];

				let onIndicator = false;

				ownerIndicator.onmouseleave = function() {
					onIndicator = false;
					MainContent.userIndicatorMenu.close();
				}
				ownerIndicator.onmouseenter = function(_event) {
					onIndicator = true;	
					setTimeout(function () {
						if (!onIndicator) return;
						MainContent.userIndicatorMenu.open(_taskData.taskOwner, ownerIndicator, _event);
					}, 500);
				}
			}


			function assignEventHandlers(_html, _taskData) {
				
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

						_item.html.classList.add("hide");
						_taskData.taskHolder.onTaskRemove(_taskData.id); // remove the task from the old location

						let task = await Server.global.tasks.get(_taskData.id);				
						dropData.taskHolder.task.dropTask(task, dropData.index);

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
					data.taskHolder  = MainContent.taskHolder.get(taskHolderId);
					
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
					data.finish();
				}

				DoubleClick.register(_html, async function() {
					let data 	= DOMData.get(_html);
					data.openEdit();
				});

				RightClick.register(_html, function(_event, _html) {
					MainContent.optionMenu.open(_html.children[2].children[0], _event);
				});


				return _html;
			}	
}









