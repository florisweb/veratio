




const COLOR = {
  DANGEROUS: "rgb(220, 50, 4)",
  WARNING: "rgb(220, 135, 0)",
  POSITIVE: "rgb(0, 190, 60)",
}






var App = new _app();
var SideBar = new _SideBar();
var MainContent = new _MainContent();


function _app() {

	this.update = function() {
		Server.sync().then(
			function() {
				MainContent.menu.Main.page.reopenCurPage();
				SideBar.projectList.fillProjectHolder();
        SideBar.projectList.open();
			}, function() {}
		);
	}




  this.delimitMemberText = function(_members, _delimiter = 20) {
    if (!_members || !_members.length) return "";
    let defaultMemberText = _members[0].name;
    for (let i = 1; i < _members.length; i++) defaultMemberText += ", " + _members[i].name;

    let memberText = "";
    for (let m = 0; m < _members.length; m++)
    {
      if (memberText) memberText += ", ";
      memberText += _members[m].name;
      
      if (memberText.length <= _delimiter || m == _members.length - 1) continue;   
      let hiddenMemberCount = _members.length - m - 1;
      memberText += " and " + hiddenMemberCount + " other";
      if (hiddenMemberCount > 1) memberText += "s";

      break;
    }

    if (defaultMemberText.length <= memberText) return defaultMemberText;
    return memberText;
  }




  this.setup = function() {
    new _MainContent_todoHolder_dayItem(document.body).remove();
    this.update();

    document.body.addEventListener("keydown", function(_e) {
      KEYS[_e["key"]] = true;
      let preventDefault = KeyHandler.handleKeys(KEYS, _e);
      if (preventDefault) _e.preventDefault();
    });

    document.body.addEventListener("keyup", function(_e) {
      KEYS[_e["key"]] = false;
    });

    document.body.addEventListener("click", function(_e) {
      let close = true;
      if (isDescendant($("#mainContentHolder .optionMenuHolder")[0], _e.target)) close = false;
      if (isDescendant($(".functionItem.optionIcon"), _e.target)) close = false;
      if (isDescendant($("#mainContentHolder .optionMenuHolder.searchOption")[0], _e.target)) close = false;
      
      if (!close) return false;
      MainContent.optionMenu.close();
      MainContent.searchOptionMenu.hide();
    });
    
  }
}



App.setup();



