







function MainContent_plannerPage() {
	MainContent_page.call(this, {
		name: "planner",
		index: 2,
		onOpen: onOpen
	});

	let This = this;

	async function onOpen() {
		MainContent.header.showItemsByPage("planner");
		MainContent.header.setTitleIcon('planner');
		MainContent.header.setTitle("Planner");
		MainContent.header.setMemberList([]);
	}
}




