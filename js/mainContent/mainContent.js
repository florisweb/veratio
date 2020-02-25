

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
			return curDOMData.openEdit();
		},
		"images/icons/changeIconDark.png"
	);
		

	this.open = async function(_item, _event) {
		curDOMData 	= DOMData.get(_item.parentNode.parentNode);
		// let project = Server.getProject(curDOMData.task.projectId);

		Menu.enableAllOptions();

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


	let curProject;
	let inputField;
	let keyTimeout = 0;

	this.openState = false;
	this.openWithInputField = function(_inputField) {
		if (!_inputField || _inputField.type != "text") return;
		
		Menu.open(inputField);
		
		this.openState = true;
		curProject = Server.getProject(MainContent.curProjectId);

		inputField = _inputField;
		keyTimeout = 0;
		Menu.removeAllOptions();

		inputField.onkeyup = function() {
			if (keyTimeout > 0) return keyTimeout--;
			addOptionItemsByValue(this.value, this.selectionStart);
			moveToItem(this.selectionStart);
		}
	}

	this.openWithList = function(_button, _list, _indicator) {
		if (!_button) return;
		this.openState = true;
		curProject = Server.getProject(MainContent.curProjectId);

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
		this.openState = false;
		keyTimeout = 5;
		Menu.close();
		
		if (!inputField) return;
		inputField.focus();
	}





	function getItemListByType(_type, _project) {
		if (!_project) _project = curProject;
		if (!_project) _project = Server.projectList[0];
		switch (_type)
		{
			case "#": 	return _project.tags.list; 				break;
			case ".": 	return Server.projectList; 				break;
			default: 	return _project.users.getLocalList(); 	break;
		}
	}
	


	function addOptionItemsByValue(_value, _cursorPosition) {
		Menu.removeAllOptions();
		
		if (addOptionItemsByValueAndType(_value, _cursorPosition, "#")) return;
		if (addOptionItemsByValueAndType(_value, _cursorPosition, "@")) return;
		if (addOptionItemsByValueAndType(_value, _cursorPosition, ".")) return;
	
		This.hide();
	}	

		function addOptionItemsByValueAndType(_value, _cursorPosition, _type) {
			let active = 0;
			let items = This.getListByValue(_value, _type, _cursorPosition);
			for (let i = 0; i < items.length; i++)
			{
				if (!items[i].active) continue;
				addSearchItem(items[i], _type);
				active++;
			}

			return active > 0;
		}


		function addSearchItem(_item, _type = "@") {
			var clickHandler = function() {
				if (!inputField) return;
				let inValue 	= inputField.value;
				let partA 		= inValue.substr(0, _item.startAt);
				let partB 		= inValue.substr(_item.startAt + _item.length, inValue.length - _item.startAt - _item.length);
				let newStr 		= partA + _type + result.title + partB;
				inputField.value = newStr;

				if (_type == ".") curProject = _item.item;
				
				This.hide();
				inputField.focus();
			}

			let result = createSearchItemIconByType(_type, _item);
			Menu.addOption(result.title, clickHandler, result.src);
		}

		
		function createSearchItemIconByType(_type, _item) {
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
						src: "images/icons/projectIconDark.svg"
					}
				default:
					return {
						title: _item.item.name,
						src: "images/icons/memberIcon.png"
					}
				break;
			}
		}






		this.getListByValue = function(_value, _type, _cursorPosition) {
			let found = [];
			let itemList = getItemListByType(_type);
			if (!itemList) itemList = [];													// TEMPORARILY

			for (let i = 0; i < itemList.length; i++)
			{
				let item = _checkValueByItem(_value, itemList[i], _type);
				if (!item) continue;
				
				item.active = false;
				if (item.startAt <= parseInt(_cursorPosition) && item.length + item.startAt >= parseInt(_cursorPosition)) item.active = true;
				
				found.push(item);
			}

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

				for (let v = 1; v < valueParts.length; v++)
				{
					let cValue = valueParts[v];
					let valueTillHere = Object.assign([], valueParts).splice(0, v).join("#");
					let startAt = valueTillHere.length;

					for (let i = 0; i < cValue.length; i++)
					{
						let curSubString = cValue.substr(0, i + 1);
						let item = {
							startAt: startAt,
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




		function moveToItem(_characterIndex = 0) {
			Menu.open(inputField, {
				left: _characterIndex * 6.2 - inputField.offsetWidth + 30,
				top: -20
			});
			This.openState = Menu.openState;
		}
}


