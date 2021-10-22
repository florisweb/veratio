



var App           = new _app();
var SideBar       = new _SideBar();
var MainContent   = new _MainContent();
const Popup       = new _Popup();

function _app() {

  this.setup = async function() {
    installServiceWorker();
    await LocalDB.setup();
    await Server.setup();

    let cachedOperations = await LocalDB.getCachedOperationsCount();
    if (cachedOperations) await LocalDB.sendCachedOperations();


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


    setTimeout(function () {
      document.body.classList.remove("appLoading");
    }, 150);
    setTimeout(function () {
      SideBar.messagePopup.showLatestMessage();
    }, 1000);
    

    MainContent.startLoadingAnimation();
    await SideBar.projectList.quickFillProjectHolder();   
    SideBar.projectList.open();
    await MainContent.taskPage.reopenCurTab();
    MainContent.stopLoadingAnimation();


    Server.onReConnect(); // Don't await, so it can sync in the background as to not keep the user waiting
  }

  function installServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('serviceWorker.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  }



  this.update = async function() {
    MainContent.curProject = await Server.getProject(MainContent.curProject.id, true);

    MainContent.startLoadingAnimation();
    await SideBar.projectList.fillProjectHolder();

    switch (MainContent.curPage.name)
    {
      case "settings":  MainContent.settingsPage.open(MainContent.curProject);    break;
      default:          MainContent.taskPage.reopenCurTab();                      break;
    }
    MainContent.stopLoadingAnimation();
  }







  this.promptAuthentication = function() {
    window.location.replace(SignInUrl);
  }
}


window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  SideBar.messagePopup.showInstallPWAMessage(e);
});

window.onload = async function() {
  console.warn("Start loading..."); 
  await App.setup();
  console.warn("App loaded!");
}



{
  window.onresize = function(_setup) {
    if (!_setup) return;

    // const viewPortH       = document.body.getBoundingClientRect().height;
    const windowH         = window.innerHeight;
    // const browserUiBarsH  = viewPortH - windowH;
    document.documentElement.style.setProperty('--window-height', windowH + 'px');
  }
  window.onresize(true);
}
