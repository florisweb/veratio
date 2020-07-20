

function _SideBar() {
	const HTML = {
		todayTab: $("#sideBar .tab")[0],
		weekTab: $("#sideBar .tab")[1],
	}

	this.projectList = new _SideBar_projectList();


	this.updateTabIndicator = async function() {
		if (MainContent.settingsPage.isOpen()) return await setProjectTabOnOpenById(MainContent.curProjectId);
	
		switch (MainContent.taskPage.curTab.name)
		{
			case "today": setTabOpenIndicator(HTML.todayTab); break;
			case "week": setTabOpenIndicator(HTML.weekTab); break;
			default: await setProjectTabOnOpenById(MainContent.curProjectId); break;
		}
	}
	

	async function setProjectTabOnOpenById(_id) {
		let tabs = $("#sideBar .tab.projectTab");
		let projectList = await Server.getProjectList();
		for (let i = 0; i < projectList.length; i++)
		{
			if (projectList[i].id != _id) continue;
			setTabOpenIndicator(tabs[i]);
			return;
		}
	}

	function setTabOpenIndicator(_targetObj) {
		let curOpenTab = $("#sideBar .tab.tabOpen")[0];
		if (curOpenTab) curOpenTab.classList.remove("tabOpen");

		_targetObj.classList.add("tabOpen");
	}
}


function _SideBar_projectList() {
	let HTML = {
		projectList: $("#sideBar .projectListHolder .projectList")[0],
		projectsHolder: $("#sideBar .projectListHolder .projectList")[0].children[0],
		dropDownIcon: $(".projectListHolder .header .dropDownButton")[0],
	}
	

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
		HTML.projectsHolder.innerHTML = "";
		let projects = await Server.getProjectList();
		for (project of projects) createProjectHTML(project);
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








