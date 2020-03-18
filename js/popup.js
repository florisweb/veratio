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
	
	this.createProjectMenu 	 	= new _Popup_createProject();
	this.renameProjectMenu	  	= new _Popup_renameProject();
	this.permissionMenu 		= new _Popup_permissionMenu();
	this.inviteByLinkCopyMenu 	= new _Popup_inviteByLinkCopyMenu();
	this.inviteByEmailMenu 		= new _Popup_inviteByEmailMenu();
}



function _popup(_builder) {
	let This = this;
	const Builder = _builder;
	
	this.HTML = {
		Self: buildPopup(Builder)
	};
	this.HTML.popup = this.HTML.Self.children[0];



	this.openState = false;
	
	this.open = function() {
		this.openState = true;
		this.HTML.Self.classList.remove("hide");		
	}
	
	this.close = function() {
		this.openState = false;
		this.HTML.Self.classList.add("hide");
	}


	function buildPopup(_builder) {
		let popupHolder = document.createElement("div");
		popupHolder.className = "popupBoxHolder hide";
		popupHolder.innerHTML = "<div class='popup'></div>";
		let popup = popupHolder.children[0];

		for (let i = 0; i < _builder.length; i++)
		{
			let element = _buildItem(_builder[i]);
			popup.appendChild(element);
		}

		document.body.append(popupHolder);

		popupHolder.onclick = function(_e) {
			if (_e.target == this) This.close();
		}

		return popupHolder;
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

		if (_info.id) input.setAttribute("id", String(_info.id));
		if (_info.input) input.setAttribute("placeHolder", String(_info.input));
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
	let builder = [
		{title: "CREATE PROJECT"},
		"<br><br>",
		{input: "Project title", value: null, customClass: "text"},
		"<br><br>",
		"<br><br>",
		"<br>",
		{buttons: [
			{button: "CANCEL", onclick: function () {This.close()}},
			{button: "CREATE", onclick: function () {This.createProject()}, important: true, color: COLOR.POSITIVE}
		]}
	];

	_popup.call(this, builder);
	this.HTML.projectTitle = this.HTML.popup.children[2];
	this.HTML.projectTitle.maxLength = 256;

	let extend_open = this.open;

	this.open = function() {
		extend_open.apply(this);
		this.HTML.projectTitle.value = null;
		this.HTML.projectTitle.focus();
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
		
		this.close();
	} 
	

	function scrapeProjectData() {
		let project = {title: This.HTML.projectTitle.value};
		
		if (!project.title || project.title.length < 2) return "E_incorrectTitle";

		return project;
	}
}


function _Popup_inviteByLinkCopyMenu() {
	let This = this;
	let builder = [
		{title: "SUCCESSFULLY CREATED LINK"},
		"<br><br>",
		{text: "Copy and send this link to your invitee."},
		"<br><br>",
		{input: "Invitelink", value: null, customClass: "text"},
		"<br><br>",
		"<br><br>",
		{buttons: [
			{button: "CLOSE", onclick: function () {This.close()}, important: true, color: COLOR.WARNING}
		]}
	];

	_popup.call(this, builder);
	this.HTML.linkHolder = this.HTML.popup.children[4];
	this.HTML.linkHolder.setAttribute("readonly", "true");
	let extend_open = this.open;

	this.open = function(_link) {
		extend_open.apply(this);
		this.HTML.linkHolder.value = _link;
		this.HTML.linkHolder.setSelectionRange(0, _link.length);
	}
}


function _Popup_inviteByEmailMenu() {
	let This = this;
	let builder = [
		{title: "INVITE BY EMAIL"},
		"<br><br>",
		{text: "Enter your invitees email-adress."},
		"<br><br>",
		{input: "Email-adress", value: null, customClass: "text"},
		"<br><br>",
		"<br><br>",
		{buttons: [
			{button: "CANCEL", onclick: function () {This.close()}},
			{button: "INVITE", onclick: function () {This.inviteUser()}, important: true, color: COLOR.POSITIVE}
		]}
	];

	_popup.call(this, builder);
	this.HTML.emailAdressHolder = this.HTML.popup.children[4];
	let extend_open = this.open;

	this.open = function() {
		extend_open.apply(this);
		this.HTML.emailAdressHolder.value = null;
		this.HTML.emailAdressHolder.focus();
	}

	this.inviteUser = async function() {
		let email = this.HTML.emailAdressHolder.value;
		let project = Server.getProject(MainContent.curProjectId);
		
		let returnVal = await project.users.inviteByEmail(email);
		if (returnVal !== true) console.error("An error accured while inviting a user:", returnVal);
		
		this.HTML.emailAdressHolder.value = null;
		This.close();

		MainContent.settingsPage.open(MainContent.curProjectId);
	}
}







function _Popup_renameProject() {
	let This = this;
	let builder = [
		{title: "RENAME PROJECT"},
		"<br><br>",
		{text: "Rename "},
		{text: "", highlighted: true},
		{text: " to:"},
		"<br><br><br>",
		{input: "Project title", value: null, customClass: "text"},
		"<br><br>",
		"<br><br>",
		"<br>",
		{buttons: [
			{button: "CANCEL", onclick: function () {This.close()}},
			{button: "RENAME", onclick: function () {This.renameProject()}, important: true, color: COLOR.DANGEROUS}
		]}
	];

	_popup.call(this, builder);

	this.HTML.projectTitle = this.HTML.popup.children[3];
	this.HTML.newTitleHolder = this.HTML.popup.children[6];
	this.HTML.newTitleHolder.maxLength = 256;

	let extend_open = this.open;

	this.curProjectId = false;


	this.open = function(_projectId) {
		let project = Server.getProject(_projectId);
		if (!project) return false;
		this.curProjectId = project.id;

		extend_open.apply(this);


		setTextToElement(this.HTML.projectTitle, project.title);
		this.HTML.newTitleHolder.value = project.title;
		this.HTML.newTitleHolder.focus();
	}	

	this.renameProject = function() {
		let project = Server.getProject(this.curProjectId);

		let newTitle = this.HTML.newTitleHolder.value;
		if (!newTitle || newTitle.length < 3) return false;

		project.rename(newTitle).then(function () {
			This.close();
			App.update();
		});
	}
}














function _Popup_permissionMenu() {
	let This = this;
	let builder = [
		{title: "CHANGE USER PERMISSIONS"},
		"<br><br>",
		{text: "Change "},
		{text: "Member-name", highlighted: true},
		{text: " permissions to:"},
		"<br><br><br>",
		"<div id='PERMISSIONMENU'>" + 
			"<a class='text optionGroupLabel'>Create and finish tasks</a>" +
			"<div class='optionGroup'>" + 
				"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Own</div>" + 
				"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Assigned to</div>" + 
				"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>All</div>" + 
			"</div>" + 
			'<br><div class="HR"></div>' + 
			"<a class='text optionGroupLabel'>Invite and remove users</a>" + 
			"<div class='optionGroup'>" + 
				"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>None</div>" + 
				"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Can invite</div>" + 
				"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Can remove</div>" + 
			"</div>" + 
			'<br><div class="HR"></div>' + 
			
			"<a class='text optionGroupLabel'>User permissions</a>" +
			"<div class='optionGroup'>" + 
				"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>None</div>" + 
				"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>can change</div>" + 
			"</div>" +
			'<br><div class="HR"></div>' + 

			"<a class='text optionGroupLabel'>Rename and remove this project</a>" + 
			"<div class='optionGroup'>" + 
				"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>None</div>" + 
				"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Rename</div>" + 
				"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Remove</div>" + 
			"</div>" +
		"</div>",

		"<br><br><br><br>",
		{buttons: [
			{button: "CANCEL", onclick: function () {This.close()}},
			{
				button: "CHANGE", 
				onclick: function () {Popup.permissionMenu.updatePermissions()}, 
				important: true, 
				color: COLOR.DANGEROUS
			}
		]}
	];

	_popup.call(this, builder);
	this.HTML.memberName = this.HTML.popup.children[3];

	let extend_open = this.open;


	let curMember = false;

	this.open = async function(_memberId) {
		extend_open.apply(this);

		let project	= Server.getProject(MainContent.curProjectId);
		let member 	= await project.users.get(_memberId);
		curMember 	= member;
		setMemberData(member);
	}



	function setMemberData(_member) {
		setTextToElement(This.HTML.memberName, _member.name + "'s");

		let permissions = JSON.parse(_member.permissions);
		let optionGroup = $("#PERMISSIONMENU .optionGroup");

		optionGroup_select(
			optionGroup[0].children[
				parseInt(permissions[1][0])
			]
		);
		optionGroup_select(
			optionGroup[1].children[
				parseInt(permissions[2][0])
			]
		);
		
		optionGroup_select(
			optionGroup[2].children[
				parseInt(permissions[2][1])
			]
		);

		optionGroup_select(
			optionGroup[3].children[
				parseInt(permissions[3])
			]
		);
	}



	this.updatePermissions = async function() {
		if (!curMember) return;

		let optionGroup = $("#PERMISSIONMENU .optionGroup");
		let newPermissions = [
			"2",
			String(optionGroup[0].value) + (optionGroup[0].value > 0 ? optionGroup[0].value : 1),
			String(optionGroup[1].value) + String(optionGroup[2].value),
			String(optionGroup[3].value)
		];

		curMember.permissions = JSON.stringify(newPermissions);
		
		let project = Server.getProject(MainContent.curProjectId);
		if (!project) return false;

		await project.users.update(curMember);
		curMember = false;

		This.close();

		await project.users.getAll();
		MainContent.settingsPage.open(MainContent.curProjectId);
	}
}










