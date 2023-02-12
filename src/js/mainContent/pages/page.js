
function MainContent_page(_config) {
	this.name = _config.name;
	let onOpen = _config.onOpen;
	this.settings = {
		index: _config.index
	}

	const HTML = {
		pages: $("#mainContent .mainContentPage"),
		mainContent: mainContent
	}

	this.isOpen = function() {return this.name == MainContent.curPage.name}

	this.open = async function(_curProject = MainContent.curProject) {
		HTML.mainContent.classList.add("loading");

		resetPage();
		
		MainContent.curPage			= this;
		MainContent.curProject 		= _curProject;

		openPageByIndex(this.settings.index);
		MainContent.header.showItemsByPage(this.name);

		onOpen(_curProject);

		await SideBar.updateTabIndicator();
		setTimeout('mainContent.classList.remove("loading");', 100);
	}

	
	function openPageByIndex(_index) {
		for (let i = 0; i < HTML.pages.length; i++) if (i != _index) HTML.pages[i].classList.add("hide");
		HTML.pages[parseInt(_index)].classList.remove("hide");
	}

	function resetPage() {
		MainContent.optionMenu.close();
	}
}