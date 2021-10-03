

function _MainContent_header() {
	let HTML = {
		mainContent: 	mainContent,
		Self: 			$("#mainContentHeader .header")[0],
		titleIcon: 		$("#mainContentHeader .titleIcon.icon")[0],
		titleHolder: 	$("#mainContentHeader .header.titleHolder")[0],
		memberList: 	$("#mainContentHeader .functionHolder .memberList")[0],
		optionIcon: 	$("#mainContentHeader .functionItem.icon.clickable")[0],
		functionItems: 	$("#mainContentHeader .functionHolder > .functionItem"),
	}

	this.optionMenu = new function() {
		let Menu = OptionMenu.create();

		Menu.addOption(
			"Settings", 
			function () {
				MainContent.settingsPage.open(MainContent.curProject);
				return true;
			}, 
			"images/icons/memberIcon.png"
		);
		Menu.addOption(
			"Manage Tags", 
			function () {
				Popup.tagMenu.open(MainContent.curProject);
				return true;
			}, 
			"images/icons/tagIcon.png"
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
				Popup.renameProjectMenu.open(MainContent.curProject);
				return true;
			}, 
			"images/icons/changeIconDark.png"
		);


		this.open = async function() {
			Menu.enableAllOptions();

			if (!MainContent.curProject.users.Self.permissions.project.remove || !Server.connected)	Menu.options[3].disable();
			if (!MainContent.curProject.users.Self.permissions.project.rename)						Menu.options[4].disable();

			return Menu.open(HTML.optionIcon, {top: 45});
		}

		this.openState 	= Menu.openState;
		this.close 		= Menu.close;
		
		HTML.optionIcon.onclick = this.open;
	}


	DoubleClick.register(HTML.titleHolder, function() {
		if (!MainContent.curProject || !MainContent.curProject.users.Self.permissions.project.rename) return false;
		Popup.renameProjectMenu.open(MainContent.curProject);
	});



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
			case "planner":
			break;
			case "taskpage - today":
			break;
			case "taskpage - week":
			break;
			default: //taskPage - project
				HTML.functionItems[0].classList.remove("hide");
				HTML.functionItems[2].classList.remove("hide");
				HTML.functionItems[3].classList.remove("hide");
			break;
		}
	}


	let prevTitleIcon = "today";
	let titleIconLoading = false;
	this.setTitleIcon = function(_type) {
		if (_type && _type != 'loading' && _type != 'finishedLoading') prevTitleIcon = _type;
		if (_type == 'finishedLoading') titleIconLoading = false;
		if (titleIconLoading) return;

		HTML.titleIcon.classList.remove('projectIcon');
		HTML.titleIcon.classList.remove('settingsIcon');
		switch (_type) 
		{
			case 'project':
				HTML.titleIcon.classList.add('projectIcon');
				HTML.titleIcon.setAttribute('src', 'images/icons/projectIconDark.svg');
			break;
			case 'week':
				HTML.titleIcon.setAttribute('src', 'images/icons/weekIconDark.png');
			break;
			case 'today':
				HTML.titleIcon.setAttribute('src', 'images/icons/todayIconDark.png');
			break;
			case 'settings':
				HTML.titleIcon.classList.add('settingsIcon');
				HTML.titleIcon.setAttribute('src', 'images/icons/memberIcon.png');
			break;
			case 'loading':
				titleIconLoading = true;
				HTML.titleIcon.setAttribute('src', 'images/loadingDark.gif');
			break;
			case 'finishedLoading':
				this.setTitleIcon(prevTitleIcon);
			break;
		}
	}



	this.setTitle = function(_title) {
		setTextToElement(HTML.titleHolder, _title);
	}

	this.setMemberList = function(_members) {
		setTextToElement(
			HTML.memberList, 
			TextFormater.memberListToString(_members, 20)
		);
	}


	function hideAllFunctionItems() {
		for (let item of HTML.functionItems) item.classList.add("hide");
	}
}