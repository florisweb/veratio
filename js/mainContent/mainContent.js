

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
		let project = Server.getProject(this.curProjectId);
		if (!project) return false;
		await project.leave();
		MainContent.taskPage.weekTab.open();
		App.update();
	}

	this.removeCurrentProject = async function() {
		let project = Server.getProject(this.curProjectId);
		if (!project) return false;
		await project.remove();
		
		MainContent.taskPage.weekTab.open();
		App.update();
	}
}
	











function _MainContent_userIndicatorMenu() {
	const HTML = {
		mainContentHolder: mainContentHolder
	}

	let Menu = OptionMenu.create(HTML.mainContentHolder);

	this.close = Menu.close;
	this.open = async function(_user, _item, _event) {
		Menu.removeAllOptions();
		setUser(_user);
		return Menu.open(_item, {top: -40, left: -20}, _event);
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
	let Menu = OptionMenu.create(HTML.mainContentHolder);
	
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
		let project = Server.getProject(curDOMData.task.projectId);

		Menu.enableAllOptions();
		if (!project.users.Self.permissions.tasks.remove)						Menu.options[0].disable();
		if (!project.users.Self.permissions.tasks.finish(curDOMData.task))		Menu.options[1].disable();
		if (!project.users.Self.permissions.tasks.update || 
			 curDOMData.task.groupType == "overdue")							Menu.options[2].disable();

		return Menu.open(_item, {top: -20, left: 0}, _event);
	}
}








function _MainContent_searchOptionMenu() {
	let HTML = {
		mainContentHolder: mainContentHolder,
		scrollYHolder: $("#mainContentHolder .mainContentPage")[0]
	}

	let This = this;
	let Menu = OptionMenu.create(HTML.mainContentHolder);


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
				{item: item}, 
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





	this.getItemListByType = async function(_type, _project) {
		if (!_project) _project = this.curProject;
		if (!_project) _project = (await Server.getProjectList())[0];
		switch (_type)
		{
			case "#": 	return _project.tags.getAll();			break;
			case ".": 	return await Server.getProjectList(); 	break;
			default: 	return _project.users.getAll(); 		break;
		}
	}
	


	async function addOptionItemsByValue(_value, _cursorPosition) {
		Menu.removeAllOptions();
		
		if (await addOptionItemsByValueAndType(_value, _cursorPosition, "#")) return;
		if (await addOptionItemsByValueAndType(_value, _cursorPosition, "@")) return;
		if (await addOptionItemsByValueAndType(_value, _cursorPosition, ".")) return;
	
		This.hide();
	}	

		async function addOptionItemsByValueAndType(_value, _cursorPosition, _type) {
			let active = 0;
			let items = await This.getListByValue(_value, _type, _cursorPosition);
		
			for (let i = 0; i < items.length; i++)
			{
				if (!items[i].active) continue;
				addSearchItem(items[i], _type);
				active++;
			}

			return active > 0;
		}


		function addSearchItem(_item, _type = "@") {
			var clickHandler = async function() {
				if (!inputField) return;
				let inValue 	= inputField.value;
				let partA 		= inValue.substr(0, _item.startAt);
				let partB 		= inValue.substr(_item.startAt + _item.length, inValue.length - _item.startAt - _item.length);
				let newStr 		= partA + _type + result.title + partB;
				inputField.value = newStr;

				if (_type == ".") This.curProject = _item.item;
				
				This.userForceHide();
				inputField.focus();

				if (!_item.isCreateItem) return;
				
				let project = This.curProject;
				if (!project) project = (await Server.getProjectList())[0];
				
				await Popup.createTagMenu.openWithTagName(_item.item.title, project.id);

				inputField.focus();
			}

			let result = createSearchItemIconByType(_type, _item);
			Menu.addOption(result.title, clickHandler, result.src);
		}

		
		function createSearchItemIconByType(_type, _item) {
			if (_item.isCreateItem) 
			{
				return {
					title: _item.item.title,
					src: "images/icons/addIcon.png"
				}
			}
			switch (_type)
			{
				case ".": 
					return {
						title: _item.item.title,
						src: "images/icons/projectIconDark.svg"
					}
				break;
				case "#": 
					return {
						title: _item.item.title,
						src: "images/tagIcon?tagId=" + _item.item.id
						// src: "images/icons/tagIcon.png"
					}
				default:
					return {
						title: _item.item.name,
						src: "images/icons/memberIcon.png"
					}
				break;
			}
		}






		this.getListByValue = async function(_value, _type, _cursorPosition) {
			let found = [];
			let itemList = await this.getItemListByType(_type);
			if (!itemList) itemList = [];

			for (let i = 0; i < itemList.length; i++)
			{
				let item = _checkValueByItem(_value, itemList[i], _type);
				if (!item) continue;
				
				item.active = false;
				if (item.startAt <= parseInt(_cursorPosition) && item.length + item.startAt >= parseInt(_cursorPosition)) item.active = true;
				
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

			function _checkValueByItem(_value, _item, _type = "#") {
				let valueParts = _value.split(_type);
				let scores = [];
				let itemTitle = _item.title ? _item.title : _item.name;

				for (let valI = 1; valI < valueParts.length; valI++)
				{
					let cValue = Object.assign([], valueParts).splice(valI, valueParts.length).join(_type);
					let startIndex = Object.assign([], valueParts).splice(0, valI).join(_type).length;

					for (let i = 0; i < cValue.length + 1; i++)
					{
						let curSubString = cValue.substr(0, i + 1);
						let item = {
							startAt: startIndex,
							length: i + 2,
							str: curSubString,
							score: similarity(curSubString, itemTitle),
							item: _item
						}
						scores.push(item);
					}
				}

				if (scores.length < 1) return false;
				return scores.sort(function(a, b){
			     	if (a.score < b.score) return 1;
			    	if (a.score > b.score) return -1;
			    	return 0;
			    })[0];
			}

			function addCreateNewItemOption(_value, _type, _cursorPosition, _itemList) {
				if (_type != "#") return false;

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
					length: itemTitle.length + 1,
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
				left: _characterIndex * 6.2 - inputField.offsetWidth + 30,
				top: -20
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
		return _tasks.sort(function(a, b) {
			let projectA = Server.getProject(a.projectId);
			let projectB = Server.getProject(b.projectId);

	     	if (!projectA || !projectA.users.Self.id) return 1;
	    	if (!projectB || !projectB.users.Self.id) return -1;

	    	if (a.assignedTo.includes(projectA.users.Self.id)) return -1;
	    	if (b.assignedTo.includes(projectB.users.Self.id)) return 1;
		});
	}
}






