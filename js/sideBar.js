

function _SideBar() {
	this.projectList = new _SideBar_projectList();


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






	this.fillProjectHolder = function() {
		HTML.projectsHolder.innerHTML = "";
		for (let i = 0; i < Server.projectList.length; i++)
		{
			_createProjectHTML(Server.projectList[i]);
		}
	}

		function _createProjectHTML(_project) {
			if (!_project) return;
			let html = document.createElement("div");
			html.className = "header small clickable";
			html.innerHTML = '<img src="images/icons/projectIcon.png" class="headerIcon">' +
							 '<div class="headerText userText"></div>';

			setTextToElement(html.children[1], _project.title);
			html.onclick = function() {MainContent.menu.Main.page.open("Project", _project.id);}

			HTML.projectsHolder.append(html);
		}
}








