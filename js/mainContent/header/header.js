console.warn("js/mainContent/header.js: loaded");


function _MainContent_header() {
	let HTML = {
		self: $("#mainContentHeader .header")[0],
		titleHolder: $("#mainContentHeader .header.titleHolder")[0],
		memberList: $("#mainContentHeader .functionHolder .memberList")[0]
	}


	this.hide = function() {
		HTML.self.classList.add("hide");
	}
	
	this.show = function() {
		HTML.self.classList.remove("hide");
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