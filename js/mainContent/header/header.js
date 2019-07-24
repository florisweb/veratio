

function _MainContent_header() {
	let HTML = {
		mainContent: mainContent,
		Self: $("#mainContentHeader .header")[0],
		titleHolder: $("#mainContentHeader .header.titleHolder")[0],
		memberList: $("#mainContentHeader .functionHolder .memberList")[0],
		optionIcon: $("#mainContentHeader .functionItem.icon.clickable")[0]
	}

	this.optionMenu = new function() {
		let Menu = OptionMenu.create(HTML.mainContent);		

		Menu.addOption(
			"Settings", 
			function () {
				MainContent.settingsPage.open(MainContent.curProjectId);
				return true;
			}, 
			"images/icons/memberIcon.png"
		);
		Menu.addOption(
			"Leave project", 
			function () {
				MainContent.leaveCurrentProject();
				return true;
			}, 
			"images/icons/leaveIconDark.png"
		);
		// let leaveIcon = Menu.options[1].html.children[0];
		// leaveIcon.style.left = "2px";
		// leaveIcon.style.top = "3px";
		// leaveIcon.style.height = "13px";


		Menu.addOption(
			"Remove project", 
			function () {
				MainContent.removeCurrentProject()
				return true;
			}, 
			"images/icons/removeIcon.png"
		);


		this.open = function() {
			let project = Server.getProject(MainContent.curProjectId);
			
			Menu.enableAllOptions();
			if (!project.users.Self.projectActionAllowed("remove")) Menu.options[2].disable();

			return Menu.open(HTML.optionIcon, {top: 45});
		}

		this.openState 	= Menu.openState;
		this.close 		= Menu.close;
		
		HTML.optionIcon.onclick = this.open;
	}



	this.hide = function() {
		HTML.Self.classList.add("hide");
	}
	
	this.show = function() {
		HTML.Self.classList.remove("hide");
	}


	this.setTitle = function(_title) {
		setTextToElement(HTML.titleHolder, _title);
	}

	this.setMemberList = function(_members) {
		setTextToElement(
			HTML.memberList, 
			App.delimitMemberText(_members, 20)
		);
	}



}