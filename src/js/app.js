



var App           = new _app();
var SideBar       = new _SideBar();
var MainContent   = new _MainContent();
const Popup       = new _Popup();

function _app() {
  this.setup = async function() {
    installServiceWorker();
    await LocalDB.setup();

    let cachedOperations = await LocalDB.getCachedOperationsCount();
    if (cachedOperations) await LocalDB.sendCachedOperations();
    Server.onReConnect() // Don't await, so it can sync in the background as to not keep the user waiting
    
    document.body.addEventListener("keydown", function(_e) {
      KEYS[_e["key"]] = true;
      let preventDefault = KeyHandler.handleKeys(KEYS, _e);
      if (preventDefault) _e.preventDefault();
    });

    document.body.addEventListener("keyup", function(_e) {
      KEYS[_e["key"]] = false;
    });

    document.body.addEventListener("click", function(_e) {
      if (isDescendant($("#mainContentHolder .optionMenuHolder")[0], _e.target))              return;
      if (isDescendant($(".functionItem.optionIcon"), _e.target))                             return;
      if (isDescendant($("#mainContentHolder .optionMenuHolder.searchOption")[0], _e.target)) return;
      if (isDescendant($(".todoItem.createTaskHolder .rightHand"), _e.target))                return;
      if (_e.target.classList.contains("clickable"))                                          return;
      
      MainContent.optionMenu.close();
      MainContent.searchOptionMenu.hide();
    });

    await this.update();
    SideBar.projectList.open();

    setTimeout(function () {
      document.body.classList.remove("appLoading");
    }, 150);
    setTimeout(function () {
      SideBar.messagePopup.showLatestMessage();
    }, 700);
  }

  function installServiceWorker() {
    if (!('serviceWorker' in navigator)) return alert('oops, you don\'t have serviceworkers enabled');
    navigator.serviceWorker.register('serviceWorker.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  }



  this.update = async function() {
    MainContent.startLoadingAnimation();
    await SideBar.projectList.fillProjectHolder();

    switch (MainContent.curPage.name)
    {
      case "settings":  MainContent.settingsPage.open(MainContent.curProjectId);  break;
      default:          MainContent.taskPage.reopenCurTab();                      break;
    }
    MainContent.stopLoadingAnimation();
  }







  this.promptAuthentication = function() {
    window.location.replace("https://florisweb.tk/user/login.php?APIKey=veratioV1.3");
  }
}



window.onload = async function() {
  console.warn("Start loading..."); 
  // await App.setup();
  console.warn("App loaded!");
}






