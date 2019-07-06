




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































let DEBUG = new function() {
  this.getAllNewVarNames = function() {
    const defaultKeys = JSON.parse("[\"document\",\"window\",\"self\",\"name\",\"location\",\"history\",\"locationbar\",\"menubar\",\"personalbar\",\"scrollbars\",\"statusbar\",\"toolbar\",\"status\",\"closed\",\"frames\",\"length\",\"top\",\"opener\",\"parent\",\"frameElement\",\"navigator\",\"applicationCache\",\"sessionStorage\",\"localStorage\",\"screen\",\"innerHeight\",\"innerWidth\",\"scrollX\",\"pageXOffset\",\"scrollY\",\"pageYOffset\",\"screenX\",\"screenY\",\"outerWidth\",\"outerHeight\",\"devicePixelRatio\",\"event\",\"defaultStatus\",\"defaultstatus\",\"offscreenBuffering\",\"screenLeft\",\"screenTop\",\"clientInformation\",\"styleMedia\",\"indexedDB\",\"webkitIndexedDB\",\"speechSynthesis\",\"onabort\",\"onblur\",\"oncanplay\",\"oncanplaythrough\",\"onchange\",\"onclick\",\"oncontextmenu\",\"oncuechange\",\"ondblclick\",\"ondrag\",\"ondragend\",\"ondragenter\",\"ondragleave\",\"ondragover\",\"ondragstart\",\"ondrop\",\"ondurationchange\",\"onemptied\",\"onended\",\"onerror\",\"onfocus\",\"oninput\",\"oninvalid\",\"onkeydown\",\"onkeypress\",\"onkeyup\",\"onload\",\"onloadeddata\",\"onloadedmetadata\",\"onloadstart\",\"onmousedown\",\"onmouseenter\",\"onmouseleave\",\"onmousemove\",\"onmouseout\",\"onmouseover\",\"onmouseup\",\"onmousewheel\",\"onpause\",\"onplay\",\"onplaying\",\"onprogress\",\"onratechange\",\"onrejectionhandled\",\"onreset\",\"onresize\",\"onscroll\",\"onseeked\",\"onseeking\",\"onselect\",\"onstalled\",\"onsubmit\",\"onsuspend\",\"ontimeupdate\",\"ontoggle\",\"onunhandledrejection\",\"onvolumechange\",\"onwaiting\",\"ontransitionend\",\"ontransitionrun\",\"ontransitionstart\",\"ontransitioncancel\",\"onanimationend\",\"onanimationiteration\",\"onanimationstart\",\"onanimationcancel\",\"crypto\",\"performance\",\"onbeforeunload\",\"onhashchange\",\"onlanguagechange\",\"onmessage\",\"onoffline\",\"ononline\",\"onpagehide\",\"onpageshow\",\"onpopstate\",\"onstorage\",\"onunload\",\"origin\",\"close\",\"stop\",\"focus\",\"blur\",\"open\",\"alert\",\"confirm\",\"prompt\",\"print\",\"requestAnimationFrame\",\"cancelAnimationFrame\",\"postMessage\",\"captureEvents\",\"releaseEvents\",\"getComputedStyle\",\"matchMedia\",\"moveTo\",\"moveBy\",\"resizeTo\",\"resizeBy\",\"scroll\",\"scrollTo\",\"scrollBy\",\"getSelection\",\"find\",\"webkitRequestAnimationFrame\",\"webkitCancelAnimationFrame\",\"webkitCancelRequestAnimationFrame\",\"getMatchedCSSRules\",\"showModalDialog\",\"webkitConvertPointFromPageToNode\",\"webkitConvertPointFromNodeToPage\",\"openDatabase\",\"setTimeout\",\"clearTimeout\",\"setInterval\",\"clearInterval\",\"atob\",\"btoa\",\"customElements\",\"caches\",\"isSecureContext\",\"fetch\",\"safari\",\"self\",\"location\",\"locationbar\",\"personalbar\",\"statusbar\",\"status\",\"frames\",\"top\",\"parent\",\"navigator\",\"sessionStorage\",\"screen\",\"innerWidth\",\"pageXOffset\",\"pageYOffset\",\"screenY\",\"outerHeight\",\"event\",\"defaultstatus\",\"screenLeft\",\"clientInformation\",\"indexedDB\",\"speechSynthesis\",\"onblur\",\"oncanplaythrough\",\"onclick\",\"oncuechange\",\"ondrag\",\"ondragenter\",\"ondragover\",\"ondrop\",\"onemptied\",\"onerror\",\"oninput\",\"onkeydown\",\"onkeyup\",\"onloadeddata\",\"onloadstart\",\"onmouseenter\",\"onmousemove\",\"onmouseover\",\"onmousewheel\",\"onplay\",\"onprogress\",\"onrejectionhandled\",\"onresize\",\"onseeked\",\"onselect\",\"onsubmit\",\"ontimeupdate\",\"onunhandledrejection\",\"onwaiting\",\"ontransitionrun\",\"ontransitioncancel\",\"onanimationiteration\",\"onanimationcancel\",\"performance\",\"onhashchange\",\"onmessage\",\"ononline\",\"onpageshow\",\"onstorage\",\"origin\",\"stop\",\"blur\",\"alert\",\"prompt\",\"requestAnimationFrame\",\"postMessage\",\"releaseEvents\",\"matchMedia\",\"moveBy\",\"resizeBy\",\"scrollTo\",\"getSelection\",\"webkitRequestAnimationFrame\",\"webkitCancelRequestAnimationFrame\",\"showModalDialog\",\"webkitConvertPointFromNodeToPage\",\"setTimeout\",\"setInterval\",\"atob\",\"customElements\",\"isSecureContext\",\"safari\", \"getAllNewVarNames\"]");
    let foundKeys = Object.keys(window);
    let newKeys = [];
    for (let i = 0; i < foundKeys.length; i++)if (!isInArray(defaultKeys, foundKeys[i])) newKeys.push(foundKeys[i]);
    
    function isInArray(arr, item) {
      for (let i = 0; i < arr.length; i++)
      {
        if (arr[i] == item) return true;
      }
      return false;
    }

    return newKeys;
  }

  this.getFunctionSpeed = function(_function) {
    let start = new Date();
    if (typeof _function == "function")
    {
      _function();
    } else eval(_function);
    return new Date() - start; 
  }

  this.getAverageFunctionSpeed = function(_function, _samples = 100) {
    let totalScore = 0;
    for (let i = 0; i < _samples; i++)
    {
      let score = this.getFunctionSpeed(_function);
      totalScore += score;
    }
    return totalScore / _samples;
  }



  this.scanPerformance = function(_functionList, _samples) {
    let resultList = [];
    let total = 0;
    for (let i = 0; i < _functionList.length; i++)
    {
      let curFunction = _functionList[i];
      if (typeof curFunction != "string" && typeof curFunction != "function") continue;
      let score = this.getAverageFunctionSpeed(curFunction, _samples);
      total += score;

      resultList.push(
        {
          speed: score,
          function: curFunction
        }
      );
    }

    return {
      speed: total / resultList.length,
      functions: resultList
    };
  }


}

function x() {// indent if it's >= .1ms
  return DEBUG.scanPerformance([
    '$(".header.small.clickable")[0].click()',
    '$(".header.clickable")[0].click()',
    // "Server.todos.getByDate(new Date())",
    // "y()"
    // 'Server.projectList[0].users.get("")'
    // '$(".titleHolder.button.createButton.clickable")[0].click()',
    // "MainContent.menu.Main.page.open("Inbox")()",
    // "MainContent.menu.Main.page.open("Today")()"
  ], 10);
}


function y() {let todoList = Server.todos.getByDate(new Date()); window.html = MainContent.renderer.renderDayItem(todoList, new Date())}





//taskHolderHTML renderen:     14.68ms
// + for loop:              14.136ms
// + appending taskHolderHTML  13.41ms
// + get keys:              13.69ms
// + get todoList           13.28ms
// + _renderTodoList                      558ms
  // - _createMemberTextByUserIdList:     395ms
      // - string concatenation;          - ~ 30ms



// fix
  //list = [""]

