

function _SideBar() {
	const HTML = {
		todayTab: $("#sideBar .tab")[0],
		weekTab: $("#sideBar .tab")[1],
	}

	this.projectList = new _SideBar_projectList();

	this.noConnectionMessage = new _SideBar_noConnectionMessage();

	this.updateTabIndicator = async function() {
		if (MainContent.settingsPage.isOpen()) return await setProjectTabOnOpenById(MainContent.curProjectId);
	
		switch (MainContent.taskPage.curTab.name)
		{
			case "today": 		setTabOpenIndicator(HTML.todayTab); 						break;
			case "week": 		setTabOpenIndicator(HTML.weekTab); 							break;
			default: 			await setProjectTabOnOpenById(MainContent.curProjectId); 	break;
		}
	}
	

	async function setProjectTabOnOpenById(_id) {
		let tabs = $("#sideBar .tab.projectTab");
		for (let i = 0; i < SideBar.projectList.projects.length; i++)
		{
			if (SideBar.projectList.projects[i].id != _id) continue;
			setTabOpenIndicator(tabs[i]);
			return;
		}
	}

	function setTabOpenIndicator(_targetObj) {
		let curOpenTab = $("#sideBar .tab.tabOpen")[0];
		if (curOpenTab) curOpenTab.classList.remove("tabOpen");

		_targetObj.classList.add("tabOpen");
	}



	this.messagePopup = new function() {
		let This = this;
		let popupHolder = $(".messageHolder.popupHolder")[0];

		this.curPopup;

		let newVersionMessage = {
			title: "Version 1.3", 
			content: [
				new Text({text: "Changelog", isHeader: true}),
				new VerticalSpace({height: 5}),
				new Text({text: "- Offline functionallity"}),
				new LineBreak(),
				new Text({text: "- Redesigned the invitesystem"}),
				new LineBreak(),
				new Text({text: "- Improved the create-taskmenu"}),
				new LineBreak(),
				new Text({text: "- A lot of small bug fixes and minor improvements."}),
				new VerticalSpace({height: 25}),
				new Button({title: "Close", filled: true, onclick: function() {
					SideBar.messagePopup.close();
				}}),
				new Button({title: "Full changelog", onclick: function() {
					SideBar.messagePopup.close();
					window.open("https://florisweb.tk");
				}}),
				new VerticalSpace({height: -20}),
			]
		};
		

		let welcomeMesage = {
			title: "Welcome", 
			content: [
				new Text({text: "Thank you for using veratio", isHeader: true}),
				new VerticalSpace({height: 5}),
				new Text({text: "Veratio is under active development, see the changelog for more information."}),
			
				new VerticalSpace({height: 30}),
				new Button({title: "Close", filled: true, onclick: function() {
					SideBar.messagePopup.close();
				}}),
				new Button({title: "Full changelog", onclick: function() {
					SideBar.messagePopup.close();
					window.open("https://florisweb.tk");
				}}),
				new VerticalSpace({height: -20}),
			]
		};

		let linkUserMessage = {
			title: "Bind Account", 
			content: [
				new Text({text: "You are using a link to access veratio", isHeader: true}),
				new VerticalSpace({height: 5}),
				new Text({text: "When you lose that link you can't access your projects anymore, bind these projects to an account to be able to access them anywhere."}),
			
				new VerticalSpace({height: 25}),
				new Button({title: "Bind Account", filled: true, onclick: function() {
					SideBar.messagePopup.close();
					if (!LinkUser.link) return;
					window.location.replace("invite/join.php?link=" + LinkUser.link);
				}}),
				new VerticalSpace({height: -20}),
			]
		};

		this.showPopup = function(_popupConfig) {
			let popup = new PopupComponent(_popupConfig);
			popupHolder.classList.add("hide");
			popupHolder.innerHTML = "";

			document.body.removeChild(popup.HTML.popupHolder)
			popupHolder.appendChild(popup.HTML.popup);
			popup.HTML.popupHolder = popupHolder;
			popup.close();

			this.curPopup = popup;

			return new Promise(function (resolve) {
				setTimeout(async function () {
					resolve(await popup.open());
				}, 1);
			})
		}

		this.close = function() {
			this.curPopup.close();
			setTimeout(function () {SideBar.messagePopup.showLatestMessage();}, 200);
		}
		

		const curMessageIndex = 3;
		this.showLatestMessage = function() {
			let isNewUser = !localStorage.getItem("hasSeenWelcomeMessage");
			localStorage.setItem("hasSeenWelcomeMessage", true);
			if (isNewUser) return this.showPopup(welcomeMesage);
			
			let messageIndex = parseInt(localStorage.getItem("messageIndex"));
			if (messageIndex < curMessageIndex || isNaN(messageIndex)) 
			{   
				localStorage.setItem("messageIndex", curMessageIndex);
				this.showPopup(newVersionMessage);
				return;
			}

			if (!LinkUser.link) return;
			this.showPopup(linkUserMessage);
		}
	};
}





function _SideBar_projectList() {
	let HTML = {
		projectList: $("#sideBar .projectListHolder .projectList")[0],
		projectsHolder: $("#sideBar .projectListHolder .projectList")[0].children[0],
		dropDownIcon: $(".projectListHolder .header .dropDownButton")[0],
	}
	this.projects = [];

	this.openState = true;
	this.toggleOpenState = function() {
		if (this.openState) return this.close();
		this.open();
	}


	this.open = function() {
		this.openState = true;
		HTML.dropDownIcon.classList.remove("close");
		HTML.projectList.classList.remove("hide");
	}

	this.close = function() {
		this.openState = false;
		HTML.dropDownIcon.classList.add("close");
		HTML.projectList.classList.add("hide");
	}


	this.fillProjectHolder = async function() {
		this.projects = await Server.getProjectList(true);
		HTML.projectsHolder.innerHTML = "";
		for (let project of this.projects) createProjectHTML(project);
	}

	function createProjectHTML(_project) {
		if (!_project) return;
		let html = document.createElement("div");
		html.className = "header small clickable tab projectTab";
		html.innerHTML = '<img src="images/icons/projectIcon.png" class="headerIcon">' +
						 '<div class="headerText userText"></div>';

		setTextToElement(html.children[1], _project.title);
		html.onclick = function() {MainContent.taskPage.projectTab.open(_project.id);}

		HTML.projectsHolder.append(html);
	}
}





function _SideBar_noConnectionMessage() {
	const HTML = {
		subtext: $("#sideBar .noConnectionMessage")[0].children[1]
	};


	this.updateLocalChangesCount = async function() {
		let changes = await LocalDB.getCachedOperationsCount();

		let verbStart = "There are ";
		if (changes == 1) verbStart = "There is ";
		setTextToElement(HTML.subtext, verbStart + changes + " local change" + (changes != 1 ? "s" : "") + ".");
	}
}






