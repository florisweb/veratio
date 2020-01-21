// ============== DOCUMENTATION ===================
// Usage:
// f: hide								closes the popup
// f: showNotification(notification)	opens a popup containing the information given in the notification object
// 
// NOTIFICATION OBJECT: array
// items: 
// - Raw html string 				"<br>"
// - Raw html object				document.createElement("br")
// - Title 							{title: yourTitle}						Can be used to show the user what the popup is about
// - Text 							{text: yourText, highlighted: true}		
// - Checkbox 						{checkBox: MyCheckboxes text, id: id for event handeling},
// - BUTTON OBJECT: array			{buttons: []}
//		- Button 					{button: buttons name, onclick: function () {}, important: true, color: "rgb()"}		
//										important means filled in
//										color: color to fill the button in with
// - inputfield 					{input: input fields placeholder, id: id for event handeling, value: the startvalue to be set} 
// 
// 




const Popup = new function () {
	let HTML = {
		notificationHolder: $("#notificationBoxHolder")[0],
		notifcationBox: $("#notificationBox")[0]
	}
	
	this.openState = false;
	this.createProjectMenu  = new _Popup_createProject();






	HTML.notificationHolder.onclick = function(_e) {
		if (_e.target == this) Popup.close();
	}


	function show() {
		Popup.openState = true;
		HTML.notificationHolder.classList.remove("hide");
	}

	this.close = function() {
		this.openState = false;
		HTML.notificationHolder.classList.add("hide");
	}


	this.showNotification = function(_builder) {
		show();
		HTML.notifcationBox.innerHTML = "";
		for (let i = 0; i < _builder.length; i++)
		{
			let element = _buildItem(_builder[i]);
			HTML.notifcationBox.appendChild(element);
		}
		return HTML.notifcationBox;
	}

	function _buildItem(_item) {
		let element = false;
		if (typeof _item == "string") 	return _buildString(_item);

		if ("title" in _item) 			element = _buildTitle(_item);
		if ("text" in _item) 			element = _buildText(_item);
		if ("subHeader" in _item) 		element = _buildSubHeader(_item);
		if ("checkBox" in _item) 		element = _buildCheckbox(_item);
		if ("buttons" in _item) 		element = _buildButtons(_item.buttons);
		if ("input" in _item) 			element = _buildInput(_item);
		if ("options" in _item) 		element = _buildOptionHolder(_item);
		if (_item.onclick) 				element.onclick = _item.onclick;
		if (_item.customClass) 			element.classList.add(_item.customClass);
		return element;
	}

	function _buildString(_string) {
		let parent = document.createElement("div");
		parent.innerHTML = _string;
		return parent;
	}

	function _buildTitle(_info) {
		let element = document.createElement("a");
		element.className = "header text";
		setTextToElement(element, _info.title);
		return element;
	}

	function _buildText(_info) {
		let element = document.createElement("div");
		element.className = "text";
		if (_info.highlighted)									element.classList.add("highlighted");
		if (_info.text.substr(0, 1) == " ")						element.style.marginLeft = "4px";
		if (_info.text.substr(_info.text.length - 1, 1) == " ") element.style.marginRight = "4px";

		setTextToElement(element, _info.text);
		return element;
	}

	function _buildCheckbox(_info) {
		let element = document.createElement("div");
		element.className = "checkBoxHolder";

		// let html = 	'<div class="checkBox" onclick="if (this.classList.contains(\'checked\')) {this.classList.remove(\'checked\');this.setAttribute(\'checked\', false);} else {this.classList.add(\'checked\');this.setAttribute(\'checked\', true);}">' +
		// 			'</div>' + 
		// 			'<div class="checkBoxText text"></div>';

		element.append(_buildText({text: _info.checkBox}))
		let html = '<input type="checkbox">';
		element.innerHTML = html;
		if (_info.id) element.children[0].setAttribute("id", _info.id);
		if (_info.checked) element.children[0].classList.add("checked");

		return element;
	}

	function _buildButtons(_buttons) {
		let buttonBar = document.createElement("div");
		buttonBar.className = "buttonBar";

		for (let i = _buttons.length - 1; i >= 0; i--)
		{
			let curButton = _buildButton(_buttons[i]);
			buttonBar.appendChild(curButton);
		}

		return buttonBar;
	}
		function _buildButton(_buttonInfo) {
			let button = document.createElement("div");
			button.className = "boxButton text";
			
			if (_buttonInfo.important) button.classList.add("important");
			if (_buttonInfo.color) button.style.background = _buttonInfo.color;
			if (_buttonInfo.onclick) button.onclick = _buttonInfo.onclick;

			setTextToElement(button, _buttonInfo.button);
			return button;
		} 
	

	function _buildInput(_info) {
		let input = document.createElement("input");
		input.className = "inputField";
		if (_info.focus && !_info.id) _info.id = "popup_autoFocusInputField";

		if (_info.id) input.setAttribute("id", String(_info.id));
		if (_info.input) input.setAttribute("placeHolder", String(_info.input));
		if (_info.focus) var loopTimer = setTimeout(_info.id + ".focus()", 1);
		if (_info.value) input.value = String(_info.value);

		return input;
	}
	
	function _buildOptionHolder(_info) {
		let select = document.createElement("select");
		select.className = "optionHolder";
		if (_info.id) select.setAttribute("id", _info.id);
		
		for (let i = 0; i < _info.options.length; i++)
		{
			let option = _buildOptions(_info.options[i]);
			select.appendChild(option);
		}
		return select;
	}
		function _buildOptions(_option) {
			let option = document.createElement("option");
			option.className = "optionItem";
			if (_option.option) option.text = _option.option;
			if (_option.value) option.value = _option.value;
			return option;
		}


	function _buildSubHeader(_info) {
		let element = document.createElement("a");
		element.className = "text header subHeader";
		setTextToElement(element, _info.subHeader);
		
		return element;
	}


}














function _Popup_createProject() {
	let This = this;

	this.open = function() {
		openCreateProjectMenu();
	}

	
	function openCreateProjectMenu() {
		let builder = [
			{title: "CREATE PROJECT"},
			"<br><br>",
			{input: "Project title", value: null, id: "CREATEPROJECTValueHolder", focus: true, customClass: "text"},
			"<br><br>",
			"<br><br>",
			"<br>",
			{buttons: [
				{button: "CANCEL", onclick: Popup.close},
				{button: "CREATE", onclick: Popup.createProjectMenu.createProject,
				important: true, color: COLOR.POSITIVE}
			]}
		];

		Popup.showNotification(builder);
	}




	this.createProject = async function() {
		let project = scrapeProjectData();
		if (typeof project != "object") return alert(project);

		project = await Server.createProject(project.title);
		if (!project) return console.error("Something went wrong while creating a project:", project);
		await Server.sync();
		
		SideBar.projectList.fillProjectHolder();
		MainContent.taskPage.open();
		MainContent.curPage.projectTab.open(project.id);
		
		Popup.close();
	} 
	

	function scrapeProjectData() {
		let project = {title: document.getElementById("CREATEPROJECTValueHolder").value};
		
		if (!project.title || project.title.length < 2) return "E_incorrectTitle";

		return project;
	}
}
























