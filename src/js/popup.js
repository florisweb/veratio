

function _Popup() {
	let HTML = {
		notificationHolder: $("#notificationBoxHolder")[0],
		notifcationBox: $("#notificationBox")[0]
	}

	this.createProjectMenu 	 	= new _Popup_createProject();
	this.renameProjectMenu	  	= new _Popup_renameProject();
	this.permissionMenu 		= new _Popup_permissionMenu();
	this.inviteByLinkCopyMenu 	= new _Popup_inviteByLinkCopy();
	this.inviteByEmailMenu 		= new _Popup_inviteByEmail();
	this.tagMenu 				= new _Popup_tagManager();
	this.createTag 				= new _Popup_createTag();


	this.showMessage = function({title = "", text = "", buttons = []}) {
		return new Promise(function (resolve, error) {
			let content = [
				new Text({text: text}),
				new VerticalSpace({height: 25})
			];
			
			let openResolver;

			for (let i = 0; i < buttons.length; i++) 
			{
				let buttonConfig = buttons[i];
				buttonConfig.onclick = function () {openResolver(buttons[i].value); popup.close();};
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
				onOpen: function(_openResolver) {openResolver = _openResolver}
			});

			setTimeout(function () {resolve(popup.open())}, 1);
		});
	}
}





function _Popup_createProject() {
	let This = this;
	let inputField = new InputField({placeHolder: "Project title", maxLength: 256});
	PopupComponent.call(this, {
		title: "Create Project",
		content: [
			inputField,
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
	
	let openResolver;
	function onOpen(_openResolver, _title = null) {
		inputField.setValue(_title);
		inputField.focus();
		openResolver = _openResolver;
	}

	this.createProject = async function() {
		let title = inputField.getValue();
		if (!title || title.length < 2) 
		{
			await Popup.showMessage({title: "Invalid title", text: "Please enter a longer title for your project.", buttons: [{title: "close", filled: true}]})
			inputField.focus();
			return;
		}

		let project = await Server.createProject(title);
		if (!project || isError(project)) {return console.error("Something went wrong while creating a project:", project); this.close()}
		
		SideBar.projectList.fillProjectHolder();
		
		openResolver(project);		
		this.close();
	} 
}




function _Popup_inviteByLinkCopy() {
	let This = this;
	PopupComponent.call(this, {
		title: "Successfully created link",
		content: [
			new Text({text: "Copy and send this link to your invitee."}),
			new VerticalSpace({height: 5}),
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
		linkField.HTML.select();
	}
}


function _Popup_inviteByEmail() {
	let This = this;
	PopupComponent.call(this, {
		title: "Invite by email",
		content: [
			new Text({text: "Enter your invitees email-adress."}),
			new VerticalSpace({height: 5}),
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
		let response = await MainContent.curProject.users.inviteByEmail(email);
		if (response.error) 
		{
			switch (response.error)
			{
				case Errors.INVALID_EMAIL: return Popup.showMessage({title: "Invalid email", text: "Please enter a valid email-adress.", buttons: [{title: "close", filled: true}]}); break;
				case Errors.EMAIL_ALREADY_INVITED: Popup.showMessage({title: "Already invited", text: "An invite has already been send to this email-adress.", buttons: [{title: "close", filled: true}]}); break;
 				default: Popup.showMessage({title: "Error while inviting", text: "An error accured while trying to invite a user: " + response.error, buttons: [{title: "close", filled: true}]}); break;
 			}
		}
		
		This.close();
		MainContent.settingsPage.open(MainContent.curProject);
	}
}




function _Popup_renameProject() {
	const This = this;
	const inputField = new InputField({placeHolder: "Project title", maxLength: 256});
	PopupComponent.call(this, {
		title: "Rename project",
		content: [
			inputField,
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


	let curProject = false;
	async function onOpen(_openResolver, _project) {
		if (!_project) return false;
		curProject = _project;

		inputField.setPlaceHolder(curProject.title);
		inputField.setValue(curProject.title);
		inputField.focus();
	}	

	this.renameProject = async function() {
		let newTitle = inputField.getValue();
		if (!newTitle || newTitle.length < 3) 
		{
			await Popup.showMessage({title: "Invalid title", text: "Please enter a longer title for your project.", buttons: [{title: "close", filled: true}]});
			inputField.focus();
			return false;
		}

		curProject.rename(newTitle).then(async function () {
			This.close();
			App.update();
		});
	}
}




function _Popup_permissionMenu() {
	let This = this;

	PopupComponent.call(this, {
		title: "Change user permissions",
		content: [
			new Text({text: "Change ", isHeader: false}),
			new Text({text: "", isHighlighted: true, isHeader: true}),
			new Text({text: " permissions", isHeader: false}),
			new VerticalSpace({height: 10}),
			new OptionSelector({onValueChange: onValueChange}),
			new VerticalSpace({height: 45}),
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

	let memberNameHolder 	= this.content[1];
	let optionMenu 			= this.content[4];
	let descriptionHolder 	= this.content[6];

	
	function onValueChange(_newValue) {
		descriptionHolder.setText(
			MainContent.settingsPage.permissionData[parseInt(_newValue)].description
		);
	}

	

	let curMember = false;	
	async function onOpen(_openResolver, _memberId) {
		let member 	= await MainContent.curProject.users.get(_memberId);
		curMember 	= member;
		setMemberData(member);
	}


	function setMemberData(_member) {
		let possesiveUserName = _member.name + "'";
		if (_member.name.substr(_member.name.length - 1, 1) != 's') possesiveUserName += 's';
		memberNameHolder.setText(possesiveUserName);

		optionMenu.removeAllOptions();
		
		for (let i = MainContent.settingsPage.permissionData.length - 1; i >= 0; i--) 
		{
			if (i > MainContent.curProject.users.self.permissions.value) continue;

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
		await MainContent.curProject.users.update(curMember);
		curMember = false;

		This.close();
		MainContent.settingsPage.open(MainContent.curProject);
	}
}







function _Popup_createTag() {
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

	function onOpen(_openResolver, _project, _tagName = null) {
		updateMenuModeText();
		tagTitleInput.setValue(_tagName);
		tagTitleInput.focus();

		CurProject = _project
		if (!CurProject) return This.close(false);
	}

	this.openEdit = function(_tag, _project) {
		let onclosePromise = this.open(_project, _tag.title);
		
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
		for (let colour of COLOUR.list)
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
		if (typeof tag != "object") {
			if (tag == "E_tagNameAlreadyTaken")
			{
				await Popup.showMessage({title: "Name already taken", text: "There already exists a tag with that name, please choose another one.", buttons: [{title: "close", filled: true}]});
			} else if (tag == "E_invalidData")
			{
				await Popup.showMessage({title: "Invalid title", text: "Your tag's name is too short, please pick a longer one.", buttons: [{title: "close", filled: true}]});
			}
			tagTitleInput.focus();
			return;
		}

		tag = await CurProject.tags.update(tag);
		if (!tag) return console.error("Something went wrong while creating a tag:", tag);
		await CurProject.tags.fetchAll();
		this.close(await CurProject.tags.get(tag.id));
	} 
	

	async function scrapeTagData() {
		let tag = new Tag({
			id: 		newId(),
			title: 		tagTitleInput.getValue().replace(/^\s+|\s+$/g, ''),
			colour: 	optionMenu.value.colour.toHex()
		});

		if (EditData.tag) tag.id = EditData.tag.id;
		if (!tag.title || tag.title.length < 2 || !tag.colour) return "E_invalidData";
		if (
			await testIfTagTitleAlreadyExists(tag.title) && 
			(!EditData.tag || tag.title.toLowerCase() != EditData.tag.title.toLowerCase())
		) return "E_tagNameAlreadyTaken";

		return tag;
	}

	async function testIfTagTitleAlreadyExists(_tagTitle) {
		for (let tag of CurProject.tags.list) 
		{
			if (tag.title.toLowerCase() == _tagTitle.toLowerCase()) return true;
		}
		return false;
	}
}




























function _Popup_tagManager() {
	let This = this;

	PopupComponent.call(this, {
		title: "Manage tags",
		content: [
			new Text({text: "Tags", isHeader: true}),
			new VerticalSpace({height: 3}),
			new ItemList(),
			new Button({
				title: "+ Add Tag",
				onclick: async function () {
					This.close();
					await Popup.createTag.open(CurProject);
					This.open(CurProject);
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
	let itemList = this.content[2];

	const Menu = OptionMenu.create({zIndex: 1001});
	Menu.addOption("Remove", async function () {
		if (!CurTag) return;
		let result = await CurProject.tags.remove(CurTag.id);

		This.open(CurProject);
		return result;
	}, "images/icons/removeIcon.png");

	Menu.addOption("Edit", openTagEditMenu, "images/icons/changeIconDark.png");


	
	let CurTag = false;
	let CurProject = false;
	
	async function onOpen(_openResolver, _project) {
		CurProject = _project;
		if (!CurProject) return;

 		setTagList(await CurProject.tags.fetchAll());

		enableFeaturesByPermissions();	
	}

	function setTagList(_tags) {
		itemList.removeAllItems();
		for (let tag of _tags) itemList.addItem({
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
		if (!CurProject.users.self.permissions.tags.update) return;
		This.close();
		
		await Popup.createTag.openEdit(CurTag, CurProject);
		This.open(CurProject);
	}


	function enableFeaturesByPermissions() {
		addTagButton.enable();
		Menu.enableAllOptions();

		if (!CurProject.users.self.permissions.tags.remove) Menu.options[0].disable();
		if (!CurProject.users.self.permissions.tags.update) Menu.options[1].disable();
		if (!CurProject.users.self.permissions.tags.update) addTagButton.disable();
	}
}

