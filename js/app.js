



const OptionMenu  = new _OptionMenu();
var App           = new _app();
var SideBar       = new _SideBar();
var MainContent   = new _MainContent();


function _app() {
	this.update = async function() {
		await Server.sync();
    SideBar.projectList.fillProjectHolder();
    
    switch (MainContent.curPage.name)
    {
      case "settings": MainContent.settingsPage.open(MainContent.curProjectId); break;
      default: MainContent.taskPage.reopenCurTab(); break;
    }
	}

  // All request-inteceptor to detect authentication-loss
  let REQUEST_send = REQUEST.send;
  REQUEST.send = function(_url, _paramaters, _maxAttempts) {
    return new Promise(async function (resolve, error) {
      let result = await REQUEST_send(_url, _paramaters, _maxAttempts);
      
      if (result == "E_noAuth") App.promptAuthentication();
      resolve(result);
    });
  }

  this.promptAuthentication = function() {
    window.location.replace("/user/login.php?redirect=/git/veratio");
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




  this.setup = async function() {
    document.body.addEventListener("keydown", function(_e) {
      KEYS[_e["key"]] = true;
      let preventDefault = KeyHandler.handleKeys(KEYS, _e);
      if (preventDefault) _e.preventDefault();
    });

    document.body.addEventListener("keyup", function(_e) {
      KEYS[_e["key"]] = false;
    });

    document.body.addEventListener("click", function(_e) {
      if (isDescendant($("#mainContentHolder .optionMenuHolder")[0], _e.target)) return;
      if (isDescendant($(".functionItem.optionIcon"), _e.target)) return;
      if (isDescendant($("#mainContentHolder .optionMenuHolder.searchOption")[0], _e.target)) return;
      if (isDescendant($(".todoItem.createTaskHolder .rightHand"), _e.target)) return;
      
      if (_e.target.classList.contains("clickable")) return;
      
      MainContent.optionMenu.close();
      MainContent.searchOptionMenu.hide();
    });
    

    await this.update();

    SideBar.projectList.open();
    setTimeout('document.body.classList.remove("appLoading");', 300);
  }

}



window.onload = async function() {
  console.warn("Start loading..."); 
  await App.setup();
  console.warn("App loaded!");
}


