

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


	this.showMessage = function({title = "", text = "", buttons = []}) {
		return new Promise(function (resolve, error) {
			let content = [
				new Text({text: text}),
				new VerticalSpace({height: 25})
			];

			for (let i = 0; i < buttons.length; i++) 
			{
				let buttonConfig = buttons[i];
				buttonConfig.onclick = function () {resolve(buttons[i].value); popup.close()};
				content.push(new Button(buttonConfig));
			}


			let popup = new PopupComponent({
				title: title,
				content: content,
				onClose: function() {
					setTimeout(function() {
						resolve(false);
						popup.remove();
					}, 500);
				},
			});

			setTimeout(popup.open, 1);
		});
	}
}





function _Popup_createProject() {
	let This = this;
	PopupComponent.call(this, {
		title: "Create Project",
		content: [
			new Text({text: "Title", isHeader: true}),
			new VerticalSpace({height: 5}),
			new InputField({placeHolder: "Project title", maxLength: 256}),
			new VerticalSpace({height: 20}),
			new Button({
				title: "Create", 
				onclick: function () {This.createProject()},
				filled: true,
			}),
			new Button({
				title: "Cancel", 
				onclick: function () {This.close()},
			})
		],
		onOpen: onOpen
	});
	
	let projectTitleInput = this.content[2];

	function onOpen() {
		projectTitleInput.setValue(null);
		projectTitleInput.focus();
	}

	this.createProject = async function() {
		let title = projectTitleInput.getValue();
		if (!title || title.length < 2) return alert("E_incorrectTitle");

		project = await Server.createProject(title);
		if (!project) return console.error("Something went wrong while creating a project:", project);
		
		SideBar.projectList.fillProjectHolder();
		MainContent.taskPage.open();
		MainContent.curPage.projectTab.open(project.id);
		
		this.close();
	} 
}




function _Popup_inviteByLinkCopyMenu() {
	let This = this;
	PopupComponent.call(this, {
		title: "Successfully created link",
		content: [
			new Text({text: "Copy and send this link to your invitee."}),
			new LineBreak(),
			new InputField({readonly: true}),
			new VerticalSpace({height: 20}),
			new Button({
				title: "Close",
				onclick: function () {This.close()},
				filled: true,
				color: COLOUR.WARNING,
			})
		],
		onOpen: onOpen
	});

	let linkField = this.content[2];
	function onOpen(_openResolver, _link) {
		linkField.setValue(_link);
		linkField.HTML.setSelectionRange(0, _link.length);
	}
}


function _Popup_inviteByEmailMenu() {
	let This = this;
	PopupComponent.call(this, {
		title: "Invite by email",
		content: [
			new Text({text: "Enter your invitees email-adress."}),
			new LineBreak(),
			new InputField({placeHolder: "Email-adress"}),
			new VerticalSpace({height: 20}),
			new Button({
				title: "Invite",
				onclick: function () {This.inviteUser()},
				filled: true,
				color: COLOUR.POSITIVE,
			}),
			new Button({
				title: "Close",
				onclick: function () {This.close()},
			})
		],
		onOpen: onOpen
	});

	let emailInputField = this.content[2];

	function onOpen() {
		emailInputField.setValue(null);
		emailInputField.focus();
	}

	this.inviteUser = async function() {
		let email = emailInputField.getValue();
		let project = await Server.getProject(MainContent.curProjectId);
		
		let returnVal = await project.users.inviteByEmail(email);
		if (returnVal !== true) console.error("An error accured while inviting a user:", returnVal);
		
		This.close();

		MainContent.settingsPage.open(MainContent.curProjectId);
	}
}




function _Popup_renameProject() {
	let This = this;
	PopupComponent.call(this, {
		title: "Rename project",
		content: [
			new Text({text: "Rename "}),
			new Text({text: "", isHighlighted: true}),
			new VerticalSpace({height: 10}),
			new InputField({placeHolder: "Project title", maxLength: 256}),
			new VerticalSpace({height: 20}),
			new Button({
				title: "Rename",
				onclick: function () {This.renameProject()},
				filled: true,
				color: COLOUR.WARNING,
			}),
			new Button({
				title: "Cancel",
				onclick: function () {This.close()},
			})
		],
		onOpen: onOpen
	});
	let projectTitleHolder = this.content[1];
	let inputField = this.content[3];




	let curProjectId = false;
	async function onOpen(_openResolver, _projectId) {
		let project = await Server.getProject(_projectId);
		if (!project) return false;
		curProjectId = project.id;

		projectTitleHolder.setText(project.title);
		inputField.setValue(project.title);
		inputField.focus();
	}	

	this.renameProject = async function() {
		let project = await Server.getProject(curProjectId);

		let newTitle = inputField.getValue();
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

	PopupComponent.call(this, {
		title: "Change user permissions",
		content: [
			new Text({text: "Change ", isHeader: true}),
			new Text({text: "", isHighlighted: true, isHeader: true}),
			new Text({text: " permissions", isHeader: true}),
			new VerticalSpace({height: 10}),
			new OptionSelector({onValueChange: onValueChange}),
			new VerticalSpace({height: 40}),
			new Text({text: ""}),
			new VerticalSpace({height: 20}),
			new Button({
				title: "Change",
				onclick: function () {Popup.permissionMenu.updatePermissions()},
				filled: true,
				color: COLOUR.WARNING,
			}),
			new Button({
				title: "Cancel",
				onclick: function () {This.close()},
			})
		],
		onOpen: onOpen
	});

	let memberNameHolder = this.content[1];
	let optionMenu = this.content[4];
	let descriptionHolder = this.content[6];

	
	function onValueChange(_newValue) {
		descriptionHolder.setText(
			MainContent.settingsPage.permissionData[parseInt(_newValue)].description
		);
	}

	

	let curMember = false;	
	async function onOpen(_openResolver, _memberId) {
		let project	= await Server.getProject(MainContent.curProjectId);
		let member 	= await project.users.get(_memberId);
		curMember 	= member;
		setMemberData(member);
	}


	async function setMemberData(_member) {
		memberNameHolder.setText(_member.name + "'s");
		let project = await Server.getProject(MainContent.curProjectId);

		optionMenu.removeAllOptions();
		
		for (let i = MainContent.settingsPage.permissionData.length - 1; i >= 0; i--) 
		{
			if (i > project.users.Self.permissions.value) continue;

			let option = optionMenu.addOption({
				title: 	MainContent.settingsPage.permissionData[i].name,
				icon: 	MainContent.settingsPage.permissionData[i].icon,
				value: 	i,
			});

			if (_member.permissions != i) continue;
			option.select();
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










// function _Popup_tagMenu() {
// 	let This = this;
// 	const builder = [
// 		{title: "MANAGE TAGS"},
// 		"<br><br>",
// 		{text: "Tags", highlighted: true},
// 		"<br><div class='tagListHolder'>-</div>",
// 		{button: "+ Add Tag", onclick: async function () {
// 			This.close();
// 			await Popup.createTagMenu.open(CurProject.id);
// 			This.open(CurProject.id);
// 		}},
		
// 		"<br><br><br><br>",
// 		{buttons: [
// 			{button: "CLOSE", onclick: function () {This.close()}},
// 		]}
// 	];

// 	_popup.call(this, builder);

// 	this.HTML.tagListHolder = this.HTML.popup.children[3].children[1];
// 	this.HTML.addTagButton 	= this.HTML.popup.children[4];
// 	this.HTML.addTagButton.classList.add("addTagButton");


	

// 	const Menu = OptionMenu.create();
	
// 	Menu.addOption("Remove", async function () {
// 		if (!CurTag) return;
// 		let result = await CurProject.tags.remove(CurTag.id);

// 		This.open(CurProject.id);
// 		return result;
// 	}, "images/icons/removeIcon.png");

// 	Menu.addOption("Edit", openTagEditMenu, "images/icons/changeIconDark.png");




	
// 	let extend_open = this.open;
// 	let CurTag = false;
// 	let CurProject = false;
	
// 	this.open = async function(_projectId) {
// 		CurProject = await Server.getProject(_projectId);
// 		if (!CurProject) return;

// 		setTagList(await CurProject.tags.getAll(true));
// 		extend_open.apply(this);

// 		enableFeaturesByPermissions();	
// 	}

// 	function setTagList(_tags) {
// 		This.HTML.tagListHolder.innerHTML = "";
// 		for (tag of _tags) This.HTML.tagListHolder.append(createTagHTML(tag));
// 	}


// 	function createTagHTML(_tag) {
// 		let html = document.createElement("div");
// 		html.className = "UI listItem clickable";

// 		let tagCircle = MainContent.taskPage.renderer.createTagCircle(_tag);
// 		html.appendChild(tagCircle);

// 		html.innerHTML += 	"<div class='text'></div>" + 
// 							"<div class='rightHand clickable'>" + 
// 								"<img src='images/icons/optionIcon.png' class='item optionIcon clickable'>" + 
// 							"</div>";

// 		DoubleClick.register(html, function () {
// 			CurTag = _tag;
// 			openTagEditMenu();
// 		});

// 		setTextToElement(html.children[1], _tag.title);
// 		html.children[2].onclick = function() {
// 			CurTag = _tag;
// 			Menu.open(this, {left: -20, top: 10});
// 		}

// 		return html;
// 	}


// 	async function openTagEditMenu() {
// 		if (!CurTag) return;
// 		if (!CurProject.users.Self.permissions.tags.update) return;
// 		This.close();
		
// 		await Popup.createTagMenu.openEdit(CurTag, CurProject.id);
// 		This.open(CurProject.id);
// 	}


// 	function enableFeaturesByPermissions() {
// 		This.HTML.addTagButton.classList.remove("hide");
// 		Menu.enableAllOptions();

// 		if (!CurProject.users.Self.permissions.tags.remove) Menu.options[0].disable();
// 		if (!CurProject.users.Self.permissions.tags.update) Menu.options[1].disable();
// 		if (!CurProject.users.Self.permissions.tags.update) This.HTML.addTagButton.classList.add("hide");
// 	}
// }






function _Popup_createTagMenu() {
	let This = this;

	PopupComponent.call(this, {
		content: [
			new InputField({placeHolder: "Tag title", maxLength: 256}),
			new VerticalSpace({height: 20}),
			new OptionSelector(),
			new VerticalSpace({height: 40}),
			new Button({
				onclick: function () {This.createTag()},
				filled: true,
			}),
			new Button({
				title: "Cancel",
				onclick: function () {This.close()},
			})
		],
		onOpen: onOpen,
		onClose: onClose,
	});

	let createButton 	= this.content[4];
	let tagTitleInput 	= this.content[0];
	let optionMenu 		= this.content[2];
	setColorMenuOptions();


	let CurProject = false;
	let EditData = {tag: false}

	async function onOpen(_openResolver, _projectId, _tagName = null) {
		updateMenuModeText();
		tagTitleInput.setValue(_tagName);
		tagTitleInput.focus();

		CurProject = await Server.getProject(_projectId);
		if (!CurProject) return This.close(false);
	}

	this.openEdit = function(_tag, _projectId) {
		let onclosePromise = this.open(_projectId, _tag.title);
		
		EditData.tag = _tag;
		if (!EditData.tag) return;
		selectTagColorOption(EditData.tag);

		return onclosePromise;
	}

	function selectTagColorOption(_tag) {
		let tagColour = _tag.colour.toRGBA();
		for (let i = 0; i < optionMenu.options.length; i++)
		{	
			let curColour = optionMenu.options[i].value.colour.toRGBA();
			if (curColour != tagColour) continue;
			optionMenu.options[i].select();
			return;
		}
	}

	function setColorMenuOptions() {
		for (colour of COLOUR.list)
		{
			optionMenu.addOption({
				title: colour.name,
				value: colour,
				icon: MainContent.taskPage.renderer.createTagCircle(colour)
			})
		}
	}



	function onClose(openResolver, _tag) {
		try {
			openResolver(_tag);
		} catch (e) {}
		
		optionMenu.closePopup();
		EditData.tag = false;
	}

	function updateMenuModeText() {
		if (EditData.tag)
		{
			createButton.setTitle("Edit");
			This.setTitle("Edit tag");
			return;
		}

		createButton.setTitle("Create");
		This.setTitle("Create tag");
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
			id: 		newId(),
			title: 		tagTitleInput.getValue().replace(/^\s+|\s+$/g, ''),
			colour: 	optionMenu.value.colour.toHex()
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
}




























function _Popup_tagMenu() {
	let This = this;

	PopupComponent.call(this, {
		title: "Manage tags",
		content: [
			new Text({text: "Tags", isHeader: true}),
			new ItemList(),
			new VerticalSpace({height: 10}),
			new Button({
				title: "+ Add Tag",
				onclick: async function () {
					This.close();
					await Popup.createTagMenu.open(CurProject.id);
					This.open(CurProject.id);
				},
				floatLeft: true,
			}),
			new VerticalSpace({height: 30}),
			new Button({
				title: "Close",
				onclick: function () {This.close()},
				filled: true,
			})
		],
		onOpen: onOpen
	})

	let addTagButton = this.content[3];
	let itemList = this.content[1];

	const Menu = OptionMenu.create(1001);	
	Menu.addOption("Remove", async function () {
		if (!CurTag) return;
		let result = await CurProject.tags.remove(CurTag.id);

		This.open(CurProject.id);
		return result;
	}, "images/icons/removeIcon.png");

	Menu.addOption("Edit", openTagEditMenu, "images/icons/changeIconDark.png");


	
	let CurTag = false;
	let CurProject = false;
	
	async function onOpen(_openResolver, _projectId) {
		CurProject = await Server.getProject(_projectId);
		if (!CurProject) return;

		setTagList(await CurProject.tags.getAll(true));

		enableFeaturesByPermissions();	
	}

	function setTagList(_tags) {
		itemList.removeAllItems();
		for (tag of _tags) itemList.addItem({
			title: tag.title,
			icon: MainContent.taskPage.renderer.createTagCircle(tag),
			value: tag,
			onclick: function(item, event, isDoubleClick) {
				CurTag = tag;
				if (isDoubleClick) return openTagEditMenu();
				Menu.open(item.HTML.optionIcon, {left: -20, top: 10});
			}
		});
	}


	async function openTagEditMenu() {
		if (!CurTag) return;
		if (!CurProject.users.Self.permissions.tags.update) return;
		This.close();
		
		await Popup.createTagMenu.openEdit(CurTag, CurProject.id);
		This.open(CurProject.id);
	}


	function enableFeaturesByPermissions() {
		addTagButton.enable();
		Menu.enableAllOptions();

		if (!CurProject.users.Self.permissions.tags.remove) Menu.options[0].disable();
		if (!CurProject.users.Self.permissions.tags.update) Menu.options[1].disable();
		if (!CurProject.users.Self.permissions.tags.update) addTagButton.disable();
	}
}

