

function _MainContent() {
	let HTML = {
		todoHolder: $("#mainContentHolder .todoListHolder")[0],
	}

	
	this.header 			= new _MainContent_header();

	this.menu 				= new _MainContent_menu();

	this.optionMenu 		= new _MainContent_optionMenu();
	this.searchOptionMenu 	= new _MainContent_searchOptionMenu();
}	






function _MainContent_optionMenu() {
	let HTML = {
		mainContentHolder: mainContentHolder,
		menu: $("#mainContentHolder .mainContentMenu")[0]
	}
	let This = this;

	this.openState = false;
	this.open = function(_item, _todoId, _event) {
		this.openState = true;
		moveToItem(_item, _event);

		let menu = $("#mainContentHolder .optionMenuHolder")[0];
		
		menu.children[0].onclick = function() {
			let data = DOMData.get(_item.parentNode.parentNode);
			if (!data) return;
			
			data.finish();
			This.close();
		};

		menu.children[1].onclick = function() {
			let todo = Server.todos.get(_todoId);
			if (!todo) return;
			
			let project = Server.getProject(todo.projectId);
			project.todos.remove(todo.id);
			
			_item.parentNode.parentNode.classList.add("hide");
			This.close();
		};

		menu.children[2].onclick = function() {
			let item = _item.parentNode.parentNode;
			let dayItemId = item.parentNode.parentNode.getAttribute("dayItemId");

			let dayItem = MainContent.menu.Main.todoHolder.dayItem.get(dayItemId);
			dayItem.createMenu.openEdit(item, _todoId);

			This.close();
		}
	}



	this.close = function() {
		this.openState = false;
		let menu = $("#mainContentHolder .optionMenuHolder")[0];
		menu.classList.add("hide");
		setTimeout('$("#mainContentHolder .optionMenuHolder")[0].style.top = "-50px";', 300);
	}



		function moveToItem(_item, _event) {
			if (!_item) return false;
			let top = _item.getBoundingClientRect().top + HTML.menu.scrollTop - 30;
			let left = _event ? _event.clientX - 325 :  $("#mainContentHolder")[0].offsetWidth - 180;

			let menu = $("#mainContentHolder .optionMenuHolder")[0];
			menu.style.top = top + "px";
			menu.style.left = left + "px";
			menu.classList.remove("hide");
		}
}









function _MainContent_searchOptionMenu() {
	let HTML = {
		menu: $("#mainContentHolder .optionMenuHolder.searchOption")[0],
		mainContentHolder: mainContentHolder,
		scrollYHolder: $("#mainContentHolder .mainContentMenu")[0]
	}
	let This = this;
	let curProject;
	let inputField;
	let keyupTimeout = 0;

	this.openState = false;
	this.open = function(_item) {
		if (!_item || _item.type != "text") return;

		let project 	= Server.getProject(MainContent.menu.Main.page.curProjectId);
		let projectId 	= project ? project.id : Server.projectList[0].id;
		curProject 		= Server.getProject(projectId);

		inputField = _item;
		keyupTimeout = 0;
		inputField.onkeyup = function() {
			if (keyupTimeout > 0) return keyupTimeout--;
			
			addTagItemsByValue(this.value, this.selectionStart);
			moveToItem(this, this.selectionStart);
		}
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

		inputField.onkeyup = null;
		inputField = null;

		HTML.menu.classList.add("hide");
		setTimeout('$("#mainContentHolder .optionMenuHolder.searchOption")[0].style.top = "-50px";', 300);
	}



	function addTagItemsByValue(_value, _cursorPosition) {
		HTML.menu.innerHTML = "";
		HTML.menu.classList.remove("hide");
		This.openState = true;
		

		let activeTags = 0;
		let tags = _getListByValue(_value, _cursorPosition, curProject.tags.list, "#");
		for (let i = 0; i < tags.length; i++)
		{
			if (!tags[i].active) continue;
			_addSearchItem(tags[i], "#");
			activeTags++;
		}

		if (activeTags > 0) return;

		let activeMembers = 0;
		let members = _getListByValue(_value, _cursorPosition, curProject.users.getList(), "@");
		for (let i = 0; i < members.length; i++)
		{
			if (!members[i].active) continue;
			_addSearchItem(members[i], "@");
			activeMembers++
		}
		
		if (!activeTags && !activeMembers) return This.hide(false, 0);
	}	




		function _getListByValue(_value, _cursorPosition, _items, _type) {
			let found = [];

			for (let i = 0; i < _items.length; i++)
			{
				let item = _checkValueByItem(_value, _items[i], _type);
				let active = false;
				if (item.startAt <= parseInt(_cursorPosition) && item.length + item.startAt >= parseInt(_cursorPosition)) active = true;
				item.active = active;

				found.push(item);
			}

			return found.sort(function(a, b){
		     	if (a.score < b.score) return 1;
		    	if (a.score > b.score) return -1;
		    	return 0;
			})
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
							score: _compareValues(curSubString, itemTitle),
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

				function _compareValues(_valueA, _valueB) {
					let score = similarity(_valueB, _valueA);
					return score;
				}



		this.chooseFirstSearchItem = function() {
			let searchItem = $(".searchOption .optionItem.clickable")[0];
			if (!searchItem) return false;
			searchItem.click();
			return true;
		}

		function _addSearchItem(_item, _type = "@") {
			let html = 	document.createElement("div");
			html.className = "optionItem clickable";
			html.innerHTML = "<div class='userText optionText'></div>";
			HTML.menu.append(html);


			let title = "";
			switch (_type)
			{
				case "#": title = _addSearchItem_tag(html, _item); break;
				default: title = _addSearchItem_member(html, _item); break;
			}



			html.addEventListener("click", function() {
				if (!inputField) return;
				let inValue = inputField.value;
				let partA = inValue.substr(0, _item.startAt);
				let partB = inValue.substr(_item.startAt + _item.length, inValue.length - _item.startAt - _item.length);
				let newStr = partA + _type + title + partB;
				inputField.value = newStr;
				
				This.hide(true, 1);
			});


			setTextToElement(html.children[1], title);
		}

			function _addSearchItem_tag(_html, _item) {
				let html = "<div class='optionIcon statusCircle'></div>";
				_html.insertAdjacentHTML("afterbegin", html);

				return _item.item.title;
			}

			function _addSearchItem_member(_html, _item) {
				let html = "<img src='images/icons/projectIconDark.svg' class='optionIcon statusCircle'>";
				_html.insertAdjacentHTML("afterbegin", html);

				return _item.item.name;
			}






		function moveToItem(_item, _characterIndex = 0) {
			if (!_item) return false;
			let top = _item.getBoundingClientRect().top + HTML.scrollYHolder.scrollTop - 25;
			let left = _item.getBoundingClientRect().left - HTML.scrollYHolder.getBoundingClientRect().left;
			_characterIndex -= 1;
			left += _characterIndex * 5;

			HTML.menu.style.left 	= left + "px";
			HTML.menu.style.top 	= top + "px";
		}
}




























