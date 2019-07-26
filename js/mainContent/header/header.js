

function _MainContent_header() {
	let HTML = {
		mainContent: mainContent,
		Self: $("#mainContentHeader .header")[0],
		titleHolder: $("#mainContentHeader .header.titleHolder")[0],
		memberList: $("#mainContentHeader .functionHolder .memberList")[0],
		optionIcon: $("#mainContentHeader .functionItem.icon.clickable")[0],
		functionItems: $("#mainContentHeader .functionHolder > .functionItem"),
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

		Menu.addOption(
			"Remove project", 
			function () {
				MainContent.removeCurrentProject()
				return true;
			}, 
			"images/icons/removeIcon.png"
		);
		Menu.addOption(
			"Rename project", 
			function () {
				MainContent.openRenameProjectMenu();
				return true;
			}, 
			"images/icons/changeIconDark.png"
		);


		this.open = function() {
			let project = Server.getProject(MainContent.curProjectId);
			
			Menu.enableAllOptions();
			if (!project.users.Self.projectActionAllowed("remove")) 		Menu.options[2].disable();
			if (!project.users.Self.projectActionAllowed("rename"))	Menu.options[3].disable();

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



	this.showItemsByPage = function(_pageName) {
		hideAllFunctionItems();
		switch (_pageName.toLowerCase()) 
		{
			case "settings":
				HTML.functionItems[0].classList.remove("hide");
				HTML.functionItems[1].classList.remove("hide");
			break;
			case "createproject":
				HTML.functionItems[1].classList.remove("hide");
			break;
			case "taskpage - today": //taskPage
			break;
			case "taskpage - inbox": //taskPage
			break;
			default: //taskPage - project
				HTML.functionItems[0].classList.remove("hide");
				HTML.functionItems[2].classList.remove("hide");
				HTML.functionItems[3].classList.remove("hide");
			break;
		}
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


	function hideAllFunctionItems() {
		for (item of HTML.functionItems)
		{
			item.classList.add("hide");
		}
	}
}