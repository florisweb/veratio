

function _SideBar() {
	const HTML = {
		todayTab: 		$("#sideBar .tab")[0],
		weekTab: 		$("#sideBar .tab")[1],
		plannerTab: 	$("#sideBar .tab")[2],
	}

	this.projectList = new _SideBar_projectList();

	this.noConnectionMessage = new _SideBar_noConnectionMessage();

	this.updateTabIndicator = function() {
		if (MainContent.settingsPage.isOpen()) return setProjectTabOnOpen(MainContent.curProject);
		if (MainContent.plannerPage.isOpen()) return setTabOpenIndicator(HTML.plannerTab);
	
		switch (MainContent.taskPage.curTab.name)
		{
			case "today": 		setTabOpenIndicator(HTML.todayTab);				break;
			case "week": 		setTabOpenIndicator(HTML.weekTab); 				break;
			default: 			setProjectTabOnOpen(MainContent.curProject); 	break;
		}
	}
	

	function setProjectTabOnOpen(_project) {
		let tabs = $("#sideBar .tab.projectTab");
		for (let i = 0; i < tabs.length; i++)
		{
			if (tabs[i].getAttribute('id') != _project.id) continue;
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
		const changeLogUrl = "https://github.com/florisweb/veratio/releases/tag/1.3";

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
					window.open(changeLogUrl);
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
					window.open(changeLogUrl);
				}}),
				new VerticalSpace({height: -20}),
			]
		};



		window.addEventListener('appinstalled', e => {
	      SideBar.messagePopup.close();
	      localStorage.setItem("hasSeenInstallMessage", true);
	    });


		let PWAInstallEvent;
		let installPWAMessage = {
			title: "App Available", 
			content: [
				new Text({text: "Veratio can be installed as an offline app", isHeader: true}),
				new VerticalSpace({height: 5}),
				new Text({text: "It will be available even without an internet connection."}),
			
				new VerticalSpace({height: 30}),
				new Button({title: "Install", filled: true, onclick: function() {
					PWAInstallEvent.prompt();
				}}),
				new Button({title: "Close", onclick: function() {
					SideBar.messagePopup.close();
					localStorage.setItem("hasSeenInstallMessage", true);
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


		this.showInstallPWAMessage = function(_installEvent) {
			let hasSeenInstallMessage = !!localStorage.getItem("hasSeenInstallMessage");
			if (hasSeenInstallMessage) return;

			PWAInstallEvent = _installEvent;
			this.showPopup(installPWAMessage);
		}
	};
}







function _SideBar_projectList() {
	const DropRegionId = 'SideBar.projectList.dropRegion';
	const HTML = {
		projectListHeader: 		$("#sideBar .projectListHolder .header")[0],
		dropDownIcon: 			$("#sideBar .projectListHolder .header .dropDownButton")[0],
		loadingIcon: 			$("#sideBar .projectListHolder .header .loadingIcon")[0],
		
		projectList: 			$("#sideBar .projectListHolder .projectList")[0],
		projectsHolder: 		$("#sideBar .projectListHolder .projectList")[0].children[0],
		createProjectButton: 	$("#sideBar .projectListHolder .projectList .createProjectButton")[0],
	}
	
	DragHandler.registerDropRegion(HTML.projectListHeader, true, DropRegionId);
	DragHandler.registerDropRegion(HTML.createProjectButton, false, DropRegionId);

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


	this.setLoadingIconStatus = function(_visible = false) {
		HTML.loadingIcon.classList.add('hide');
		if (!_visible) return;
		HTML.loadingIcon.classList.remove('hide');
	}


	this.silentRender = async function(_fromCache) {
		this.projects = await Server.getProjectList(_fromCache);

		HTML.projectsHolder.innerHTML = "";
		for (let project of this.projects) project.HTML = createProjectHTML(project);

		// Always preload the text from the localDB
		this.updateProjectInfo(true);
		if (!_fromCache) await this.updateProjectInfo(_fromCache);
	}

	this.quickFillProjectHolder = async function() {
		this.setLoadingIconStatus(true);
		await this.silentRender(true)
		this.silentRender(false).then(function () {
			SideBar.projectList.setLoadingIconStatus(false);
		});
	}

	this.fillProjectHolder = async function() {
		this.setLoadingIconStatus(true);
		await this.silentRender(true)
		await this.silentRender(false);
		this.setLoadingIconStatus(false);
	}

	this.updateProjectInfo = function(_fromCache) {
		let promises = [];
		for (let project of this.projects) 
		{
			promises.push(new Promise(async function(resolve) {
				let text = await getProjectInfoText(project, _fromCache);
				setTextToElement(project.HTML.children[2], text);
				resolve();
			}));
		}
		return Promise.all(promises);
	}
	
	async function getProjectInfoText(_project, _fromCache) {
		let tasks = await _project.getInstance(_fromCache).tasks.getByGroup({type: "toPlan", value: "*"});
		if (tasks.length == 0) return "";
		return tasks.length;
	}

	function createProjectHTML(_project) {
		if (!_project) return;
		let html = document.createElement("div");
		html.setAttribute('id', _project.id);
		html.className = "header small clickable tab projectTab";
		html.innerHTML = '<img src="images/icons/projectIcon.png" class="headerIcon">' +
						 '<div class="headerText userText"></div>' + 
						 '<div class="headerText projectInfoHolder"></div>';

		HTML.projectsHolder.append(html);
		html.onclick = function() {MainContent.taskPage.projectTab.open(_project);}
		setTextToElement(html.children[1], _project.title);
		DragHandler.register(html, onDrop, getListHolder, DropRegionId);

		return html;
	}

	function getListHolder() {
		return HTML.projectsHolder;
	}
	async function onDrop(_ownHTML, _curDropTarget, _itemHolder, _newIndex) {
		let project = await Server.getProject(_ownHTML.getAttribute('id'));
		if (!project) return;
		await project.moveToIndex(_newIndex);
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






