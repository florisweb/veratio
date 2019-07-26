

let KEYS = {};
let KeyHandler = new _KeyHandler();
function _KeyHandler() {
  let shortCuts = [
    {
      keys: ["n"], 
      event: function () {
        let list = MainContent.taskPage.taskHolder.list;
        for (item of list)
        {
          if (!item.createMenu.enabled) continue;
          return item.createMenu.open();
        }
      },
      ignoreIfInInputField: true
    },

    {
      keys: ["Escape"], 
      event: function () {
        if (MainContent.searchOptionMenu.openState)                         return MainContent.searchOptionMenu.hide(true);
        if (MainContent.optionMenu.openState)                               return MainContent.optionMenu.close();
        if (MainContent.taskPage.taskHolder.closeAllCreateMenus())          return true;
      },
      ignoreIfInInputField: false
    },

    {
      keys: ["Enter"], 
      event: function (_e) {
        if (MainContent.searchOptionMenu.openState)         return MainContent.searchOptionMenu.chooseFirstSearchItem();
        if (MainContent.curPageName == "createProject")     return MainContent.createProjectPage.createProject();
        
        if (_e.target == $("#RENAMEPROJECTValueHolder")[0]) return MainContent.renameProjectFromPopup();
        
        if (_e.target == inviteMemberInput)                 return MainContent.settingsPage.inviteUser();
        return MainContent.taskPage.taskHolder.createTask();
      },
      ignoreIfInInputField: false
    },





    {
      keys: ["i"], 
      event: function () {
          MainContent.taskPage.tab.open("Inbox");
      },
      ignoreIfInInputField: true
    },
    {
      keys: ["t"], 
      event: function () {
          MainContent.taskPage.tab.open("Today");
      },
      ignoreIfInInputField: true
    },
    {
      keys: ["r"], 
      event: function () {
          App.update();
      },
      ignoreIfInInputField: true
    },

    {
      keys: ["l"], 
      event: function () {
          let item = $("#mainContentHolder .loadMoreButton")[0];
          if (inArray(item.classList, "hide")) return;
          item.click();
      },
      ignoreIfInInputField: true
    },
  ]


  this.handleKeys = function(_keyArr, _event) {
    let inInputField = _event.target.type == "text" || _event.target.type == "textarea" ? true : false;

    for (let i = 0; i < shortCuts.length; i++)
    {
      let curShortcut = shortCuts[i]; 
      if (curShortcut.ignoreIfInInputField && inInputField) continue;

      let succes = true;
      for (let i = 0; i < curShortcut.keys.length; i++)
      {
        let curKey = curShortcut.keys[i];
        if (_keyArr[curKey]) continue;
        succes = false;
        break;
      }

      if (!succes) continue;
      
      _event.target.blur();

      let status = false;
      try {status = curShortcut.event(_event);}
      catch (e) {console.warn(e)};
      KEYS = {};
      return true;
    }
  }

}








