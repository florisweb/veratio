

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
		removeAllOptions();
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

	function removeAllOptions() {
		for (option of Menu.options) option.remove();
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
		// if (!project.users.Self.taskActionAllowed("remove", task)) Menu.options[0].disable();
		// if (!project.users.Self.taskActionAllowed("finish", task)) Menu.options[1].disable();
		// if (!project.users.Self.taskActionAllowed("update", task)) Menu.options[2].disable();

		return Menu.open(_item, {top: -20, left: 0}, _event);
	}

	this.openState 	= Menu.openState;
	this.close 		= Menu.close;
}







function _MainContent_searchOptionMenu() {
	let HTML = {
		menu: $("#mainContentHolder .optionMenuHolder.searchOption")[0],
		mainContentHolder: mainContentHolder,
		scrollYHolder: $("#mainContentHolder .mainContentPage")[0]
	}
	let This = this;
	let curProject;
	let inputField;
	let keyupTimeout = 0;

	this.openState = false;
	this.open = function(_item) {
		if (!_item) return;

		let project 	= Server.getProject(MainContent.curProjectId);
		let projectId 	= project ? project.id : Server.projectList[0].id;
		curProject 		= Server.getProject(projectId);

		HTML.menu.innerHTML = "";
		HTML.menu.classList.remove("hide");
		this.openState = true;

		moveToItem(_item, 0);
	}


	this.openWithInputField = function(_item) {
		if (!_item || _item.type != "text") return;

		inputField = _item;
		keyupTimeout = 0;
		inputField.onkeyup = function() {
			if (keyupTimeout > 0) return keyupTimeout--;
			
			addOptionItemsByValue(this.value, this.selectionStart);
			moveToItem(this, this.selectionStart);
		}

		this.open(_item);
	}


	this.hide = function(_reFocusTextElement = false, _setTimeOut = 5) {
		this.openState = false;
		if (!inputField) return;
		keyupTimeout = _setTimeOut;
		HTML.menu.classList.add("hide");
		if (_reFocusTextElement) inputField.focus();
	}


	this.close = function() {
		this.openState = false;

		HTML.menu.classList.add("hide");
		setTimeout('$("#mainContentHolder .optionMenuHolder.searchOption")[0].style.top = "-50px";', 300);

		if (!inputField) return;
		inputField.onkeyup = null;
		inputField = null;
	}

	this.chooseFirstSearchItem = function() {
		let searchItem = $(".searchOption .optionItem.clickable")[0];
		if (!searchItem) return false;
		searchItem.click();
		return true;
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
		HTML.menu.innerHTML = "";
		HTML.menu.classList.remove("hide");
		This.openState = true;

		if (addOptionItemsByValueAndType(_value, _cursorPosition, "#")) return;
		if (addOptionItemsByValueAndType(_value, _cursorPosition, "@")) return;
		if (addOptionItemsByValueAndType(_value, _cursorPosition, ".")) return;
	
		This.hide(false, 0);
	}	

		function addOptionItemsByValueAndType(_value, _cursorPosition, _type) {
			let active = 0;
			let items = This.getListByValue(_value, _type, _cursorPosition);
			for (let i = 0; i < items.length; i++)
			{
				if (!items[i].active) continue;
				This.addSearchItem(items[i], _type);
				active++;
			}

			return active > 0;
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





		this.addSearchItem = function(_item, _type = "@") {
			let html 		= document.createElement("div");
			html.className 	= "optionItem clickable";
			html.innerHTML 	= "<div class='userText optionText'></div>";
			HTML.menu.append(html);

			let result = createSearchItemIconByType(_type, _item);
			html.insertAdjacentHTML("afterbegin", result.htmlStr);
			setTextToElement(html.children[1], result.title);

			html.addEventListener("click", function() {
				if (!inputField) return;
				let inValue 	= inputField.value;
				let partA 		= inValue.substr(0, _item.startAt);
				let partB 		= inValue.substr(_item.startAt + _item.length, inValue.length - _item.startAt - _item.length);
				let newStr 		= partA + _type + result.title + partB;
				inputField.value = newStr;

				if (_type == ".") curProject = _item.item;
				
				This.hide(true, 1);
			});
		}


		function createSearchItemIconByType(_type, _item) {
			let title = "";
			let htmlStr = "";
			switch (_type)
			{
				case ".": 
					htmlStr = "<img src='images/icons/projectIconDark.svg' class='optionIcon'>";
					title = _item.item.title;
				break;
				case "#": 
					htmlStr = "<div class='optionIcon statusCircle'></div>";
					title = _item.item.title;
				break;
				default:
					htmlStr = "<img src='images/icons/memberIcon.png' style='opacity: 0.3' class='optionIcon'>";
					title = _item.item.name;
				break;
			}

			return {title: title, htmlStr: htmlStr}
		}


		function moveToItem(_item, _characterIndex = 0) {
			if (!_item) return false;
			let top 	= _item.getBoundingClientRect().top + HTML.scrollYHolder.scrollTop - 25;
			let left 	= _item.getBoundingClientRect().left - HTML.scrollYHolder.getBoundingClientRect().left;
			_characterIndex -= 1;
			left += _characterIndex * 6.2 - 10;

			let maxLeft = $("#mainContent")[0].offsetWidth - HTML.menu.offsetWidth - 15;
			if (left > maxLeft) left = maxLeft;

			HTML.menu.style.left 	= left + "px";
			HTML.menu.style.top 	= top + "px";
		}
}


