
function _TaskRenderer() {
	let This = this;
	let HTML = {
		scrollHolder: $(".mainContentPage")[0]
	}

	this.renderTask = async function(_taskWrapper, _renderSettings) {
		if (!_taskWrapper) 		return false;
		let project 			= await Server.getProject(_taskWrapper.task.projectId);
		if (!project) 			return false;

		let html = createTaskHTMLTemplate();
		fillInTaskData(html, _taskWrapper.task, project, _renderSettings);
		setHtmlClasses(html, _taskWrapper.task, project);
		
		DOMData.set(html, _taskWrapper);
		assignEventHandlers(html, _taskWrapper, project);

		return html;
	}
		function setHtmlClasses(html, task, project) {
			if (task.finished) 										html.classList.add("finished");
			if (task.assignedTo.includes(project.users.Self.id)) 	html.classList.add("isSelf");
		}

		function createTaskHTMLTemplate() {
			let html = document.createElement("div");
			html.className = "listItem taskItem dropTarget clickable";
			
			html.innerHTML = 	"<div class='taskOwnerIndicator'></div>" + 
								"<div class='statusCircleHitBox'></div>" + 
								'<div class="titleHolder text userText"></div>' + 
							 	'<div class="functionHolder">' +
									'<img src="images/icons/optionIcon.png" onclick="MainContent.optionMenu.open(this)" class="functionItem optionIcon icon clickable">' +
									'<div class="functionItem projectHolder"></div>' +
									'<div class="functionItem plannedDateHolder userText"></div>' +
									'<div class="functionItem memberList userText"></div>' +
								'</div>';;
			return html;
		}

		function fillInTaskData(html, task, project, renderSettings) {
			setTextToElement(html.children[2], task.title);
			setMemberText(html, task, project);
			setOwnerIndicator(html, task, project);
			addTagCircle(html, task, project);

			if (renderSettings.displayDate !== false) 			setPlannedDateText(html, task);
			if (renderSettings.displayProjectTitle !== false) 	setProjectTitle(html, project);
		}

	
			async function setMemberText(html, task, project) {
				setTextToElement(
					html.children[3].children[3], 
					await createMemberText(task.assignedTo, project)
				);
			
				async function createMemberText(_userIdList, _project) {
					if (!_project || !_userIdList || !_userIdList.length) return "";
					let users = await _project.users.getAll();

					let memberList = [];
					for (id of _userIdList)
					{
						for (user of users)
						{
							if (user.id != id) continue;
							memberList.push(user);
						}
					}

					return TextFormater.memberListToString(memberList, 20);
				}
			}


			async function setOwnerIndicator(html, task, project) {
				let taskOwner = await project.users.get(task.creatorId);
				if (!taskOwner || taskOwner.Self) return;

				html.classList.add("isNotMyTask");
				let ownerIndicator = html.children[0];

				let onIndicator = false;
				ownerIndicator.onmouseleave = function() {
					onIndicator = false;
					MainContent.userIndicatorMenu.close();
				}
				ownerIndicator.onmouseenter = function(_event) {
					onIndicator = true;	
					setTimeout(function () {
						if (!onIndicator) return;
						MainContent.userIndicatorMenu.open(taskOwner, ownerIndicator, _event);
					}, 500);
				}
			}


			async function addTagCircle(html, task, project) {
				let tag = await project.tags.get(task.tagId);
				html.children[1].append(This.createTagCircle(tag, true));
			}


			function setPlannedDateText(html, task) {
				if (!["date", "overdue"].includes(task.groupType)) return;
				if (!new Date().stringIsDate(task.groupValue)) return;
					
				let date = new Date().setDateFromStr(task.groupValue);
				let plannedDateText = DateNames.toString(date, true);
				setTextToElement(html.children[3].children[2], plannedDateText);


				let dateIndex = date.getDateInDays(true);
				let todayIndex =  new Date().getDateInDays(true);

				let plannedDateClass = false;
				if (dateIndex > todayIndex + 1 && dateIndex <= todayIndex + 7) 	plannedDateClass = "thisWeek";
				if (dateIndex == todayIndex + 1) 								plannedDateClass = "tomorrow";
				if (dateIndex == todayIndex) 									plannedDateClass = "today";

				if (plannedDateClass) html.children[3].children[2].classList.add(plannedDateClass);
			}


			function setProjectTitle(html, project) {
				let projectTitleHolder = html.children[3].children[1];
				let projectTitleHtml =  '<img src="images/icons/projectIconDark.svg" class="functionItem projectIcon">' +
										'<div class="functionItem projectTitle userText"></div>';
				projectTitleHolder.innerHTML = projectTitleHtml;
				setTextToElement(projectTitleHolder.children[1], project.title);
			}




			function assignEventHandlers(_html, _taskWrapper, _project) {
				_html.children[1].onclick = async function() {
					if (!_project.users.Self.permissions.tasks.finish(_taskWrapper.task)) return false;
					_taskWrapper.finish();
				}

				DoubleClick.register(_html, async function() {
					if (!_project.users.Self.permissions.tasks.update) return false;
					_taskWrapper.openEdit();
				});

				RightClick.register(_html, function(_event, _html) {
					MainContent.optionMenu.open(_html.children[2].children[0], _event);
				});

				return assignDragHandler(_html, _taskWrapper, _project);
			}


			function assignDragHandler(_html, _taskWrapper, _project) {
				if (!_project.users.Self.permissions.tasks.update) return _html;

				let lastDropTarget = false;
				DragHandler.register(
					_html, 
					function (_item, _dropTarget) {
						if (!_dropTarget) return;
						clearLastDropTarget();

						if (dropTargetIsHeader(_dropTarget))
						{
							_dropTarget.parentNode.children[3].style.marginTop = "38px";
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
					lastDropTarget.parentNode.children[3].style.marginTop = "";
				}

				function dropTargetIsHeader(_target) {
					return 	_target.classList.contains("dropDownButton") || 
							_target.classList.contains("titleHolder") ||
							_target.classList.contains("subTitleHolder");
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


	this.createTagCircle = function(_tag, _showCheckIcon = false) {
		if (!_tag) _tag = {colour: new Color("#999")};
		
		let html = document.createElement("div");
		html.innerHTML = '<?xml version="1.0" standalone="no"?><svg class="statusCircle clickable" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 83 83" width="83" height="83"><defs><clipPath id="_clipPath_EvyxEBqQoipdaXxIJMEjCjvXV7edc1qw"><rect width="83" height="83"/></clipPath></defs><g clip-path="url(#_clipPath_EvyxEBqQoipdaXxIJMEjCjvXV7edc1qw)"><rect x="0.729" y="42.389" width="43.308" height="20" transform="matrix(0.707,0.707,-0.707,0.707,43.601,-0.482)"/><rect x="16.22" y="30.02" width="70" height="20" transform="matrix(0.707,-0.707,0.707,0.707,-13.296,47.939)"/></g></svg>';
		
		let tagCircle = html.children[0];
		if (_showCheckIcon) tagCircle.classList.add("showCheckIcon");

		tagCircle.style.backgroundColor		= _tag.colour.merge(new Color("rgba(255, 255, 255, .1)"), .3).toRGBA();
		tagCircle.style.borderColor 		= _tag.colour.merge(new Color("#fff"), .8).toRGBA();
		tagCircle.style.fill 				= _tag.colour.merge(new Color("rgb(130, 130, 130)"), .5).toRGBA();

		return tagCircle;
	}
}









