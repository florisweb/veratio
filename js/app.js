



const OptionMenu  = new _OptionMenu();
const Popup       = new _Popup();
var App           = new _app();
var SideBar       = new _SideBar();
var MainContent   = new _MainContent();


function _app() {

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



  this.update = async function() {
    await Server.sync();
    SideBar.projectList.fillProjectHolder();
    
    switch (MainContent.curPage.name)
    {
      case "settings": MainContent.settingsPage.open(MainContent.curProjectId); break;
      default: MainContent.taskPage.reopenCurTab(); break;
    }
  }








  this.promptAuthentication = function() {
    window.location.replace("/user/login.php?redirect=/git/veratio");
  }
}



window.onload = async function() {
  console.warn("Start loading..."); 
  await App.setup();
  console.warn("App loaded!");
}


