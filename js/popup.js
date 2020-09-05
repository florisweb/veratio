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








function _Popup() {
	let HTML = {
		notificationHolder: $("#notificationBoxHolder")[0],
		notifcationBox: $("#notificationBox")[0]
	}

	this.createProjectMenu 	 	= new _Popup_createProject();
	this.renameProjectMenu	  	= new _Popup_renameProject();
	this.permissionMenu 		= new _Popup_permissionMenu();
	this.inviteByLinkCopyMenu 	= new _Popup_inviteByLinkCopyMenu();
	this.inviteByEmailMenu 		= new _Popup_inviteByEmailMenu();
	this.tagMenu 				= new _Popup_tagMenu();
	this.createTagMenu 			= new _Popup_createTagMenu();
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
		popupHolder.innerHTML = "<div class='popupWindow'></div>";
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
		if ("button" in _item) 			element = _buildButton(_item);
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
		if (_info.maxLength) input.maxLength = _info.maxLength;

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
		{input: "Project title", value: null, customClass: "text", maxLength: 256},
		"<br><br>",
		"<br><br>",
		"<br>",
		{buttons: [
			{button: "CANCEL", onclick: function () {This.close()}},
			{button: "CREATE", onclick: function () {This.createProject()}, important: true, color: COLOUR.POSITIVE}
		]}
	];

	_popup.call(this, builder);
	this.HTML.projectTitle = this.HTML.popup.children[2];

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
			{button: "CLOSE", onclick: function () {This.close()}, important: true, color: COLOUR.WARNING}
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
			{button: "INVITE", onclick: function () {This.inviteUser()}, important: true, color: COLOUR.POSITIVE}
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
		let project = await Server.getProject(MainContent.curProjectId);
		
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
		{input: "Project title", value: null, customClass: "text", maxLength: 256},
		"<br><br>",
		"<br><br>",
		"<br>",
		{buttons: [
			{button: "CANCEL", onclick: function () {This.close()}},
			{button: "RENAME", onclick: function () {This.renameProject()}, important: true, color: COLOUR.DANGEROUS}
		]}
	];

	_popup.call(this, builder);

	this.HTML.projectTitle = this.HTML.popup.children[3];
	this.HTML.newTitleHolder = this.HTML.popup.children[6];

	let extend_open = this.open;

	this.curProjectId = false;


	this.open = async function(_projectId) {
		let project = await Server.getProject(_projectId);
		if (!project) return false;
		this.curProjectId = project.id;

		extend_open.apply(this);


		setTextToElement(this.HTML.projectTitle, project.title);
		this.HTML.newTitleHolder.value = project.title;
		this.HTML.newTitleHolder.focus();
	}	

	this.renameProject = async function() {
		let project = await Server.getProject(this.curProjectId);

		let newTitle = this.HTML.newTitleHolder.value;
		if (!newTitle || newTitle.length < 3) return false;

		project.rename(newTitle).then(async function () {
			This.close();
			await Server.clearCache(); 
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
		"<div class='UI selectBox'>" + 
			"<a class='button bBoxy bDefault text'>" +
				"<img src='images/icons/dropDownIcon.png' class='dropDownIcon'>" + 
				"<span>Admin</span>" + 
			"</a>" + 
			"<div class='UI box popup hide'>" + 
			"</div>" + 
		"</div><br><br><br>",
		
		{text: "Description", highlighted: true},
		"<br><div style='position: relative; width: 100%; height: 2px; '></div>",
		"<a class='UI text' style='white-space: normal !important'></a>",

		"<br><br><br><br><br><br>",
		{buttons: [
			{button: "CANCEL", onclick: function () {This.close()}},
			{
				button: "CHANGE", 
				onclick: function () {Popup.permissionMenu.updatePermissions()}, 
				important: true, 
				color: COLOUR.DANGEROUS
			}
		]}
	];

	_popup.call(this, builder);
	this.HTML.memberName = this.HTML.popup.children[3];
	this.HTML.optionMenu = this.HTML.popup.children[6].children[0];
	this.HTML.descriptionHolder = this.HTML.popup.children[9].children[0];
	
	let optionMenu = UI.createOptionMenu(this.HTML.optionMenu.children[0], this.HTML.optionMenu.children[1]);
	optionMenu.onOptionSelected = function(_value) {
		setTextToElement(
 			This.HTML.descriptionHolder, 
 			MainContent.settingsPage.permissionData[parseInt(_value)].description
 		);
	}
	




	let extend_open = this.open;


	let curMember = false;

	this.open = async function(_memberId) {
		extend_open.apply(this);

		let project	= await Server.getProject(MainContent.curProjectId);
		let member 	= await project.users.get(_memberId);
		curMember 	= member;
		setMemberData(member);
	}


	async function setMemberData(_member) {
		setTextToElement(This.HTML.memberName, _member.name + "'s");
		let project = await Server.getProject(MainContent.curProjectId);

		optionMenu.removeAllOptions();
		
		for (let i = MainContent.settingsPage.permissionData.length - 1; i >= 0; i--) 
		{
			if (i > project.users.Self.permissions.value) continue;

			optionMenu.addOption(
				MainContent.settingsPage.permissionData[i].name,
				MainContent.settingsPage.permissionData[i].icon, 
				i
			);

			if (_member.permissions != i) continue;
			optionMenu.options[optionMenu.options.length - 1].select();
		}
	}



	this.updatePermissions = async function() {
		if (!curMember) return;
		curMember.permissions = parseInt(optionMenu.value);
		
		let project = await Server.getProject(MainContent.curProjectId);
		if (!project) return false;

		await project.users.update(curMember);
		curMember = false;

		This.close();

		MainContent.settingsPage.open(MainContent.curProjectId);
	}
}










function _Popup_tagMenu() {
	let This = this;
	const builder = [
		{title: "MANAGE TAGS"},
		"<br><br>",
		{text: "Tags", highlighted: true},
		"<br><div class='tagListHolder'>-</div>",
		{button: "+ Add Tag", onclick: async function () {
			This.close();
			await Popup.createTagMenu.open(CurProject.id);
			This.open(CurProject.id);
		}},
		
		"<br><br><br><br>",
		{buttons: [
			{button: "CLOSE", onclick: function () {This.close()}},
		]}
	];

	_popup.call(this, builder);

	this.HTML.tagListHolder = this.HTML.popup.children[3].children[1];
	this.HTML.addTagButton 	= this.HTML.popup.children[4];
	this.HTML.addTagButton.classList.add("addTagButton");


	

	const Menu = OptionMenu.create(this.HTML.Self);
	
	Menu.addOption("Remove", async function () {
		if (!CurTag) return;
		let result = await CurProject.tags.remove(CurTag.id);

		This.open(CurProject.id);
		return result;
	}, "images/icons/removeIcon.png");

	Menu.addOption("Edit", openTagEditMenu, "images/icons/changeIconDark.png");




	
	let extend_open = this.open;
	let CurTag = false;
	let CurProject = false;
	
	this.open = async function(_projectId) {
		CurProject = await Server.getProject(_projectId);
		if (!CurProject) return;

		setTagList(await CurProject.tags.getAll(true));
		extend_open.apply(this);

		enableFeaturesByPermissions();	
	}

	function setTagList(_tags) {
		This.HTML.tagListHolder.innerHTML = "";
		for (tag of _tags) This.HTML.tagListHolder.append(createTagHTML(tag));
	}


	function createTagHTML(_tag) {
		let html = document.createElement("div");
		html.className = "UI listItem clickable";
		
		html.appendChild(createTagColorCircle(_tag));

		html.innerHTML += 	"<div class='text'></div>" + 
							"<div class='rightHand clickable'>" + 
								"<img src='images/icons/optionIcon.png' class='item optionIcon clickable'>" + 
							"</div>";

		DoubleClick.register(html, function () {
			CurTag = _tag;
			openTagEditMenu();
		});

		setTextToElement(html.children[1], _tag.title);
		html.children[2].onclick = function() {
			CurTag = _tag;
			Menu.open(this, {left: -20, top: 10});
		}

		return html;
	}

	function createTagColorCircle(_tag) {
		let circle = document.createElement("div");
		circle.className = "icon colourCircle";
			
		circle.style.backgroundColor = _tag.colour.merge(new Color("rgba(255, 255, 255, .1)"), .5).toHex();
		circle.style.borderColor = _tag.colour.merge(new Color("rgba(220, 220, 220, .7)"), .5).toHex();

		return circle;
	}



	async function openTagEditMenu() {
		if (!CurTag) return;
		if (!CurProject.users.Self.permissions.tags.update) return;
		This.close();
		
		await Popup.createTagMenu.openEdit(CurTag, CurProject.id);
		This.open(CurProject.id);
	}


	function enableFeaturesByPermissions() {
		This.HTML.addTagButton.classList.remove("hide");
		Menu.enableAllOptions();

		if (!CurProject.users.Self.permissions.tags.remove) Menu.options[0].disable();
		if (!CurProject.users.Self.permissions.tags.update) Menu.options[1].disable();
		if (!CurProject.users.Self.permissions.tags.update) This.HTML.addTagButton.classList.add("hide");
	}
}







function _Popup_createTagMenu() {
	let This = this;
	let builder = [
		{title: "CREATE TAG"},
		"<br><br>",
		{input: "Tag title", value: null, customClass: "text", maxLength: 256},
		"<br><br><br>",
		{text: "Tag Colour", highlighted: true},
		"<br><br><div class='UI selectBox'>" + 
			"<a class='button bBoxy bDefault'>" +
				"<img src='images/icons/dropDownIcon.png' class='dropDownIcon'>" + 
				"<span>Tag Colour</span>" + 
			"</a>" + 
		"</div>",
		"<br>",
		{buttons: [
			{button: "CANCEL", onclick: function () {This.close()}},
			{button: "CREATE", onclick: function () {This.createTag()}, important: true, color: COLOUR.POSITIVE}
		]}
	];

	_popup.call(this, builder);
	this.HTML.title 		= this.HTML.popup.children[0];
	this.HTML.tagTitle 		= this.HTML.popup.children[2];
	this.HTML.optionMenu 	= this.HTML.popup.children[5].children[2];
	this.HTML.createButton 	= this.HTML.popup.children[this.HTML.popup.children.length - 1].children[0];
	this.HTML.optionPopup	= document.getElementById("optionMenu_colourPopupBox");

	let extend_open = this.open;
	let extend_close = this.close;
	let colourOptionMenu = createColourMenu(); 


	let CurProject = false;
	let EditData = {tag: false}
	let OnClosePromiseResolver;

	this.open = async function(_projectId, _tagName = null) {
		CurProject = await Server.getProject(_projectId);
		if (!CurProject) return;

		resetEditMode();

		extend_open.apply(this);
		this.HTML.tagTitle.value = _tagName;
		this.HTML.tagTitle.focus();

		return new Promise(function (_resolve, _error) {
			OnClosePromiseResolver = _resolve;
		});	
	}


	this.openEdit = function(_tag, _projectId) {
		let onclosePromise = this.open(_projectId);
		
		EditData.tag = _tag;
		if (!EditData.tag) return;

		setTextToElement(this.HTML.createButton, "EDIT");
		setTextToElement(this.HTML.title, "EDIT TAG");

		setTagData(_tag);

		return onclosePromise;
	}


	this.close = function(_tag) {
		extend_close.apply(this);
		try {
			OnClosePromiseResolver(_tag);
		} catch (e) {}
		colourOptionMenu.close();
		resetEditMode();
	}

	function resetEditMode() {
		EditData.tag = false;
		setTextToElement(This.HTML.createButton, "CREATE");
		setTextToElement(This.HTML.title, "CREATE TAG");
	}





	this.createTag = async function() {
		let tag = await scrapeTagData();
		if (typeof tag != "object") return alert(tag);

		tag = await CurProject.tags.update(tag);
		if (!tag) return console.error("Something went wrong while creating a tag:", tag);
		await CurProject.tags.getAll(true);
		this.close(await CurProject.tags.get(tag.id));
	} 
	

	async function scrapeTagData() {
		let tag = {
			id: newId(),
			title: This.HTML.tagTitle.value.replace(/^\s+|\s+$/g, ''),
			colour: colourOptionMenu.value.colour.toHex()
		};

		if (EditData.tag) tag.id = EditData.tag.id;
		if (!tag.title || tag.title.length < 2 || !tag.colour) return "E_invalidData";
		if (
			await testIfTagTitleAlreadyExists(tag.title) && 
			(!EditData.tag || tag.title.toLowerCase() != EditData.tag.title.toLowerCase())
		) return "E_tagNameAlreadyTaken";

		return tag;
	}

	async function testIfTagTitleAlreadyExists(_tagTitle) {
		let tags = await CurProject.tags.getAll();
		for (tag of tags) 
		{
			if (tag.title.toLowerCase() == _tagTitle.toLowerCase()) return true;
		}
		return false;
	}







	function setTagData(_tag) {
		This.HTML.tagTitle.value = _tag.title;

		let index = getColourIndexByTag(_tag);
		colourOptionMenu.options[index].select();
	}
	
	function getColourIndexByTag(_tag) {
		let tagColour = _tag.colour.toRGBA();
		for (let i = 0; i < COLOUR.list.length; i++)
		{	
			let curColour = COLOUR.list[i].colour.toRGBA();
			if (curColour != tagColour) continue;
			return i;
		}
		return 0;
	}





	
	function createColourMenu() {
		let menuButton = This.HTML.optionMenu.children[0];
		let menu = UI.createOptionMenu(menuButton, This.HTML.optionPopup);
		menu.onOptionSelected = function(_value) {
		}


		for (colour of COLOUR.list)
		{
			let option = menu.addOption(colour.name, "", colour);
			option.html.removeChild(option.html.children[0]);
			
			let colourCircle = createTagColorCircle(colour);
			option.html.insertBefore(colourCircle, option.html.children[0]);
		}

		
		menuButton.addEventListener("click", function () {
			This.HTML.optionPopup.style.left = menuButton.getBoundingClientRect().left + "px";
			This.HTML.optionPopup.style.top = menuButton.getBoundingClientRect().top + "px";
			
			let verticalSpaceAvailable = window.innerHeight - menuButton.getBoundingClientRect().top;
			This.HTML.optionPopup.style.maxHeight = verticalSpaceAvailable + "px";
		});
		

		return menu;
	}


	function createTagColorCircle(_tag) {
		let circle = document.createElement("div");
		circle.className = "icon colourCircle";
			
		circle.style.backgroundColor = _tag.colour.merge(new Color("rgba(255, 255, 255, .4)"), .5).toHex();
		circle.style.borderColor = _tag.colour.merge(new Color("rgba(220, 220, 220, .6)"), .5).toHex();

		return circle;
	}
}