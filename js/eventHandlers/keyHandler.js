

let KEYS = {};
let KeyHandler = new _KeyHandler();
function _KeyHandler() {
  let shortCuts = [
    {
      keys: ["n"], 
      event: function () {
        let list = MainContent.taskHolder.list;
        for (item of list)
        {
          if (!item.createMenu) continue;
          return item.createMenu.open();
        }
      },
      ignoreIfInInputField: true
    },

    {
      keys: ["Escape"], 
      event: function () {
        if (MainContent.searchOptionMenu.openState)                return MainContent.searchOptionMenu.hide();
        if (MainContent.optionMenu.openState)                      return MainContent.optionMenu.close();
        if (MainContent.taskHolder.closeAllCreateMenus())          return true;
      },
      ignoreIfInInputField: false
    },

    {
      keys: ["Enter"], 
      event: function (_e) {
        if (MainContent.taskHolder.dateOptionMenu.openState)       return MainContent.taskHolder.dateOptionMenu.clickFirstOption();
        if (MainContent.searchOptionMenu.openState)                return MainContent.searchOptionMenu.clickFirstOption();
        if (Popup.createProjectMenu.openState)                     return Popup.createProjectMenu.createProject();
        if (Popup.renameProjectMenu.openState)                     return Popup.renameProjectMenu.renameProject();
        if (Popup.inviteByEmailMenu.openState)                     return Popup.inviteByEmailMenu.inviteUser();

        return MainContent.taskHolder.createTask();
      },
      ignoreIfInInputField: false
    },




    {
      keys: ["w"], 
      event: function () {
          MainContent.taskPage.weekTab.open();
      },
      ignoreIfInInputField: true
    },
    {
      keys: ["t"], 
      event: function () {
          MainContent.taskPage.todayTab.open();
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








