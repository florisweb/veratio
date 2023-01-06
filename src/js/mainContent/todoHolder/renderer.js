
function _TaskRenderer() {
	let This = this;
	let HTML = {
		scrollHolder: $(".mainContentPage")[0]
	}

	this.renderTask = async function(_taskWrapper, _renderSettings) {
		if (!_taskWrapper) 		return false;
		let project 			= _taskWrapper.task.project;
		if (!project) {console.warn('invalid project', _taskWrapper); return false;}

		let html = createTaskHTMLTemplate();
		fillInTaskData(html, _taskWrapper.task, project, _renderSettings);
		setHtmlClasses(html, _taskWrapper.task, project);
		
		DOMData.set(html, _taskWrapper);
		assignEventHandlers(html, _taskWrapper, project);

		return html;
	}
		function setHtmlClasses(html, task, project) {
			if (task.finished) 										html.classList.add("finished");
			if (task.assignedTo.includes(project.users.self.id)) 	html.classList.add("isSelf");
		}

		function createTaskHTMLTemplate() {
			let html = document.createElement("div");
			html.className = "listItem taskItem clickable";
			html.setAttribute('id', newId());
			
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

					let memberList = [];
					for (let id of _userIdList)
					{
						for (let user of _project.users.list)
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
					if (!_project.users.self.permissions.tasks.finish(_taskWrapper.task)) return false;
					_taskWrapper.finish();
				}

				DoubleClick.register(_html, async function() {
					if (!_project.users.self.permissions.tasks.update) return false;
					_taskWrapper.openEdit();
				});

				RightClick.register(_html, openContextMenu);
				
				let mouseDown = false;
				_html.addEventListener('mousedown', function(_e) {
					console.log('mousedown')
					if (!App.inPhoneMode) return;
					mouseDown = true;	
					setTimeout(function() {
						if (!mouseDown) return;
						openContextMenu(_e, _html);
					}, 10);
				});
				_html.addEventListener('mouseup', function() {
					mouseDown = false;
				});
			



				return assignDragHandler(_html, _taskWrapper, _project);

				function openContextMenu(_event, _html) {
					MainContent.optionMenu.open(_html.children[2].children[0], _event);
				}
			}

			

			function assignDragHandler(_html, _taskWrapper, _project) {
				if (!_project.users.self.permissions.tasks.update) return _html;
				DragHandler.register(_html, onDrop, getListHolder, MainContent.taskHolder.dropRegionId);

				async function onDrop(_ownHTML, _curDropTarget, _todoHolder, _newIndex) {
					let taskHolderId = _todoHolder.parentNode.getAttribute('taskHolderId');
					let taskHolder = MainContent.taskHolder.get(taskHolderId);
					if (!taskHolder) return;
					await taskHolder.task.dropTaskTo(_taskWrapper, _newIndex, _taskWrapper.taskHolder);
					await _taskWrapper.taskHolder.task.dropTaskFrom(_taskWrapper, _newIndex, taskHolder); // Notify the previous taskholder that a task was dropped from it
				}

				function getListHolder(_dropTarget) {
					if (
						_dropTarget.classList.contains('createTaskHolder') ||
						_dropTarget.classList.contains('titleHolder') ||
						_dropTarget.classList.contains('subTitleHolder') ||
						_dropTarget.classList.contains('dropDownButton')
					) return _dropTarget.parentNode.children[3];
				}

				return _html;
			}


	this.createTagCircle = function(_tag, _showCheckIcon = false) {
		if (!_tag) _tag = {colour: new Color("#aaa")};
		
		let html = document.createElement("div");
		html.innerHTML = '<?xml version="1.0" standalone="no"?><svg class="statusCircle clickable" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 83 83" width="83" height="83"><defs><clipPath id="_clipPath_EvyxEBqQoipdaXxIJMEjCjvXV7edc1qw"><rect width="83" height="83"/></clipPath></defs><g clip-path="url(#_clipPath_EvyxEBqQoipdaXxIJMEjCjvXV7edc1qw)"><rect x="0.729" y="42.389" width="43.308" height="20" transform="matrix(0.707,0.707,-0.707,0.707,43.601,-0.482)"/><rect x="16.22" y="30.02" width="70" height="20" transform="matrix(0.707,-0.707,0.707,0.707,-13.296,47.939)"/></g></svg>';
		
		let tagCircle = html.children[0];
		if (_showCheckIcon) tagCircle.classList.add("showCheckIcon");

		tagCircle.style.backgroundColor		= _tag.colour.merge(new Color("rgba(255, 255, 255, .1)"), .2).toRGBA();
		tagCircle.style.borderColor 		= _tag.colour.merge(new Color("#fff"), .9).toRGBA();
		tagCircle.style.fill 				= _tag.colour.merge(new Color("#fff"), .9).toRGBA();
		// tagCircle.style.fill 				= _tag.colour.merge(new Color("rgb(130, 130, 130)"), .5).toRGBA();

		return tagCircle;
	}
}









