
function _TaskRenderer() {
	let This = this;
	let HTML = {
		scrollHolder: $(".mainContentPage")[0]
	}


	this.renderTask = function(_taskWrapper, _renderSettings) {
		if (!_taskWrapper) return false;
		let project = Server.getProject(_taskWrapper.task.projectId);
		if (!project) return false;

		
		
		let todoRenderData = {
			project: 		project,

			assignedToMe: 	_taskWrapper.task.assignedTo.includes(project.users.Self.id),
			taskOwner: 		project.users.getLocal(_taskWrapper.task.creatorId),

			memberText: 	_createMemberTextByUserIdList(_taskWrapper.task.assignedTo, project),
		}
		
		if (
			(_taskWrapper.task.groupType == "date" || _taskWrapper.task.groupType == "overdue") && 
			_renderSettings.displayDate !== false &&
			new Date().stringIsDate(_taskWrapper.task.groupValue)
		) {
			let date = new Date().setDateFromStr(_taskWrapper.task.groupValue);
			todoRenderData.plannedDateText = DateNames.toString(
				date,
				true
			);

			let dateIndex = date.getDateInDays(true);
			let todayIndex =  new Date().getDateInDays(true);


			if (dateIndex > todayIndex + 1 && dateIndex <= todayIndex + 7) 	todoRenderData.plannedDateClass = "thisWeek";
			if (dateIndex == todayIndex + 1) 								todoRenderData.plannedDateClass = "tomorrow";
			if (dateIndex == todayIndex) 									todoRenderData.plannedDateClass = "today";
		} 

		if (_renderSettings.displayProjectTitle !== false) todoRenderData.projectTitle = project.title;
		
		let tag = project.tags.getLocal(_taskWrapper.task.tagId);
		if (tag) todoRenderData.tagColour = tag.colour;
		
		let html = createTaskHTML(todoRenderData, _taskWrapper);

		DOMData.set(html, _taskWrapper);

		return html;
	}







		function _createMemberTextByUserIdList(_userIdList, _project) {
			if (!_project || !_userIdList || !_userIdList.length) return "";

			let users = _project.users.getLocalList();

			let memberList = [];
			for (id of _userIdList)
			{
				for (user of users)
				{
					if (user.id != id) continue;
					memberList.push(user);
				}
			}

			return App.delimitMemberText(memberList, 20);
		}





		function createTaskHTML(_renderData, _taskWrapper) {
			let html = document.createElement("div");
			html.className = "listItem taskItem dropTarget";
			
			if (_taskWrapper.task.finished) html.classList.add("finished");
			if (_renderData.assignedToMe) html.classList.add("isSelf");
			

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

			setOwnerIndicator(_renderData, html);
			if (_renderData.tagColour) 			setTagColour(html, _renderData);

			setTextToElement(html.children[2], _taskWrapper.task.title);
			if (_renderData.memberText) 		setTextToElement(html.children[3].children[3], _renderData.memberText);
			
			if (_renderData.plannedDateText) 	setTextToElement(html.children[3].children[2], _renderData.plannedDateText);
			if (_renderData.plannedDateClass) html.children[3].children[2].classList.add(_renderData.plannedDateClass);

			if (_renderData.projectTitle) 
			{
				let projectTitleHolder = html.children[3].children[1];
				let projectTitleHtml =  '<img src="images/icons/projectIconDark.svg" class="functionItem projectIcon">' +
										'<div class="functionItem projectTitle userText"></div>';
				projectTitleHolder.innerHTML = projectTitleHtml;
				setTextToElement(projectTitleHolder.children[1], _renderData.projectTitle);
			}


			return assignEventHandlers(html, _taskWrapper);
		}


			function setTagColour(_html, _renderData) {
				let tagColour = stringToColour(_renderData.tagColour);
				let colorTarget = _html.children[1].children[0]; 
				colorTarget.style.backgroundColor = colourToString(
					mergeColours(
						tagColour,
						{r: 255, g: 255, b: 255, a: 0.1}, 
						.3
					)
				);
				
				colorTarget.style.borderColor = colourToString(
					mergeColours(
						tagColour,
						{r: 220, g: 220, b: 220}, 
						.5
					)
				);

				colorTarget.style.fill = colourToString(
					mergeColours(
						tagColour,
						{r: 130, g: 130, b: 130}, 
						.5
					)
				);


				_html.children[2].style.color = colourToString(
					mergeColours(
						tagColour,
						{r: 150, g: 150, b: 150}, 
						.2
					)
				);
			}


			function setOwnerIndicator(_taskData, _html) {
				if (!_taskData.taskOwner || _taskData.taskOwner.id == _taskData.project.users.Self.id) return;

				_html.classList.add("isNotMyTask");
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






			function assignEventHandlers(_html, _taskWrapper) {
				let project = Server.getProject(_taskWrapper.task.projectId);

				_html.children[1].onclick = async function() {
					if (!project.users.Self.permissions.tasks.finish(_taskWrapper.task)) return false;
					_taskWrapper.finish();
				}

				DoubleClick.register(_html, async function() {
					if (!project.users.Self.permissions.tasks.update) return false;
					_taskWrapper.openEdit();
				});

				RightClick.register(_html, function(_event, _html) {
					MainContent.optionMenu.open(_html.children[2].children[0], _event);
				});


				return assignDragHandler(_html, _taskWrapper);
			}


			function assignDragHandler(_html, _taskWrapper) {
				let project = Server.getProject(_taskWrapper.task.projectId);
				if (!project.users.Self.permissions.tasks.update) return _html;


				let lastDropTarget = false;
				DragHandler.register(
					_html, 
					function (_item, _dropTarget) {
						if (!_dropTarget) return;
						clearLastDropTarget();

						if (dropTargetIsHeader(_dropTarget))
						{
							_dropTarget.parentNode.children[2].style.marginTop = "38px";
						} else {
							_dropTarget.style.marginBottom = _dropTarget.offsetHeight + "px";
						}

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
						_item.placeHolder.style.transition 	= "all .3s";
						_item.placeHolder.style.left 		= dropData.x + "px";
						_item.placeHolder.style.top 		= dropData.y + "px";
						

						_item.html.classList.add("hide");
						_taskWrapper.taskHolder.onTaskRemove(_taskWrapper.task.id);

						let task = await Server.global.tasks.get(_taskWrapper.task.id);				
						dropData.taskHolder.task.dropTask(task, dropData.index);

						return dropCoords;
					},
					function () {clearLastDropTarget();}
				);

				return _html;


				function clearLastDropTarget() {
					if (!lastDropTarget) return;
					lastDropTarget.style.marginBottom 	= "";

					if (!lastDropTarget.parentNode.children[2]) return;
					lastDropTarget.parentNode.children[2].style.marginTop = "";
				}

				function dropTargetIsHeader(_target) {
					return 	_target.classList.contains("dropDownButton") || 
							_target.classList.contains("dateHolder");
				}

				function getDropData(_item) {
					if (!lastDropTarget) return false;
					let data = {
						index: getDropIndex(_item),
					}
					
					data.taskHolder  = getTaskHolderByDropTarget(lastDropTarget)
					
					if (!data.taskHolder) return false;
					let positionObj = data.taskHolder.HTML.todoHolder;
					const taskHeight = 38;
					
					let pos = positionObj.getBoundingClientRect();
					data.x = pos.left;
					data.y = pos.top + taskHeight * data.index;
					
					if (data.index === 0) data.y -= taskHeight - 10;
					
					return data;
				}

					function getTaskHolderByDropTarget(_target) {
						let taskHolder 								= lastDropTarget.parentNode.parentNode;
						if (dropTargetIsHeader(_target)) taskHolder = _target.parentNode;

						let taskHolderId = taskHolder.getAttribute("taskHolderId");
						return MainContent.taskHolder.get(taskHolderId);
					}


					function getDropIndex(_item) {
						if (dropTargetIsHeader(lastDropTarget)) return 0;
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

					function getAboveStatus(_item, _dropTarget) {
						let dropTargetHeight 	= _dropTarget.offsetHeight;
						let dropTargetY 		= _dropTarget.getBoundingClientRect().top;
						return dropTargetY - _item.y > 0;
					}

			}
}









