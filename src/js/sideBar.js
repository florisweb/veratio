

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



	this.messagePopup = (function() {
		let popupHolder = $(".messageHolder.popupHolder")[0];

		let popup = new PopupComponent({
			title: "Version 1.3", 
			content: [
				new Text({text: "Changelog", isHeader: true}),
				new VerticalSpace({height: 5}),
				new Text({text: "- Offline functionallity"}),
				new LineBreak(),
				new Text({text: "- Assignees can now be removed from tasks."}),
				new LineBreak(),
				new Text({text: "- Planned-taskholders will now be collapsed by default."}),
				new LineBreak(),
				new Text({text: "- A lot of small bug fixes"}),
				new VerticalSpace({height: 30}),
				new Button({title: "Close", filled: true, onclick: function() {popup.close()}}),
				new Button({title: "Full changelog", onclick: function() {
					popup.close();
					window.open("https://florisweb.tk");
				}}),
				new VerticalSpace({height: -20}),
			]
		});

		document.body.removeChild(popup.HTML.popupHolder)
		popupHolder.appendChild(popup.HTML.popup);
		popup.HTML.popupHolder = popupHolder;
		popup.close();


		popup.showLatestMessage = function() {
			const curMessageIndex = 3;
			let messageIndex = parseInt(localStorage.getItem("messageIndex"));
			if (messageIndex >= curMessageIndex) return;
			    
			localStorage.setItem("messageIndex", curMessageIndex);
			this.open();
		}


		return popup;
	})();
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






