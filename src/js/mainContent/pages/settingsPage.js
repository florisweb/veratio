

function MainContent_settingsPage() {
	MainContent_page.call(this, {
		name: "settings",
		index: 1,
		onOpen: onOpen
	});

	let This = this;
	
	let HTML = {
		Self: $(".mainContentPage.settingsPage")[0],
		memberHolder: $(".mainContentPage.settingsPage .memberHolder")[0],
		inviteHolder: $(".mainContentPage.settingsPage .inviteMemberHolder")[0],
	}
	
	this.permissionData = [
		{name: "Read-only", description: "Can't do anything except finish tasks assigned to them.", 										icon: "images/icons/projectIconDark.svg"},
		{name: "Member", 	description: "Can do everthing except user-related actions, like inviting someone and changing permissions.", 	icon: "images/icons/memberIcon.png"},
		{name: "Admin", 	description: "Allowed to do everthing except removing the project.", 											icon: "images/icons/adminIcon.png"},
		{name: "Owner", 	description: "Allowed to do everthing.", 																		icon: "images/icons/ownerIconDark.png"}
	 ];




	function onOpen(_project) {
		if (!_project) _project = Server.projectList[0];
		
		HTML.inviteHolder.classList.add("hide");

		MainContent.header.setTitle("Settings - " + _project.title);
		MainContent.header.setTitleIcon('settings');

		if (_project.users.self.permissions.users.invite) HTML.inviteHolder.classList.remove("hide");
		This.setMemberItemsFromList(_project.users.list);
	}




	this.inviteUserByLink = async function() {
		let result = await MainContent.curProject.users.inviteByLink();
		if (result === false) return console.error("An error accured while inviting a user:");

		Popup.inviteByLinkCopyMenu.open(window.location.href.split('?')[0] + "?link=" + result.id);
		This.open(MainContent.curProject);
	}


	this.setMemberItemsFromList = function(_memberList) {
		HTML.memberHolder.innerHTML = '<div class="text header">Members (' + _memberList.length + ')</div>';
		for (let member of _memberList) this.addMemberItem(member);
	}


	this.addMemberItem = function(_member) {
		let html = createMemberItemHtml(_member);
		HTML.memberHolder.append(html);
	}

	
	function createMemberItemHtml(_member) { 
		let html = document.createElement("div");
		html.className = "listItem memberItem";
		if (_member.self) html.classList.add("isSelf");
		
		html.innerHTML = '<img class="mainIcon icon" src="images/icons/memberIcon.png">' + 
						'<div class="titleHolder userText text">Dirk@dirkloop.com</div>' +
						'<div class="rightHand">' + 
							'<img src="images/icons/optionIcon.png" class="rightHandItem optionIcon onlyShowOnItemHover icon clickable">' +
							'<div class="rightHandItem text"></div>' + 
						'</div>';

		if (_member.type == "invite") 	html.children[0].setAttribute("src", "images/icons/inviteIconDark.png");
		if (_member.type == "link") 	html.children[0].setAttribute("src", "images/icons/linkIconDark.png");
		if (_member.permissions === 3)	html.children[0].setAttribute("src", "images/icons/ownerIconDark.png");

		
		setTextToElement(html.children[1], _member.name);
		setTextToElement(html.children[2].children[1], This.permissionData[parseInt(_member.permissions)].name);
		DoubleClick.register(html.children[2].children[1], function () {
			if (!MainContent.curProject.users.self.permissions.users.changePermissions(_member)) return false;
			Popup.permissionMenu.open(_member.id);
		})

		html.children[2].children[0].onclick = function () {
			MainContent.settingsPage.optionMenu.open(html.children[2].children[0]);
		}


		DOMData.set(html, _member.id);
		return html;
	}




	this.optionMenu = new function() {
		let Menu = OptionMenu.create();
		let curItem = "";
		let curMemberId = "";	

		Menu.addOption(
			"Remove user", 
			async function () {
				if (!curMemberId) return false;
				let member = await MainContent.curProject.users.get(curMemberId);
				if (!member) return;


				let actionValidated = await Popup.showMessage({
					title: "Remove " + member.name + "?", 
					text: "Are you sure you want to remove " + member.name + " from " + MainContent.curProject.title + "?",
					buttons: [
						{title: "Remove", value: true, filled: true, color: COLOUR.DANGEROUS}, 
						{title: "Cancel", value: false}
					]
				});

				if (!actionValidated) return;

				let removed = await MainContent.curProject.users.remove(curMemberId);
				if (removed) curItem.classList.add("hide");
				return removed;
			}, 
			"images/icons/removeIcon.png"
		);

		Menu.addOption(
			"Change permissions", 
			function () {
				Popup.permissionMenu.open(curMemberId);
				return true;
			}, 
			"images/icons/changeIconDark.png"
		);

		this.open = async function(_target) {
			curItem 		= _target.parentNode.parentNode;
			curMemberId 	= DOMData.get(curItem);
			
			let member 		= await MainContent.curProject.users.get(curMemberId);

			Menu.enableAllOptions();
			if (!MainContent.curProject.users.self.permissions.users.remove(member))				Menu.options[0].disable();
			if (!MainContent.curProject.users.self.permissions.users.changePermissions(member)) 	Menu.options[1].disable();

			return Menu.open(_target, {left: -75, top: 30});
		}

		this.openState 	= Menu.openState;
		this.close 		= Menu.close;
	}
}












function MainContent_plannerPage() {
	MainContent_page.call(this, {
		name: "planner",
		index: 2,
		onOpen: onOpen
	});

	let This = this;

	async function onOpen() {
		MainContent.header.showItemsByPage("planner");
		MainContent.header.setTitleIcon('planner');
		MainContent.header.setTitle("Planner");
		MainContent.header.setMemberList([]);
	}
}




