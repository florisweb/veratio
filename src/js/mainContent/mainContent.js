const projectType 	= ' .';
const tagType 		= '#';
const userType 		= ' @';



function _MainContent() {
	let HTML = {
		mainContent: $("#mainContent")[0],
		mainContentHolder: $("#mainContentHolder")[0],
		pages: $("#mainContent .mainContentPage"),
	}

	this.curProjectId = "";
	this.header 			= new _MainContent_header();
	
	this.taskHolder 		= new _MainContent_taskHolder();


	this.optionMenu 		= new _MainContent_optionMenu();
	this.searchOptionMenu 	= new _MainContent_searchOptionMenu();
	this.userIndicatorMenu 	= new _MainContent_userIndicatorMenu();

	


	this.taskPage 		= new MainContent_taskPage();
	this.settingsPage 	= new MainContent_settingsPage();
	this.curPage 		= this.taskPage;

	




	this.startLoadingAnimation = function() {
		HTML.mainContentHolder.classList.add("showLoadingAnimation");
	}
	this.stopLoadingAnimation = function() {
		HTML.mainContentHolder.classList.remove("showLoadingAnimation");
	}


	this.leaveCurrentProject = async function() {
		let project = await Server.getProject(this.curProjectId);
		if (!project) return false;

		let actionValidated = await Popup.showMessage({
			title: "Leave " + project.title + "?", 
			text: "Are you sure you want to leave " + project.title + "? This action cannot be undone.", 
			buttons: [
				{title: "Leave", value: true, filled: true, color: COLOUR.DANGEROUS}, 
				{title: "Cancel", value: false}
			]
		});

		if (!actionValidated) return;
	
		await project.leave();
		await Server.clearCache();
		MainContent.taskPage.weekTab.open();
		App.update();
	}

	this.removeCurrentProject = async function() {
		let project = await Server.getProject(this.curProjectId);
		if (!project) return false;

		let actionValidated = await Popup.showMessage({
			title: "Remove " + project.title + "?", 
			text: "Are you sure you want to remove " + project.title + "? This action cannot be undone.", 
			buttons: [
				{title: "Remove", value: true, filled: true, color: COLOUR.DANGEROUS}, 
				{title: "Cancel", value: false}
			]
		});
		if (!actionValidated) return;
		
		await project.remove();
		await Server.clearCache();
		
		MainContent.taskPage.weekTab.open();
		App.update();
	}
}
	











function _MainContent_userIndicatorMenu() {
	const HTML = {
		mainContentHolder: mainContentHolder
	}

	let Menu = OptionMenu.create();

	this.close = Menu.close;
	this.open = async function(_user, _item, _event) {
		Menu.removeAllOptions();
		setUser(_user);
		return Menu.open(_item, {left: -80, top: 25}, _event);
	}

	function setUser(_user) {		
		Menu.addOption(
			_user.name,
			function () {}, 
			"images/icons/memberIcon.png"
		);
	}
}




function _MainContent_optionMenu() {
	let HTML = {
		mainContentHolder: mainContentHolder,
		contentHolder: $("#mainContentHolder .mainContentPage")[0],
		menu: $("#mainContentHolder .optionMenuHolder")[0]
	}
	let This = this;
	
	let curDOMData;
	let Menu = OptionMenu.create();
	
	this.openState 	= Menu.openState;
	this.close 		= Menu.close;


	Menu.addOption(
		"Remove", 
		function () {
			return curDOMData.remove();
		}, 
		"images/icons/removeIcon.png"
	);
	
	Menu.addOption(
		"Finish", 
		function () {
			return curDOMData.finish();
		}, 
		"images/icons/checkIcon.svg"
	);

	Menu.addOption(
		"Edit", 
		function () {
			curDOMData.openEdit();
			return true;
		},
		"images/icons/changeIconDark.png"
	);
		

	this.open = async function(_item, _event) {
		curDOMData 	= DOMData.get(_item.parentNode.parentNode);
		let project = await Server.getProject(curDOMData.task.projectId);

		Menu.enableAllOptions();
		if (!project.users.Self.permissions.tasks.remove)						Menu.options[0].disable();
		if (!project.users.Self.permissions.tasks.finish(curDOMData.task))		Menu.options[1].disable();
		if (!project.users.Self.permissions.tasks.update || 
			 curDOMData.task.groupType == "overdue")							Menu.options[2].disable();

		return Menu.open(_item, {left: -50, top: 20}, _event);
	}
}






function _MainContent_searchOptionMenu() {
	let HTML = {
		mainContentHolder: mainContentHolder,
		scrollYHolder: $("#mainContentHolder .mainContentPage")[0]
	};

	let This = this;
	let Menu = OptionMenu.create();


	let inputField;
	let keyTimeout = 0;

	this.curProject = false;

	this.openState = false;
	this.openWithInputField = function(_inputField) {
		if (!_inputField || _inputField.type != "text") return;
		
		Menu.open(inputField);
		
		this.openState = true;

		inputField = _inputField;
		keyTimeout = 0;
		Menu.removeAllOptions();

		inputField.onkeyup = async function() {
			if (keyTimeout > 0) return keyTimeout--;
			await addOptionItemsByValue(this.value, this.selectionStart);
			moveToItem(this.selectionStart);
		}
	}

	this.openWithList = function(_button, _list, _indicator) {
		if (!_button) return;
		this.openState = true;

		Menu.removeAllOptions();
		
		for (item of _list) 
		{
			addSearchItem(
				{
					item: item,
					startAt: 0,
					length: 0,
				}, 
				_indicator
			);
		}
		
		Menu.open(_button, {
			left: _button.offsetWidth + 30,
			top: -30
		});
	}

	this.clickFirstOption = function () {Menu.clickFirstOption.apply(Menu);};


	this.close = function() {
		this.hide();

		if (!inputField) return;
		inputField.blur();
		inputField.onkeyup = null;
		inputField = null;
	}

	this.hide = function() {
		if (!this.openState) return;
		this.openState = false;
		Menu.close();
		
		if (!inputField) return;
		inputField.focus();
	}

	this.userForceHide = function() {
		if (!this.openState) return;
		this.hide();
		keyTimeout = 5;
		return true;
	}	





	this.getItemListByType = async function(_type) {
		let project = MainContent.taskHolder.curCreateMenu.curTask.project;
		switch (_type)
		{
			case tagType: 	
				let tags = Object.assign([], await project.tags.getAll());
				tags.push({id: false, title: "No tag", colour: new Color("#000"), isNoOptionItem: true}); 
				return tags;
			break;
			case projectType: 	return Server.projectList;				break;
			default: 			return await project.users.getAll(); 	break;
		}
	}
	


	async function addOptionItemsByValue(_value, _cursorPosition) {		
		if (await addOptionItemsByValueAndType(_value, _cursorPosition, tagType)) return;
		if (await addOptionItemsByValueAndType(_value, _cursorPosition, userType)) return;
		if (await addOptionItemsByValueAndType(_value, _cursorPosition, projectType)) return;
	
		This.hide();
	}	

		async function addOptionItemsByValueAndType(_value, _cursorPosition, _type) {
			let items = await This.getListByValue(_value, _type, _cursorPosition);
			Menu.removeAllOptions();

			for (let i = 0; i < items.length; i++) addSearchItem(items[i], _type);

			return items.length > 0;
		}


		function addSearchItem(_item, _type = tagType) {
			var clickHandler = async function() {
				if (!inputField) return;
				let inValue 		= inputField.value;
				let partA 			= inValue.substr(0, _item.startAt);
				let partB 			= inValue.substr(_item.startAt + _item.length + _type.length, Infinity);
				inputField.value 	= partA + partB;
				

				if (!_item.isCreateItem)
				{
					if (_type == projectType) 	MainContent.taskHolder.curCreateMenu.curTask.setProject(_item.item);
					if (_type == tagType) 		MainContent.taskHolder.curCreateMenu.curTask.setTag(_item.item);
					if (_type == userType) 		MainContent.taskHolder.curCreateMenu.curTask.addAssignee(_item.item);
				}

				This.userForceHide();
				inputField.focus();

				if (!_item.isCreateItem) return;
				switch (_type)
				{
					case projectType: 
						project = await Popup.createProjectMenu.open(_item.item.title);
						if (project) MainContent.taskHolder.curCreateMenu.curTask.setProject(project);
					break;
					case tagType: 
						project = MainContent.taskHolder.curCreateMenu.curTask.project;
						let tag = await Popup.createTag.open(project.id, _item.item.title);
						if (tag) MainContent.taskHolder.curCreateMenu.curTask.setTag(tag);
					break;
				}
		
				inputField.focus();
			}

			let result = createSearchItemIconByType(_type, _item);
			Menu.addOption(result.title, clickHandler, result.image);
		}

		
		function createSearchItemIconByType(_type, _item) {
			if (_item.item.isNoOptionItem) 
			{
				return {
					title: _item.item.title,
					image: "images/icons/noOptionIcon.png"
				}
			}
			switch (_type)
			{
				case projectType:
					if (_item.isCreateItem) 
					{
						return {
							title: _item.item.title,
							image: "images/icons/addIcon.png"
						}
					}
					return {
						title: _item.item.title,
						image: "images/icons/projectIconDark.svg"
					}
				break;
				case tagType: 
					if (_item.isCreateItem) 
					{
						return {
							title: _item.item.title,
							image: "images/icons/addIcon.png"
						}
					}
					return {
						title: _item.item.title,
						image: MainContent.taskPage.renderer.createTagCircle(_item.item)
					}
				default:
					return {
						title: _item.item.name,
						image: "images/icons/memberIcon.png"
					}
				break;
			}
		}


		this.getListByValue = async function(_value, _type, _cursorPosition) {
			let found = [];
			let itemList = await this.getItemListByType(_type);
			if (!itemList) itemList = [];

			let stringInfo = getRelevantStringInfo(_value, _type, _cursorPosition);
			if (stringInfo === false) return [];

			for (let i = 0; i < itemList.length; i++)
			{
				let item = getBestStringCutForItem(stringInfo, itemList[i], _type);
				if (!item || item.score < .5 - 1 / (stringInfo.string.length + 1)) continue;	
				found.push(item);
			}
	
			let createItem = addCreateNewItemOption(_value, _type, _cursorPosition, itemList);
			if (createItem) found.push(createItem);

			return found.sort(function(a, b){
		     	if (a.score < b.score) return 1;
		    	if (a.score > b.score) return -1;
		    	return 0;
			});
		}

		function getRelevantStringInfo(_value, _type, _cursorPosition) {
			let value = _value.substr(0, _cursorPosition + 1);
			let parts = value.split(_type);
			let letterIndex = parts[0].length;
			for (let i = 1; i < parts.length; i++)
			{
				let start = letterIndex;
				letterIndex = start + parts[i].length + _type.length;

				if (start > _cursorPosition || letterIndex < _cursorPosition) continue;
				return {
					string: parts[i],
					startOffset: start,
				}
			}
			return false;
		}

		function getBestStringCutForItem(_stringInfo, _item, _type) {
			let scores = [];
			let itemTitle = _item.title ? _item.title : _item.name;

			for (let i = 0; i < _stringInfo.string.length + 1; i++)
			{
				let curSubString = _stringInfo.string.substr(0, i);
				let curItemTitle = itemTitle.substr(0, i);
				let startIndex = _stringInfo.startOffset;
				let score = similarity(curSubString, curItemTitle) - Math.abs(i - _stringInfo.string.length) * .1;
				let item = {
					startAt: startIndex,
					length: i + _type.length,
					str: curSubString,
					score: i == 0 ? 0 :score,
					item: _item
				}
				scores.push(item);
			}

			if (scores.length < 1) return false;
			return scores.sort(function(a, b){
		     	return b.score - a.score;
		    })[0];
		}


			function addCreateNewItemOption(_value, _type, _cursorPosition, _itemList) {
				if (_type != tagType && _type != projectType) return false;

				let valueParts = _value.split(_type);
				if (valueParts.length < 2) return false;


				let partIndex = 1;
				for (let i = 1; i < valueParts.length; i++) 
				{
					let curStrIndex = Object.assign([], valueParts).splice(0, i).join(_type).length;

					let curValue = valueParts[i];
					if (curStrIndex < _cursorPosition && _cursorPosition < curStrIndex + curValue.length + 1)
					{
						partIndex = i;
						break;	
					}
				}


				let itemTitle = valueParts[partIndex];
				if (itemTitle.length < 3) return false;
				let curStrIndex = Object.assign([], valueParts).splice(0, partIndex).join(_type).length;

				for (item of _itemList) if (similarity(item.title, itemTitle) > .9) return false;

				let itemObject = {
					startAt: curStrIndex,
					length: itemTitle.length + _type.length,
					str: itemTitle,
					score: 0,
					active: true,
					isCreateItem: true,
					item: {
						title: itemTitle
					}
				}

				return itemObject;
			}


		function moveToItem(_characterIndex = 0) {
			Menu.open(inputField, {
				left: _characterIndex * 6.2 - 10,
				top: 25
			});
			This.openState = Menu.openState;
		}
}













const TaskSorter = new _TaskSorter();
function _TaskSorter() {
	this.defaultSort = function(_tasks) {
		_tasks = this.sortAlphabet(_tasks);
		_tasks = this.sortAssignedToMe(_tasks);
		return this.sortFinished(_tasks);
	} 



	this.sortAlphabet = function(_tasks = []) {
		if (!_tasks) return [];
		return _tasks.sort(function(a, b) {
	     	if (a.title > b.title) return 1;
	    	if (a.title < b.title) return -1;
		});
	}

	this.sortFinished = function(_tasks = []) {
		if (!_tasks) return [];
		return _tasks.sort(function(a, b) {
	     	if (a.finished) return 1;
	    	if (b.finished) return -1;
		});
	}

	this.sortAssignedToMe = function(_tasks = []) {
		if (!_tasks) return [];
		return _tasks.sort(async function(a, b) {
			let projectA = await Server.getProject(a.projectId);
			let projectB = await Server.getProject(b.projectId);

	     	if (!projectA || !projectA.users.Self.id) return 1;
	    	if (!projectB || !projectB.users.Self.id) return -1;

	    	if (a.assignedTo.includes(projectA.users.Self.id)) return -1;
	    	if (b.assignedTo.includes(projectB.users.Self.id)) return 1;
		});
	}
}






