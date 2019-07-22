

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
			"Members", 
			function () {
				MainContent.memberPage.open(MainContent.projectId);
				return true;
			}, 
			"images/icons/memberIcon.png"
		);
		Menu.addOption(
			"Leave project", 
			function () {
				let project = Server.getProject(MainContent.curProjectId);
				project.leave();
				MainContent.taskPage.tab.open("Inbox");
				App.update();
				return true;
			}, 
			"images/icons/memberIcon.png"
		);


		this.open = function() {
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