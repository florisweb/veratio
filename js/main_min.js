


const DOMData=new function () {
let Data=[];


return {
get: function(_element) {
for (e of Data) 
{
if (e.element !== _element) continue;
return e.data;
}
return false;
},

set: function(_element,_data) {
for (let i=0; i < Data.length; i++) 
{
if (Data[i].element !== _element) continue;
Data[i].data=_data;
return true;
}

let dataHolder={
element: _element,
data: _data,
}
Data.push(dataHolder);

return true;
},
}
}
Date.prototype.copy=function() {return new Date().setDateFromStr(this.toString(true));}
Date.prototype.setDateFromStr=function(_str) {
if (typeof _str != "string" || !_str) return _str;
let dateTime=_str.split(" ");
let date=new Date();

let dateParts=dateTime[0].split("-");
this.setDate(dateParts[0]);
this.setMonth(parseInt(dateParts[1]) - 1);
this.setYear(dateParts[2]);

if (!dateTime[1]) return this;
let timeParts=dateTime[1].split(":");
this.setHours(timeParts[0]);
this.setMinutes(timeParts[1]);

return this;
}
Date.prototype.setFromStr=Date.prototype.setDateFromStr;


Date.prototype.toString=function(_addTime=false) {
let dateStr=this.getDate()+"-"+(this.getMonth()+1)+"-"+this.getFullYear();
if (!_addTime) return dateStr;
return dateStr+" "+this.getHours()+":"+this.getMinutes();
}

Date.prototype.getDayName=function() {
let dayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
return dayNames[this.getDay()];
}









Date.prototype.getTimeInMinutes=function() {
return this.getMinutes()+this.getHours() * 60;
}

Date.prototype.getDateInDays=function(_addYears) {
let monthList=this.getMonths();
let totalDays=this.getDate();

for (let i=0; i < this.getMonth(); i++)
{
totalDays+= monthList[i].length;
}

if (!_addYears) return totalDays;
for (let i=0; i < this.getFullYear(); i++) 
{
totalDays+= 365;
if (this.isLeapYear(i+1)) totalDays++;
}

return totalDays;
}












Date.prototype.isLeapYear=function(_year) {
let year=this.getFullYear();
if (_year) year=_year;
let devidableByFour=Math.floor(year / 4)== year / 4;
let devidableByFourhundred=Math.floor(year / 400)== year / 400;
let devidableByHundred=Math.floor(year / 100)== year / 100;

return devidableByFour== true && (devidableByHundred== false || devidableByFourhundred== true);
};

Date.prototype.getMonths=function() {
let months=[
{name: "January",length: 31},
{name: "February",length: 28},
{name: "March",length: 31},
{name: "April",length: 30},
{name: "May",length: 31},
{name: "June",length: 30},
{name: "July",length: 31},
{name: "August",length: 31},
{name: "September",length: 30},
{name: "October",length: 31},
{name: "November",length: 30},
{name: "December",length: 31}
];
if (this.isLeapYear()) months[1].length=29;
return months;
}

Date.prototype.getWeek=function() {
var onejan=new Date(this.getFullYear(),0,1);
return Math.ceil((((this - onejan) / 86400000)+onejan.getDay()+1) / 7);
}






Date.prototype.compareDate=function(_date) {
return _date.getDateInDays(true)== this.getDateInDays(true);
}


Date.prototype.dateIsBetween=function(_min,_max) {
if (typeof _min== "string") _min=new Date().setDateFromStr(_min);
if (typeof _max== "string") _max=new Date().setDateFromStr(_max);
let minDays=_min.getDateInDays(true);
let maxDays=_max.getDateInDays(true);
let targetDays=this.getDateInDays(true);

return minDays <= targetDays && targetDays <= maxDays;
}








Date.prototype.moveDay=function(_days=0) {
this.setDate(this.getDate()+parseInt(_days));
return this;
}

Date.prototype.moveMonth=function(_months=0) {
this.setMonth(this.getMonth()+parseInt(_months));
return this;
}


Date.prototype.moveMinutes=function(_minutes=0) {
this.setMinutes(this.getMinutes()+parseInt(_minutes));
return this;
}










const DateNames=function() {
const dateNames=[
{name: "Yesterday",date: new Date().moveDay(-1)},
{name: "Today",date: new Date()},
{name: "Tomorrow",date: new Date().moveDay(1)},
{name: "Next week",date: new Date().moveDay(7)}
];

return {
dateNames: dateNames,
 toString: toString,
 toDate: strToDate,
}

function getDateStrFromDateNames(_date) {
for (obj of dateNames)
{
if (!obj.date.compareDate(_date)) continue;
return obj.name;
}
return "";
}

function toString(_date,_compact) {
let dateName=getDateStrFromDateNames(_date);
if (dateName) return dateName;

dateName=_date.getDayName();
if (!dateName) return false;
if (_compact) dateName=dateName.substr(0,3);

let monthName=_date.getMonths()[_date.getMonth()].name;
if (_compact)
{
dateName+= " "+_date.getDate()+" "+monthName.substr(0,3);
} else dateName+= " - "+_date.getDate()+" "+monthName;

if (_date.getFullYear() != new Date().getFullYear()) dateName+= " "+_date.getFullYear();

return dateName;
}


function strToDate(_str) {
let date=new Date().setFromStr(_str);
if (!isNaN(date)) return date;
date=relativeStrToDate(_str)
if (date) return date.date;
date=spelledStrToDate(_str)
if (date) return date;

return false;
}


function relativeStrToDate(_str) {
let options=[]; 
for (dateObj of dateNames)
{
dateObj.score=similarity(_str,dateObj.name);
if (dateObj.score < 0.8) continue;
options.push(dateObj);
}

return options.sort(function(a,b){
 if (a.score < b.score) return 1;
if (a.score > b.score) return -1;
return 0;
})[0];
}


function spelledStrToDate(_str) {
let parts=_str.split(" ");
if (parts.length < 2) return false;

let date=new Date();
let day=parseInt(parts[0].replace(/[^0-9]+/g,''));
if (isNaN(day)) return false;
date.setDate(day);

if (!parts[1]) return date;
let month=getMonthFromStr(parts[1].replace(/[^a-z^A-Z]+/g,''));
if (typeof month== "number") date.setMonth(month);

if (!parts[2]) return date;
let year=getYearFromStr(parts[2].replace(/[^0-9]+/g,''));
if (year) date.setYear(year);

return date;
}


function getMonthFromStr(_str) {
let curMonth=false;
let curMonthScore=0;

let months=new Date().getMonths();
for (let m=0; m < months.length; m++)
{
let monthName=months[m].name;
let fullScore=similarity(monthName,_str);
let shortScore=similarity(monthName.substr(0,3),_str);
let score=fullScore > shortScore ? fullScore : shortScore;
if (score < curMonthScore) continue;
curMonthScore=score;
curMonth=m;
}

if (curMonthScore <= .5) return false;
return curMonth;
}

function getYearFromStr(_str) {
if (!_str) return false;
let year=parseInt(_str);
if (isNaN(year)) return false;
if (String(year).length != 4) return false;
return year;
}





}();





function newId() {return parseInt(Math.round(Math.random() * 100000000)+""+Math.round(Math.random() * 100000000));}

function setTextToElement(element,text) {
element.innerHTML="";
let a=document.createElement('a');
a.text=text;
element.append(a);
}

function isDescendant(parent,child) {
if (typeof parent.length !== "number") return _isDescendant(parent,child);
for (let i=0; i < parent.length; i++)
{
if (_isDescendant(parent[i],child)) return true;
}

function _isDescendant(parent,child) {
if (parent== child) return true;

 var node=child.parentNode;
 while (node != null) {
 if (node== parent) {
 return true;
 }
 node=node.parentNode;
 }
 return false;
}
}


function inArray(arr,item) {
for (let i=0; i < arr.length; i++)
{
if (arr[i]== item)
{
return true;
}
}
return false;
}


Array.prototype.randomItem=function() {
return this[Math.round((this.length - 1) * Math.random())];
}
Array.prototype.lastItem=function() {
return this[this.length - 1];
}



function isPromise(_promise) {
if (_promise.then) return true;
return false;
}

function mergeColours(_colourA,_colourB,_colourAPerc=0.5) {
colorBPerc=1 - _colourAPerc;
if (Object.keys(_colourA).length < 3 && Object.keys(_colourB).length < 3) return {r: 255,g: 255,b: 255};
if (Object.keys(_colourA).length < 3) return _colourB;
if (Object.keys(_colourB).length < 3) return _colourA;

let obj={
r: _colourA.r * _colourAPerc+_colourB.r * colorBPerc,
g: _colourA.g * _colourAPerc+_colourB.g * colorBPerc,
b: _colourA.b * _colourAPerc+_colourB.b * colorBPerc
}
if (_colourA.a && _colourB.a) obj.a=_colourA.a * _colourAPerc+_colourB.a * colorBPerc;
return obj;
}

function colourToString(_colour) {
if (!_colour || typeof _colour.r !== "number" || typeof _colour.g !== "number" || typeof _colour.b !== "number") return false;
let color="rgb("+parseInt(_colour.r)+","+parseInt(_colour.g)+","+parseInt(_colour.b)+")";
if (_colour.a) color="rgba("+parseInt(_colour.r)+","+parseInt(_colour.g)+","+parseInt(_colour.b)+","+_colour.a+")";
return color;
}

function stringToColour(_str) {
if (!_str || typeof _str !== "string") return false;
if (_str.substr(0,1)== "#") return hexToRgb(_str)
 
let prefix=_str.split("rgba(");
if (prefix.length < 2) prefix=_str.split("rgb(");
let colors=prefix[1].substr(0,prefix[1].length - 1).split(",");

return {
r: parseFloat(colors[0]),
g: parseFloat(colors[1]),
b: parseFloat(colors[2]),
a: colors[3] ? parseFloat(colors[3]) : 1
}
}


function rgbToHex(_colour) {
return "#"+componentToHex(_colour.r)+componentToHex(_colour.g)+componentToHex(_colour.b);

function componentToHex(c) {
var hex=c.toString(16);
return hex.length== 1 ? "0"+hex : hex;
}
}

function hexToRgb(_hex) {
var result=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(_hex);
return result ? {
r: parseInt(result[1],16),
g: parseInt(result[2],16),
b: parseInt(result[3],16)
} : null;
}

function similarity(s1,s2) {
var longer=s1;
var shorter=s2;

if (s1.length < s2.length) {
longer=s2;
shorter=s1;
}

var longerLength=longer.length;
if (longerLength== 0) {return 1.0;}

return (longerLength - editDistance(longer,shorter)) / parseFloat(longerLength);


function editDistance(s1,s2) {
s1=s1.toLowerCase();
s2=s2.toLowerCase();

var costs=new Array();
for (var i=0; i <= s1.length; i++) {
var lastValue=i;
for (var j=0; j <= s2.length; j++) {
if (i== 0)
{
costs[j]=j;
} else {
if (j > 0) {
var newValue=costs[j - 1];
if (s1.charAt(i - 1) != s2.charAt(j - 1))
newValue=Math.min(Math.min(newValue,lastValue),
costs[j])+1;
costs[j - 1]=lastValue;
lastValue=newValue;
}
}
}
if (i > 0)
costs[s2.length]=lastValue;
}

return costs[s2.length];
}
}



function removeSpacesFromEnds(_str) {
for (let c=0; c < _str.length; c++)
{
if (_str[0] !== " ") continue;
_str=_str.substr(1,_str.length);
}

for (let c=_str.length; c > 0; c--)
{
if (_str[_str.length - 1] !== " ") continue;
_str=_str.substr(0,_str.length - 1);
}
return _str;
} 

function clearSelection() {
 if (window.getSelection) {window.getSelection().removeAllRanges();}
 else if (document.selection) {document.selection.empty();}
}
















function optionGroup_select(_item) {
let group=_item.parentNode;
for (let i=0; i < group.children.length; i++)
{
group.children[i].classList.remove("selected");
if (group.children[i]== _item) 
{
group.value=i;
}
}
_item.classList.add("selected");
}

const Popup=new function () {
let HTML={
notificationHolder: $("#notificationBoxHolder")[0],
notifcationBox: $("#notificationBox")[0]
}

this.openState=false;


HTML.notificationHolder.onclick=function(_e) {
if (_e.target== this) Popup.close();
}


function show() {
Popup.openState=true;
HTML.notificationHolder.classList.remove("hide");
}

this.close=function() {
this.openState=false;
HTML.notificationHolder.classList.add("hide");
}


this.showNotification=function(_builder) {
show();
HTML.notifcationBox.innerHTML="";
for (let i=0; i < _builder.length; i++)
{
let element=_buildItem(_builder[i]);
HTML.notifcationBox.appendChild(element);
}
return HTML.notifcationBox;
}

function _buildItem(_item) {
let element=false;
if (typeof _item== "string") return _buildString(_item);

if ("title" in _item) element=_buildTitle(_item);
if ("text" in _item) element=_buildText(_item);
if ("subHeader" in _item) element=_buildSubHeader(_item);
if ("checkBox" in _item) element=_buildCheckbox(_item);
if ("buttons" in _item) element=_buildButtons(_item.buttons);
if ("input" in _item) element=_buildInput(_item);
if ("options" in _item) element=_buildOptionHolder(_item);
if (_item.onclick) element.onclick=_item.onclick;
if (_item.customClass) element.classList.add(_item.customClass);
return element;
}

function _buildString(_string) {
let parent=document.createElement("div");
parent.innerHTML=_string;
return parent;
}

function _buildTitle(_info) {
let element=document.createElement("a");
element.className="header text";
setTextToElement(element,_info.title);
return element;
}

function _buildText(_info) {
let element=document.createElement("div");
element.className="text";
if (_info.highlighted)element.classList.add("highlighted");
if (_info.text.substr(0,1)== " ")element.style.marginLeft="4px";
if (_info.text.substr(_info.text.length - 1,1)== " ") element.style.marginRight="4px";

setTextToElement(element,_info.text);
return element;
}

function _buildCheckbox(_info) {
let element=document.createElement("div");
element.className="checkBoxHolder";
element.append(_buildText({text: _info.checkBox}))
let html='<input type="checkbox">';
element.innerHTML=html;
if (_info.id) element.children[0].setAttribute("id",_info.id);
if (_info.checked) element.children[0].classList.add("checked");

return element;
}

function _buildButtons(_buttons) {
let buttonBar=document.createElement("div");
buttonBar.className="buttonBar";

for (let i=_buttons.length - 1; i >= 0; i--)
{
let curButton=_buildButton(_buttons[i]);
buttonBar.appendChild(curButton);
}

return buttonBar;
}
function _buildButton(_buttonInfo) {
let button=document.createElement("div");
button.className="boxButton text";

if (_buttonInfo.important) button.classList.add("important");
if (_buttonInfo.color) button.style.background=_buttonInfo.color;
if (_buttonInfo.onclick) button.onclick=_buttonInfo.onclick;

setTextToElement(button,_buttonInfo.button);
return button;
} 


function _buildInput(_info) {
let input=document.createElement("input");
input.className="inputField";
if (_info.focus && !_info.id) _info.id="popup_autoFocusInputField";

if (_info.id) input.setAttribute("id",String(_info.id));
if (_info.input) input.setAttribute("placeHolder",String(_info.input));
if (_info.focus) var loopTimer=setTimeout(_info.id+".focus()",1);
if (_info.value) input.value=String(_info.value);

return input;
}

function _buildOptionHolder(_info) {
let select=document.createElement("select");
select.className="optionHolder";
if (_info.id) select.setAttribute("id",_info.id);

for (let i=0; i < _info.options.length; i++)
{
let option=_buildOptions(_info.options[i]);
select.appendChild(option);
}
return select;
}
function _buildOptions(_option) {
let option=document.createElement("option");
option.className="optionItem";
if (_option.option) option.text=_option.option;
if (_option.value) option.value=_option.value;
return option;
}


function _buildSubHeader(_info) {
let element=document.createElement("a");
element.className="text header subHeader";
setTextToElement(element,_info.subHeader);

return element;
}









};const COLOR={
DANGEROUS: "rgb(220,50,4)",
WARNING: "rgb(220,135,0)",
POSITIVE: "rgb(0,190,60)",
}

const PLACEHOLDERTEXTS=[
'Read some books...',
'Clean your room...',
'Finish your project...',
'Be a social person for once...',
'Call an old friend...',
'Add a task...',
'Make some homework...'
];
function _OptionMenu() {
this.create=function(_parent) {
let html=document.createElement("div");
html.className="optionMenuHolder hide";
_parent.append(html);

let Menu=new _OptionMenu_menu(html);


document.body.addEventListener("click",function(_e) {
if (inArray(_e.target.classList,"clickable")) return;
if (isDescendant(html,_e.target)) return;
Menu.close();
});

return Menu;
}
}


function _OptionMenu_menu(_self) {
let HTML={
Self: _self,
parent: _self.parentNode
}
let This=this;
this.options=[];


this.openState=false;
this.open=function(_item,_relativePosition,_event) {
this.openState=true;
moveToItem(_item,_relativePosition,_event);
HTML.Self.classList.remove("hide");
}


this.close=function() {
this.openState=false;
HTML.Self.classList.add("hide");
}

this.enableAllOptions=function() {
for (option of this.options) option.enable();
}

this.clickFirstOption=function() {
let option=this.options[0];
if (!option) return;
option.html.click();
This.close();
}



function removeOption(_option) {
for (let i=0; i < This.options.length; i++)
{
if (_option != This.options[i]) continue;
This.options.splice(i,1);
return true;
}
return false;
}


this.addOption=function(_title="",_onclick,_icon="") {
let option=document.createElement("div");
option.className="optionItem clickable";
option.innerHTML="<img class='optionIcon' src='images/icons/removeIcon.png'>"+
"<div class='optionText'>Remove task</div>";
option.children[0].setAttribute("src",_icon);
setTextToElement(option.children[1],_title);

HTML.Self.append(option);
option.onclick=function () {
let close;
try {
close=_onclick();
}
catch (e) {return};
if (close) This.close();
}

this.options.push(new function() {
this.title=_title;
this.html=option;

this.remove=function() {
removeOption(this);
this.html.parentNode.removeChild(this.html);
}

this.disable=function() {
this.html.classList.add("disabled");
}

this.enable=function() {
this.html.classList.remove("disabled");
}

this.hide=function() {
this.html.style.display="none";
}

this.show=function() {
this.html.style.display="block";
}
});
}


function moveToItem(_item,_relativePosition={left: 0,top: 0},_event) {
if (!_item) return false;
let top=_item.getBoundingClientRect().top+HTML.parent.scrollTop+_relativePosition.top;
let left=_event ? _event.clientX - 325 :$("#mainContentHolder")[0].offsetWidth - 180;

left+= _relativePosition.left;

let maxLeft=$("#mainContent")[0].offsetWidth - HTML.Self.offsetWidth - 15;
if (left > maxLeft) left=maxLeft;

HTML.Self.style.left=left+"px";
HTML.Self.style.top=top+"px";
}
}

let KEYS={};
let KeyHandler=new _KeyHandler();
function _KeyHandler() {
let shortCuts=[
{
keys: ["n"],
event: function () {
let list=MainContent.taskPage.taskHolder.list;
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
if (MainContent.searchOptionMenu.openState) return MainContent.searchOptionMenu.hide(true);
if (MainContent.optionMenu.openState) return MainContent.optionMenu.close();
if (MainContent.taskPage.taskHolder.closeAllCreateMenus())return true;
},
ignoreIfInInputField: false
},

{
keys: ["Enter"],
event: function (_e) {
if (MainContent.taskPage.taskHolder.deadLineOptionMenu.openState)return MainContent.taskPage.taskHolder.deadLineOptionMenu.clickFirstOption();
if (MainContent.searchOptionMenu.openState)return MainContent.searchOptionMenu.chooseFirstSearchItem();
if (MainContent.curPageName== "createProject")return MainContent.createProjectPage.createProject();

if (_e.target== $("#RENAMEPROJECTValueHolder")[0])return MainContent.renameProjectFromPopup();

if (_e.target== inviteMemberInput)return MainContent.settingsPage.inviteUser();
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
let item=$("#mainContentHolder .loadMoreButton")[0];
if (inArray(item.classList,"hide")) return;
item.click();
},
ignoreIfInInputField: true
},
]


this.handleKeys=function(_keyArr,_event) {
let inInputField=_event.target.type== "text" || _event.target.type== "textarea" ? true : false;

for (let i=0; i < shortCuts.length; i++)
{
let curShortcut=shortCuts[i]; 
if (curShortcut.ignoreIfInInputField && inInputField) continue;

let succes=true;
for (let i=0; i < curShortcut.keys.length; i++)
{
let curKey=curShortcut.keys[i];
if (_keyArr[curKey]) continue;
succes=false;
break;
}

if (!succes) continue;

_event.target.blur();

let status=false;
try {status=curShortcut.event(_event);}
catch (e) {console.warn(e)};
KEYS={};
return true;
}
}

}









let DoubleClick=new _DoubleClick();
function _DoubleClick() {
let list=[];
let doubleClickThreshold=200;

this.register=function(_item,_callBack) {
if (!_item) return false;

let id=newId();
_item.addEventListener(
"click",
function (_event) {handleClick(id,_event);}
);

list.push({
html: _item,
callBack: _callBack,
id: id,
lastClicked: new Date()
});
}

function get(_id) {
for (let i=0; i < list.length; i++)
{
if (list[i].id== _id) return list[i];
}
return false;
}

function handleClick(_id,_event) {
let item=get(_id);
if (!item) return false;

let curDate=new Date();
if (curDate - item.lastClicked < doubleClickThreshold)
{
try {
item.callBack(_event,item.html);
}
catch (e) {console.error("DoubleClick.handleClick: An error accured:",e)}
}
item.lastClicked=curDate;
}
}


let RightClick=new _RightClick();
function _RightClick() {
let list=[];

this.register=function(_item,_callBack) {
if (!_item) return false;

let id=newId();
_item.addEventListener(
"contextmenu",
function (_event) {handleClick(id,_event);}
);


list.push({
html: _item,
callBack: _callBack,
id: id,
});
}

function get(_id) {
for (let i=0; i < list.length; i++)
{
if (list[i].id== _id) return list[i];
}
return false;
}

function handleClick(_id,_event) {
let item=get(_id);
if (!item) return false;

_event.preventDefault();

var isRightMB;
_event=_event || window.event;

if ("which" in _event)
isRightMB=_event.which== 3; 
else if ("button" in _event)
isRightMB=_event.button== 2; 
if (!isRightMB) return;


try {
item.callBack(_event,item.html);
}
catch (e) {console.error("RightClick.handleClick: An error accured:",e);}
clearSelection();

return false;
}
}



function _MainContent_header() {
let HTML={
mainContent: mainContent,
Self: $("#mainContentHeader .header")[0],
titleHolder: $("#mainContentHeader .header.titleHolder")[0],
memberList: $("#mainContentHeader .functionHolder .memberList")[0],
optionIcon: $("#mainContentHeader .functionItem.icon.clickable")[0],
functionItems: $("#mainContentHeader .functionHolder > .functionItem"),
}

this.optionMenu=new function() {
let Menu=OptionMenu.create(HTML.mainContent);

Menu.addOption(
"Settings",
function () {
MainContent.settingsPage.open(MainContent.curProjectId);
return true;
},
"images/icons/memberIcon.png"
);
Menu.addOption(
"Leave project",
function () {
MainContent.leaveCurrentProject();
return true;
},
"images/icons/leaveIconDark.png"
);

Menu.addOption(
"Remove project",
function () {
MainContent.removeCurrentProject()
return true;
},
"images/icons/removeIcon.png"
);
Menu.addOption(
"Rename project",
function () {
MainContent.openRenameProjectMenu();
return true;
},
"images/icons/changeIconDark.png"
);


this.open=function() {
let project=Server.getProject(MainContent.curProjectId);

Menu.enableAllOptions();
if (!project.users.Self.projectActionAllowed("remove")) Menu.options[2].disable();
if (!project.users.Self.projectActionAllowed("rename"))Menu.options[3].disable();

return Menu.open(HTML.optionIcon,{top: 45});
}

this.openState=Menu.openState;
this.close=Menu.close;

HTML.optionIcon.onclick=this.open;
}





this.hide=function() {
HTML.Self.classList.add("hide");
}

this.show=function() {
HTML.Self.classList.remove("hide");
}



this.showItemsByPage=function(_pageName) {
hideAllFunctionItems();
switch (_pageName.toLowerCase()) 
{
case "settings":
HTML.functionItems[0].classList.remove("hide");
HTML.functionItems[1].classList.remove("hide");
break;
case "createproject":
HTML.functionItems[1].classList.remove("hide");
break;
case "taskpage - today":
break;
case "taskpage - inbox":
break;
default:
HTML.functionItems[0].classList.remove("hide");
HTML.functionItems[2].classList.remove("hide");
HTML.functionItems[3].classList.remove("hide");
break;
}
}


this.setTitle=function(_title) {
setTextToElement(HTML.titleHolder,_title);
}

this.setMemberList=function(_members) {
setTextToElement(
HTML.memberList,
App.delimitMemberText(_members,20)
);
}


function hideAllFunctionItems() {
for (item of HTML.functionItems)
{
item.classList.add("hide");
}
}
}

function _MainContent_taskPage(_parent) {
let HTML={
todoHolder: $("#mainContentHolder .todoListHolder")[0],
}
let This=this;

this.pageSettings={
pageName: "task",
pageIndex: 0,
onOpen: onOpen,
customHeaderSetting: true
}

function onOpen(_projectId) {
if (!_projectId) return MainContent.taskPage.tab.reopenCurTab();
MainContent.taskPage.tab.open("Project",_projectId);
}

this.open=function(_projectId) {
MainContent.openPage(this.pageSettings.pageName,_projectId);
}


this.tab=new _MainContent_taskPage_tab(this);
this.taskHolder=new _MainContent_taskHolder();
this.renderer=new _TaskRenderer(HTML.todoHolder);
}







function _MainContent_taskPage_tab(_parent) {
let Parent=_parent;
let This=this;

let HTML={
mainContentHolder: mainContentHolder,
todoHolder: $("#mainContentHolder .todoListHolder")[0],
loadMoreButton: $("#mainContentHolder .loadMoreButton")[0],
}


this.tabs={
Today: {
hideLoadMoreButton: true,
onOpen: openToday
},
Inbox: {
onOpen: openInbox,
loadMoreDays: loadMoreDays,
},
Project: {
hideLoadMoreButton: true,
onOpen: openProject
}
}



this.curTab="Today";
this.reopenCurTab=function() {
if (this.curTab== "project" && !MainContent.curProjectId) this.curTab="Today";
this.open(this.curTab,MainContent.curProjectId);
}


this.open=function(_tabName="Today",_projectId=false) {
if (MainContent.curPageName != "task") MainContent.taskPage.open(_projectId);

$(HTML.mainContentHolder.parentNode).animate({opacity: 0},50);
_resetPage();
setTimeout(function () {
let tab=This.tabs[_tabName];
if (!tab) return console.warn("MainContent.taskPage.tab.open: "+_tabName+" doesn't exist.");

if (tab.hideLoadMoreButton) HTML.loadMoreButton.classList.add("hide"); else HTML.loadMoreButton.classList.remove("hide");
MainContent.curProjectId=_projectId;
This.curTab=_tabName;

Parent.taskHolder.clear();
Parent.taskHolder.addOverdue();

MainContent.header.showItemsByPage("taskpage - "+_tabName)

tab.onOpen(_projectId);
},55);


$(HTML.mainContentHolder.parentNode).delay(50).animate({opacity: 1},50);
}





function openToday() {
let date=new Date();
MainContent.header.setTitle("Today - "+date.getDate()+" "+date.getMonths()[date.getMonth()].name);
MainContent.header.setMemberList([]);

let todoList=Server.todos.getByDate(date);
todoList=MainContent.taskPage.renderer.settings.filter(todoList,{
finished: true
});
todoList=MainContent.taskPage.renderer.settings.filter(todoList,{
ownTask: false,
assignedTo: false
});

todoList=MainContent.taskPage.renderer.settings.sort(todoList,[]);

let taskHolder=Parent.taskHolder.add({
displayProjectTitle: true,
date: date
},{
displayDate: false
});
taskHolder.todo.renderTaskList(todoList);
}


function openInbox() {
MainContent.header.setTitle("Inbox");
MainContent.header.setMemberList([]);

for (let i=0; i < 7; i++)
{
let date=new Date().moveDay(i);
inbox_addTaskHolder(date);
}
}

function inbox_addTaskHolder(_date) {
let taskHolder=Parent.taskHolder.add({
displayProjectTitle: true,
date: _date
},{
displayDate: false
});

let taskList=Server.todos.getByDate(_date);
taskList=MainContent.taskPage.renderer.settings.filter(taskList,{
ownTask: false,
assignedTo: false
});
taskList=MainContent.taskPage.renderer.settings.sort(taskList,[]);
taskHolder.todo.renderTaskList(taskList);
}


async function loadMoreDays(_days=1) {
let startDate=getNewDate();

let promises=[];
for (project of Server.projectList)
{
promises.push(
project.todos.DTTemplate.DB.getByDateRange(startDate.copy().moveDay(1),_days)
);
}

Promise.all(promises).then(function () {
for (let i=1; i < _days+1; i++)
{
let date=startDate.copy().moveDay(i);
inbox_addTaskHolder(date);
}
});
}

function getNewDate() {
let lastTaskHolder=MainContent.taskPage.taskHolder.list.lastItem();
if (lastTaskHolder.type != "day") return false;
return lastTaskHolder.date;
}




function openProject(_projectId) {
let project=Server.getProject(_projectId);
if (!project) return;

MainContent.header.setTitle(project.title);
MainContent.header.setMemberList(project.users.getList());

let taskList=project.todos.getTasksByGroup("default");
taskList=taskList.concat(project.todos.getTasksByDateRange(new Date(),1000));
taskList=MainContent.taskPage.renderer.settings.sort(taskList,[]);

let taskHolder=Parent.taskHolder.add(
{title: ""},
{displayProjectTitle: false},
"list"
);
taskHolder.todo.renderTaskList(taskList);
}




function _resetPage() {
MainContent.optionMenu.close();
}
}
























function _MainContent_createProjectPage(_parent) {
let This=this;
let Parent=_parent;

let HTML={
page: $(".mainContentPage.createProjectPage"),
titleInputField: $(".mainContentPage.createProjectPage .inputField")[0],
}

this.pageSettings={
pageName: "createProject",
pageIndex: 1,
hideHeader: true,
onOpen: onOpen,
}

this.open=function(_projectId) {
MainContent.openPage(this.pageSettings.pageName,_projectId);
}

function onOpen(_projectId) {
HTML.titleInputField.value=null;
HTML.titleInputField.focus();
MainContent.header.setTitle("Create Project");
}





this.createProject=function() {
let project=scrapeProjectData();
if (typeof project != "object") return alert(project);

Server.createProject(project.title).then(function (_project) {
Server.getProject(_project.id).sync();
SideBar.projectList.fillProjectHolder();
MainContent.openPage("task",_project.id);
});
} 


function scrapeProjectData() {
let project={title: HTML.titleInputField.value};

if (!project.title || project.title.length < 2) return "E_incorrectTitle";

return project;
}
}




















function _MainContent_settingsPage(_parent) {
let This=this;
let Parent=_parent;

let HTML={
Self: $(".mainContentPage.settingsPage")[0],
memberHolder: $(".mainContentPage.settingsPage .memberHolder")[0],
inviteMemberInput: $("#inviteMemberInput")[0],
inviteMemberHolder: $(".inviteMemberHolder")
}

this.pageSettings={
pageName: "settings",
pageIndex: 2,
onOpen: onOpen,
}

this.permissionsMenu=new _MainContent_settingsPage_permissionsMenu();



this.open=function(_projectId) {
if (!_projectId) _projectId=Server.projectList[0].id;
MainContent.openPage(this.pageSettings.pageName,_projectId);

let project=Server.getProject(_projectId);
enableAllButtons();

if (!project.users.Self.userActionAllowed("invite")) HTML.inviteMemberHolder.hide();
}

function enableAllButtons() {
HTML.inviteMemberHolder.show();
}



function onOpen(_projectId) {
let project=Server.getProject(_projectId);
if (!project) return false;

MainContent.header.setTitle("Settings - "+project.title);

This.setMemberItemsFromList(project.users.getList());
}




this.optionMenu=new function() {
let Menu=OptionMenu.create(HTML.Self);
let curItem="";
let curMemberId="";

Menu.addOption(
"Remove user",
function () {
let project=Server.getProject(MainContent.curProjectId);
if (!project || !curMemberId) return false;

let removed=project.users.remove(curMemberId);
if (removed) curItem.classList.add("hide");

return removed;
},
"images/icons/removeIcon.png"
);

Menu.addOption(
"Change permissions",
function () {
MainContent.settingsPage.permissionsMenu.open(curMemberId);
return true;
},
"images/icons/changeIconDark.png"
);

this.open=function(_target) {
curItem=_target.parentNode.parentNode;
curMemberId=DOMData.get(curItem);

let project=Server.getProject(MainContent.curProjectId);
let member=project.users.get(curMemberId);
if (!member || !project) return false;

Menu.enableAllOptions();
if (!project.users.Self.userActionAllowed("remove",member)) Menu.options[0].disable();
if (!project.users.Self.userActionAllowed("update",member)) Menu.options[1].disable();

return Menu.open(_target,{left: -100,top: -45});
}

this.openState=Menu.openState;
this.close=Menu.close;
}








this.inviteUser=function() {
let email=HTML.inviteMemberInput.value;
let project=Server.getProject(MainContent.curProjectId);
let promise=project.users.inviteUserByEmail(email);
if (!isPromise(promise)) return alert(promise);
promise.then(function () {
project.users.sync().then(function () {
This.open(MainContent.curProjectId);
});
HTML.inviteMemberInput.value=null;
},function (_error) {
alert(_error);
});
}





this.setMemberItemsFromList=function(_memberList) {
HTML.memberHolder.innerHTML='<div class="text header">Members ('+_memberList.length+')</div>';
for (member of _memberList)
{
this.addMemberItem(member);
}
}


this.addMemberItem=function(_member) {
let html=createMemberItemHtml(_member);
HTML.memberHolder.append(html);
}


function createMemberItemHtml(_member) { 
let html=document.createElement("div");
html.className="listItem memberItem";
if (_member.Self) html.classList.add("isSelf");

html.innerHTML='<img class="mainIcon icon" src="images/icons/memberIcon.png">'+
'<div class="titleHolder userText text">Dirk@dirkloop.com</div>'+
'<div class="rightHand">'+
'<img src="images/icons/optionIcon.png" class="rightHandItem optionIcon onlyShowOnItemHover icon clickable">'+
'<div class="rightHandItem text"></div>'+
'</div>';

if (_member.type== "invite") html.children[0].setAttribute("src","images/icons/inviteIconDark.png");
if (_member.type== "link") html.children[0].setAttribute("src","images/icons/linkIconDark.png");
if (_member.isOwner)html.children[0].setAttribute("src","images/icons/ownerIconDark.png");


setTextToElement(html.children[1],_member.name);
setTextToElement(html.children[2].children[1],_member.permissions);
DoubleClick.register(html.children[2].children[1],function () {
let project=Server.getProject(MainContent.curProjectId);
if (!project.users.Self.userActionAllowed("update",member)) return false;

MainContent.settingsPage.permissionsMenu.open(_member.id);
})

html.children[2].children[0].onclick=function () {
MainContent.settingsPage.optionMenu.open(html.children[2].children[0]);
}


DOMData.set(html,_member.id);
return html;
}

}







function _MainContent_settingsPage_permissionsMenu() {
this.open=function(_memberId) {
let project= Server.getProject(MainContent.curProjectId);
let member=project.users.get(_memberId);

openPopupMenu(member);
}


function openPopupMenu(_member) {
let builder=[
{title: "CHANGE USER PERMISSIONS"},
"<br><br>",
{text: "Change "},
{text: _member.name,highlighted: true},
{text: _member.name.substr(_member.name.length - 1,1).toLowerCase()== "s" ? "'" : "'s",highlighted: true},
{text: " permissions to:"},
"<br><br><br>",
"<div id='PERMISSIONMENU'>"+
"<a class='text optionGroupLabel'>Create and finish tasks</a>"+
"<div class='optionGroup'>"+
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Own</div>"+
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Assigned to</div>"+
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>All</div>"+
"</div>"+
'<br><div class="HR"></div>'+
"<a class='text optionGroupLabel'>Invite and remove users</a>"+
"<div class='optionGroup'>"+
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>None</div>"+
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Can invite</div>"+
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Can remove</div>"+
"</div>"+
'<br><div class="HR"></div>'+

"<a class='text optionGroupLabel'>User permissions</a>"+
"<div class='optionGroup'>"+
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>None</div>"+
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>can change</div>"+
"</div>"+
'<br><div class="HR"></div>'+

"<a class='text optionGroupLabel'>Rename and remove this project</a>"+
"<div class='optionGroup'>"+
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>None</div>"+
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Rename</div>"+
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Remove</div>"+
"</div>"+
"</div>",

"<br><br><br><br>",
{buttons: [
{button: "CANCEL",onclick: Popup.close},
{button: "CHANGE",onclick: 
function () 
{
let optionGroup=$("#PERMISSIONMENU .optionGroup");
let newPermissions=[
"2",
String(optionGroup[0].value),
String(optionGroup[1].value)+String(optionGroup[2].value),
String(optionGroup[3].value)
];

newPermissions[1]+= optionGroup[0].value > 0 ? optionGroup[0].value : 1;
_member.permissions=JSON.stringify(newPermissions);

let project=Server.getProject(MainContent.curProjectId);
if (!project) return false;

project.users.update(_member);
MainContent.settingsPage.open(MainContent.curProjectId);

Popup.close();
},
important: true,color: COLOR.DANGEROUS}
]}
];

Popup.showNotification(builder);

let permissions=JSON.parse(_member.permissions);
let optionGroup=$("#PERMISSIONMENU .optionGroup");

optionGroup_select(
optionGroup[0].children[
parseInt(permissions[1][0])
]
);
optionGroup_select(
optionGroup[1].children[
parseInt(permissions[2][0])
]
);

optionGroup_select(
optionGroup[2].children[
parseInt(permissions[2][1])
]
);

optionGroup_select(
optionGroup[3].children[
parseInt(permissions[3])
]
);
}
}












function _MainContent_taskHolder() {
let HTML={
todoHolder: $("#mainContentHolder .todoListHolder")[0],
taskPage: $(".mainContentPage")[0]
}


this.deadLineOptionMenu=function() {
let Menu=OptionMenu.create(HTML.taskPage,true);

Menu.removeAllOptions=function() {
for (option of Menu.options) this.options[0].remove();
}

let menu_open=Menu.open;
Menu.open=function(_item,_event) {
menu_open(_item,{left: 0,top: -20},_event);
if (_item.tagName != "INPUT") return;

_item.onkeyup=function(_e) {
menu_open(_item,{left: 0,top: -20});
Menu.openState=true;
Menu.removeAllOptions();

let optionDate=DateNames.toDate(_item.value);
if (!optionDate) return Menu.close();

Menu.addOption(DateNames.toString(optionDate),function () {
_item.value=optionDate.toString();
Menu.close();
},"");

}
}

return Menu;
}();






this.list=[];
this.add=function(_preferences={customAttributes: []},_taskRenderPreferences={},_type="day") {
let taskHolder=buildDayItem(
HTML.todoHolder,
_preferences,
_taskRenderPreferences,
_type
);

this.list.push(taskHolder);
return taskHolder;
}

this.addOverdue=function() {
let project=Server.getProject(MainContent.curProjectId);
let todoList=[]; 
if (project) 
{
todoList=project.todos.getTodosByDate(new Date().moveDay(-1));
} else {
todoList=Server.todos.getByDate(new Date().moveDay(-1));
}

todoList=MainContent.taskPage.renderer.settings.filter(todoList,{
finished: true
});
todoList=MainContent.taskPage.renderer.settings.sort(todoList,[]);

if (!todoList.length) return false;

let item=this.add(
{},
{
displayProjectTitle: !MainContent.curProjectId
},
"overdue"
);

item.createMenu.disable();
item.todo.renderTaskList(todoList);
}



function buildDayItem(_appendTo,_preferences,_taskRenderPreferences,_type) {
let constructor=_taskHolder_day;

switch (_type)
{
case "overdue": constructor=_taskHolder_overdue; break;
case "list": constructor=_taskHolder_list; break;
}

return new constructor(_appendTo,_preferences,_taskRenderPreferences);
}





this.get=function(_id) {
for (let i=0; i < this.list.length; i++)
{
if (this.list[i].id != _id) continue;
return this.list[i];
}
return false;
}

this.remove=function(_id) {
for (let i=0; i < this.list.length; i++)
{
if (this.list[i].id != _id) continue;
this.list.splice(i,1);
return true;
}
return false;
}


this.clear=function() {
HTML.todoHolder.innerHTML="";
this.list=[];
}




this.renderTask=function(_task) {
for (createMenu of this.list) 
{
if (!createMenu.todo.shouldRenderTask(_task)) continue;
createMenu.todo.renderTask(_task);
}
}

this.createTask=function() {
for (let i=0; i < this.list.length; i++)
{
if (!this.list[i].createMenu.openState) continue;
this.list[i].createMenu.createTask();
return true;
}
return false;
}


this.closeAllCreateMenus=function() {
let found=false;
for (let i=0; i < this.list.length; i++)
{
if (!this.list[i].createMenu.openState) continue;
this.list[i].createMenu.close();
found=true;
}
return found;
}
}



















function _taskHolder(_appendTo,_preferences,_renderPreferences,_type) {
let This=this;
this.id=newId();
this.preferences=_preferences;
this.type=_type;

this.HTML={
Parent: _appendTo,
}
this.HTML.Self=renderDayItem(this),

this.createMenu=new _taskHolder_createMenu(this);
this.todo=new _taskHolder_task(this,_renderPreferences);




this.remove=function() {
this.HTML.Self.parentNode.removeChild(this.HTML.Self);
MainContent.taskPage.taskHolder.remove(this.id);
}

this.onTaskFinish=function(_task) {
console.warn("FINISH",_task);
}

this.onTaskRemove=function(_taskId) {
console.warn("REMOVE",_taskId);
this.todo.removeTask(_taskId);
}

function renderDayItem() {
let html=document.createElement("div");
html.className="taskHolder";

html.innerHTML='<div class="header dateHolder"></div>'+
'<div class="todoHolder"></div>'+
'<div class="todoItem createTaskHolder close">'+
'<div class="createMenuHolder">'+
'<input class="text inputField iBoxy clickable taskTitle">'+
'<input class="text inputField iBoxy clickable taskDeadLine" placeholder="Deadline">'+
'<div class="leftHand">'+
'<div class="text button bDefault bBoxy" style="float: left">Create</div>'+
'<div class="text button" style="float: left">Cancel</div>'+
'</div>'+
'<div class="rightHand">'+
'<img src="images/icons/tagIcon.png" class="icon tagIcon clickable">'+
'<img src="images/icons/memberIcon.png" class="icon clickable">'+
'<img src="images/icons/projectIconDark.svg" class="icon projectIcon clickable">'+
'</div>'+
'</div>'+
'<div class="addButtonHolder smallTextHolder clickable" onclick="MainContent.taskHolder.openCreateMenu(this.parentNode)">'+
'<a class="smallText smallTextIcon">+</a>'+
'<div class="smallText">Create Task</div>'+
'</div>'+
'</div>';

This.HTML.createMenu=html.children[2];

if (!This.preferences.title) html.style.marginTop="0";
setTextToElement(html.children[0],This.preferences.title);



let createMenu=This.HTML.createMenu.children[0];
createMenu.children[2].children[0].onclick=function () {This.createMenu.createTask();}
createMenu.children[2].children[1].onclick=function () {This.createMenu.close();}


createMenu.children[3].children[0].onclick=function () {This.createMenu.openTagSelectMenu()}
createMenu.children[3].children[1].onclick=function () {This.createMenu.openMemberSelectMenu()}
createMenu.children[3].children[2].onclick=function () {This.createMenu.openProjectSelectMenu()}

let deadLineField=This.HTML.createMenu.children[0].children[1];
deadLineField.onfocusin=function() {
MainContent.taskPage.taskHolder.deadLineOptionMenu.open(deadLineField);
}
deadLineField.onfocusout=function() {
This.HTML.createMenu.children[0].children[0].focus();
}



createMenu.children[0].placeholder=PLACEHOLDERTEXTS.randomItem();
This.HTML.createMenu.children[1].onclick=function () {This.createMenu.open();}



This.HTML.Parent.append(html);
return html;
}
}









function _taskHolder_createMenu(_Parent) {
let Parent=_Parent;
let This=this;
let HTML={
inputField: Parent.HTML.createMenu.children[0].children[0],
deadLineField: Parent.HTML.createMenu.children[0].children[1],
}

let edit_todo=null;
let edit_todoHTML=null;


this.openState=false;
this.enabled=true;

function setup() {
This.close(false);

let project=Server.getProject(MainContent.curProjectId);
if (!project || !project.users.Self) return;
if (!project.users.Self.taskActionAllowed("update")) This.disable();
};



this.open=function(_editing=false) {
if (!this.enabled) return;

MainContent.taskPage.taskHolder.closeAllCreateMenus();

this.openState=true;
Parent.HTML.createMenu.classList.remove("close");
HTML.inputField.focus();
HTML.inputField.value=null;
HTML.deadLineField.value=null;
if (Parent.date) HTML.deadLineField.value=DateNames.toString(Parent.date);



let buttonTitle="Create";
if (_editing) buttonTitle="Change";
Parent.HTML.createMenu.children[0].children[2].children[0].innerHTML=buttonTitle;

MainContent.searchOptionMenu.openWithInputField(Parent.HTML.createMenu.children[0].children[0]);
}


this.openEdit=function(_todoHTML,_todoId) {
if (!this.enabled) return;

let task=Server.todos.get(_todoId);
if (!task || !_todoHTML) return false;
this.open(true);

edit_todo=task;
edit_todoHTML=_todoHTML;
edit_todoHTML.classList.add("hide");

setEditModeData(task);
}

function setEditModeData(_task) {
let createMenu=Parent.HTML.createMenu;
let project=Server.getProject(_task.projectId);

createMenu.children[0].children[0].value=_task.title;
if (_task.groupType== "date") createMenu.children[0].children[1].value=_task.groupValue;
}



this.close=function() {
this.openState=false;
Parent.HTML.createMenu.classList.add("close");
resetEditMode();
}




this.disable=function() {
this.enabled=false;
Parent.HTML.createMenu.innerHTML="";
}


this.createTask=function() {
if (!this.enabled) return;

let task=scrapeTaskData();
let project=Server.getProject(task.projectId);

if (!project) return false;
if (typeof task != "object") return task;
resetEditMode(true);

project.todos.update(task);
task.projectId=project.id; 

MainContent.taskPage.taskHolder.renderTask(task);

this.close();
MainContent.searchOptionMenu.close();

return true;
}


this.openTagSelectMenu=function() {
openSelectMenu(0,"#",Server.projectList[0].tags.list);
}

this.openMemberSelectMenu=function() {
openSelectMenu(1,"@",Server.projectList[0].users.getList());
}

this.openProjectSelectMenu=function() {
openSelectMenu(2,".",Server.projectList);
}

function openSelectMenu(_iconIndex=0,_indicator=".",_items=[]) {
if (!This.openState) return false;
let item=Parent.HTML.createMenu.children[0].children[2].children[_iconIndex];
MainContent.searchOptionMenu.open(item);

for (item of _items) 
{
MainContent.searchOptionMenu.addSearchItem(
{item: item},
_indicator
);
}
}










function resetEditMode(_deleteTodo=false) {
if (edit_todoHTML) edit_todoHTML.classList.remove("hide");
if (edit_todoHTML && _deleteTodo) edit_todoHTML.parentNode.removeChild(edit_todoHTML);
edit_todoHTML=null;
edit_todo="";
}




function scrapeTaskData() {
let createMenuItems=Parent.HTML.createMenu.children[0].children;
if (!createMenuItems[0]) return false;

let task=_inputValueToData(createMenuItems[0].value);
let date=filterDate(createMenuItems[1].value);

if (!task.title || task.title.split(" ").join("").length < 1) return "E_InvalidTitle";

switch (Parent.type)
{
case "list": 
task.groupType="default";
task.groupValue="";
break;
default: 
if (date) break;
date=Parent.date.copy().toString();
break;
}

if (date) 
{
task.groupType="date";
task.groupValue=date;
if (!task.groupValue) return "E_InvalidDate";
}

return task;
}

function _inputValueToData(_value) {
let task={
assignedTo: [],
id: newId()
};

if (edit_todo) task=edit_todo;
let projects=getListByValue(_value,".");
task.title=projects.value;
if (projects.list[0]) 
{
task.projectId=projects.list[0].id;
} else if (!edit_todo) 
{
let project=Server.getProject(MainContent.curProjectId);
task.projectId=project ? project.id : Server.projectList[0].id;
}

let tags=getListByValue(task.title,"#");
task.title=tags.value;
if (tags.list[0]) task.tagId=tags.list[0].id;

let members=getListByValue(task.title,"@");
task.title=members.value;
for (member of members.list)
{
if (task.assignedTo.includes(member.id)) continue;
task.assignedTo.push(member.id);
}


task.title=removeSpacesFromEnds(task.title);
return task;
}


function getListByValue(_value,_type) {
let items=MainContent.searchOptionMenu.getListByValue(_value,_type);
let found=[];
for (item of items)
{
if (item.score < 1) return {list: found,value: _value};
found.push(item.item);

let parts=_value.split(_type+item.str);
_value=parts.join("");
}

return {list: found,value: _value};
}

function filterDate(_strDate) {
let date=DateNames.toDate(_strDate);
if (date && date.getDateInDays()) return date.toString();
return false;
}

setup();
}








function _taskHolder_task(_parent,_renderPreferences) {
let Parent=_parent;
let RenderPreferences=_renderPreferences;

Parent.HTML.todoHolder=Parent.HTML.Self.children[1];



this.taskList=[];
this.renderTaskList=function(_todoList,_location) {
for (let i=0; i < _todoList.length; i++)
{
if (location)
{
this.renderTask(_todoList[i],_location+i);
continue;
}

this.renderTask(_todoList[i]);
}
}

this.renderTask=function(_task,_location) {
let todos=Parent.HTML.todoHolder.children;
if (typeof _location != "number") _location=todos.length;
_task.taskHolderId=Parent.id;

let task=MainContent.taskPage.renderer.renderTask(_task,Parent,RenderPreferences);

Parent.HTML.todoHolder.insertBefore(
task,
todos[parseInt(_location)]
);

this.taskList.push({
taskId: _task.id,
html: task
});
}


this.removeTask=function(_id) {
for (let i=0; i < this.taskList.length; i++)
{
if (this.taskList[i].taskId != _id) continue;

let html=this.taskList[i].html;
html.classList.add("hide");

var loopTimer=setTimeout(
function () {
html.parentNode.removeChild(html)
},
500
);


this.taskList.splice(i,1);

return true;
}

return false;
}



this.shouldRenderTask=function(_task) {
let renderTask=true;
switch (_task.groupType)
{
case "date": 
if (Parent.type== "day" && 
!Parent.date.compareDate(new Date().setFromStr(_task.groupValue))
) renderTask=false;
break;
case "default": 
if (Parent.type != "list") renderTask=false;
break;
case "overdue": 
if (new Date().setFromStr(_task.groupValue) >= new Date()) renderTask=false;
break;
}

if (Parent.type== "overdue")
{
if (new Date().setFromStr(_task.groupValue) >= new Date()) renderTask=false;
}

if (MainContent.curProjectId && MainContent.curProjectId != _task.projectId) renderTask=false;
return renderTask;
}
}











function _taskHolder_day(_appendTo,_preferences,_renderPreferences) {
_preferences.title=DateNames.toString(_preferences.date,false);
this.date=_preferences.date;
_taskHolder.call(this,_appendTo,_preferences,_renderPreferences,"day");
}


function _taskHolder_list(_appendTo,_preferences,_renderPreferences) {
_preferences.title="";
_taskHolder.call(this,_appendTo,_preferences,_renderPreferences,"list");
}


function _taskHolder_overdue(_appendTo,_preferences,_renderPreferences) {
_preferences.title="Overdue";
_taskHolder.call(this,_appendTo,_preferences,_renderPreferences,"overdue");

this.HTML.Self.classList.add("overdue");

this.onTaskFinish=function(_task) {
let taskId=_task.id ? _task.id : _task;
this.todo.removeTask(taskId);
if (this.todo.taskList.length > 0) return;
this.remove();
}
this.onTaskRemove=this.onTaskFinish;
}


function _TaskRenderer_settings() {
let HTML={
mainContentHolder: mainContentHolder,
}
const sortOptions=[
"finished",
"assignment",
"ownership",
"alpha"
];

return {
sort: function(_taskList,_settings=[]) {
let settings=createSortPriorityList(_settings);

for (let s=settings.length - 1; s >= 0; s--)
{
_taskList=sortByType(_taskList,settings[s]);
}

return _taskList;
},


filter: function(_list,_filter={}) {
for (let i=_list.length - 1; i >= 0; i--)
{
let item=_list[i];
let project=Server.getProject(item.projectId);
let userId=project.users.Self.id;

if (item.finished != _filter.finished && _filter.finished != undefined) continue;
if (item.assignedTo.includes(userId)!= _filter.assignedTo && _filter.assignedTo != undefined) continue;
if ((item.creatorId== userId)!= _filter.ownTask&& _filter.ownTask != undefined) continue;

_list.splice(i,1);
}
return _list;
}
}





function createSortPriorityList(_settings) {
let newSettings=Object.assign([],sortOptions);
newSettings=newSettings.filter(
function(el) {
return !_settings.includes(el);
}
);

return _settings.concat(newSettings);
}




function sortByType(_list,_type="alpha") {
switch (_type)
{
case "alpha": return _sortByProperty(_list,"title"); break;
case "finished": return _sortByProperty(_list,"finished"); break;
case "project": return _sortByProject(_list); break;
case "tag": return _sortByTag(_list); break;
case "assignment": return _sortByAssignment(_list);break;
case "ownership": return _sortByOwnership(_list);break;
default: console.error("renderSettings.js: Sorttype "+_type+" doesn't exist."); break;
}
}
function _sortByProperty(_list,_property) {
return _list.sort(function(a,b){
 if (a[_property] < b[_property]) return -1;
if (a[_property] > b[_property]) return 1;
return 0;
});
}

function _sortByProject(_list) {
return _list.sort(function(a,b) {
let projectTitleA=Server.getProject(a.projectId).title;
let projectTitleB=Server.getProject(b.projectId).title;
if (projectTitleA < projectTitleB) return -1;
if (projectTitleA > projectTitleB) return 1;
return 0;
});
}

function _sortByTag(_list) {
return _list.sort(function(a,b) {
let projectA=Server.getProject(a.projectId);
let projectB=Server.getProject(b.projectId);

let tagTitleA=projectA.tags.get(a.tagId,false) ? projectA.tags.get(a.tagId,false).title : "ZZZZZ";
let tagTitleB=projectB.tags.get(b.tagId,false) ? projectB.tags.get(b.tagId,false).title : "ZZZZZ";

if (tagTitleA < tagTitleB) return -1;
if (tagTitleA > tagTitleB) return 1;
return 0;
});
}

function _sortByAssignment(_list) {
return _list.sort(function(a,b) {
let projectA=Server.getProject(a.projectId);
let projectB=Server.getProject(b.projectId);

let assignedA=a.assignedTo.includes(projectA.users.Self.id);
let assignedB=b.assignedTo.includes(projectB.users.Self.id);

if (assignedA) return -1;
if (assignedB) return 1;
return 0;
});
}


function _sortByOwnership(_list) {
return _list.sort(function(a,b) {
let projectA=Server.getProject(a.projectId);
let projectB=Server.getProject(b.projectId);

let ownershipA=a.creatorId== projectA.users.Self.id;
let ownershipB=b.creatorId== projectB.users.Self.id;

if (ownershipA) return 1;
if (ownershipB) return -1;
return 0;
});
}
}


function _TaskRenderer() {
let This=this;

this.settings=new _TaskRenderer_settings();


this.renderTask=function(_task,_taskHolder,_renderSettings) {
if (!_task) return false;
let project=Server.getProject(_task.projectId);
let tag=project.tags.get(_task.tagId);

let todoRenderData={
id: _task.id,
title: _task.title,
taskHolderId: _task.taskHolderId,
finished: _task.finished,

assignedToMe: _task.assignedTo.includes(project.users.Self.id),
isMyTask: _task.creatorId== project.users.Self.id,

memberText: _createMemberTextByUserIdList(_task.assignedTo,project),
}
if (_task.groupType== "date" && _renderSettings.displayDate !== false)
{
todoRenderData.deadLineText=DateNames.toString(
new Date().setDateFromStr(_task.groupValue),
true
);
} 

if (_renderSettings.displayProjectTitle !== false) todoRenderData.projectTitle=project.title;
if (tag) todoRenderData.tagColour=tag.colour;

let html=createTaskHTML(todoRenderData,_taskHolder);



setDOMData(html,_task,_taskHolder);
return html;
}

function setDOMData(_element,_task,_taskHolder) {
let data=new taskConstructor(_element,_task,_taskHolder);

DOMData.set(_element,data);
}





function _createMemberTextByUserIdList(_userIdList,_project) {
let memberList=[];
for (id of _userIdList)
{
let user=_project.users.get(id);
if (!user || isPromise(user)) continue;
memberList.push(user);
}

return App.delimitMemberText(memberList,20);
}





function createTaskHTML(_toDoData,_taskHolder) {
let html=document.createElement("div");
html.className="listItem todoItem";
if (_toDoData.finished) html.classList.add("finished");
if (_toDoData.assignedToMe) html.classList.add("isSelf");
if (_toDoData.isMyTask) html.classList.add("isMyTask");


const statusCircleSVG='<?xml version="1.0" standalone="no"?><svg class="statusCircle clickable" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 83 83" width="83" height="83"><defs><clipPath id="_clipPath_EvyxEBqQoipdaXxIJMEjCjvXV7edc1qw"><rect width="83" height="83"/></clipPath></defs><g clip-path="url(#_clipPath_EvyxEBqQoipdaXxIJMEjCjvXV7edc1qw)"><rect x="0.729" y="42.389" width="43.308" height="20" transform="matrix(0.707,0.707,-0.707,0.707,43.601,-0.482)"/><rect x="16.22" y="30.02" width="70" height="20" transform="matrix(0.707,-0.707,0.707,0.707,-13.296,47.939)"/></g></svg>';
html.innerHTML="<div class='isMyTaskIndicator'></div>"+
"<div class='statusCircleHitBox'>"+statusCircleSVG+"</div>"+
'<div class="titleHolder text userText"></div>'+
 '<div class="functionHolder">'+
'<img src="images/icons/optionIcon.png" onclick="MainContent.optionMenu.open(this)" class="functionItem optionIcon icon clickable">'+
'<div class="functionItem projectHolder"></div>'+
'<div class="functionItem deadLineHolder userText"></div>'+
'<div class="functionItem memberList userText"></div>'+
'</div>';


setTextToElement(html.children[2],_toDoData.title);
if (_toDoData.memberText) setTextToElement(html.children[3].children[3],_toDoData.memberText);
if (_toDoData.deadLineText) setTextToElement(html.children[3].children[2],_toDoData.deadLineText);
if (_toDoData.projectTitle) 
{
let projectTitleHolder=html.children[3].children[1];
let projectTitleHtml='<img src="images/icons/projectIconDark.svg" class="functionItem projectIcon">'+
'<div class="functionItem projectTitle userText"></div>';
projectTitleHolder.innerHTML=projectTitleHtml;
setTextToElement(projectTitleHolder.children[1],_toDoData.projectTitle);
}


if (_toDoData.tagColour)
{
let tagColour=stringToColour(_toDoData.tagColour);
let colorTarget=html.children[1].children[0]; 
colorTarget.style.backgroundColor=colourToString(
mergeColours(
tagColour,
{r: 255,g: 255,b: 255,a: 0.1},
.15
)
);

colorTarget.style.borderColor=colourToString(
mergeColours(
tagColour,
{r: 220,g: 220,b: 220},
.2
)
);


colorTarget.style.fill=colourToString(
mergeColours(
tagColour,
{r: 130,g: 130,b: 130},
.2
)
);
}


return _assignEventHandlers(html,_toDoData,_taskHolder);
}

function _assignEventHandlers(_html,_toDoData,_taskHolder) {
_html.children[1].onclick=function() {
let data=DOMData.get(_html);
let project=Server.getProject(data.projectId);
let task=project.todos.get(data.taskId);

if (!project.users.Self.taskActionAllowed("finish",task)) return false;

data.finish();
}

DoubleClick.register(_html,function() {
let data=DOMData.get(_html);
let project=Server.getProject(data.projectId);
let task=project.todos.get(data.taskId);

if (!project.users.Self.taskActionAllowed("update",task)) return false;
data.openEdit();
});

RightClick.register(_html,function(_event,_html) {
MainContent.optionMenu.open(_html.children[2].children[0],_event);
});


return _html;
}
}




function taskConstructor(_element,_task,_taskHolder) {
this.taskId=_task.id;
this.projectId=_task.projectId;
this.html=_element;

this.taskHolder=_taskHolder;


this.finish=function() {
let task=Server.todos.get(this.taskId);

if (task.finished)
{
this.html.classList.remove("finished");
task.finished=false;
} else {
this.html.classList.add("finished");
task.finished=true;
}

let project=Server.getProject(this.projectId);
project.todos.update(task,true);
this.taskHolder.onTaskFinish(task);
}


this.remove=function() {
let project=Server.getProject(this.projectId);
project.todos.remove(this.taskId);
this.taskHolder.onTaskRemove(this.taskId);
}


this.openEdit=function() {
this.taskHolder.createMenu.openEdit(this.html,this.taskId);
}

}

function _MainContent() {
let HTML={
mainContent: $("#mainContent")[0],
pages: $("#mainContent .mainContentPage"),
}

this.curProjectId="";

this.header=new _MainContent_header();

this.optionMenu=new _MainContent_optionMenu();
this.searchOptionMenu=new _MainContent_searchOptionMenu();




this.leaveCurrentProject=function() {
let project=Server.getProject(this.curProjectId);
if (!project) return false;
project.leave();
this.taskPage.tab.open("Inbox");
App.update();
}

this.removeCurrentProject=function() {
let project=Server.getProject(this.curProjectId);
if (!project) return false;
project.remove();

this.taskPage.tab.open("Inbox");
App.update();
}

this.openRenameProjectMenu=function() {
let project=Server.getProject(MainContent.curProjectId);
if (!project) return false;
let builder=[
{title: "RENAME PROJECT"},
"<br><br>",
{text: "Rename "},
{text: project.title,highlighted: true},
{text: " to:"},
"<br><br>",
{input: "Project title",value: project.title,id: "RENAMEPROJECTValueHolder",focus: true,customClass: "text"},
"<br><br>",
"<br><br>",
"<br>",
{buttons: [
{button: "CANCEL",onclick: Popup.close},
{button: "RENAME",onclick: MainContent.renameProjectFromPopup,
important: true,color: COLOR.DANGEROUS}
]}
];

Popup.showNotification(builder);
}

this.renameProjectFromPopup=function() {
let project=Server.getProject(MainContent.curProjectId);
if (!project) return false;

let newTitle=$("#RENAMEPROJECTValueHolder")[0].value;
if (!newTitle || newTitle.length < 3) return false;

project.rename(newTitle).then(function () {
Popup.close();
App.update();
});
}


this.curPage= false;
this.createProjectPage= new _MainContent_createProjectPage();
this.settingsPage=new _MainContent_settingsPage();
this.taskPage=new _MainContent_taskPage();


this.openPage=function(_pageName,_projectId) {
$(HTML.mainContent).animate({opacity: 0},50);
resetPage();

let page=this[_pageName+"Page"];
if (!page || !page.pageSettings) return console.warn("MainContent.openPage: "+_pageName+" doesn't exist.");

this.curProjectId=_projectId;
this.curPageName=page.pageSettings.pageName;

setTimeout(function () {
if (!page.pageSettings.customHeaderSetting) MainContent.header.showItemsByPage(page.pageSettings.pageName);
openMenuByIndex(page.pageSettings.pageIndex);
page.pageSettings.onOpen(_projectId);
},55);


$(HTML.mainContent).delay(50).animate({opacity: 1},50);
}
function openMenuByIndex(_index) {
for (let i=0; i < HTML.pages.length; i++) if (i != _index) HTML.pages[i].classList.add("hide");
HTML.pages[parseInt(_index)].classList.remove("hide");}
function resetPage() {MainContent.optionMenu.close();}}
function _MainContent_optionMenu() {
let HTML={
mainContentHolder: mainContentHolder,
contentHolder: $("#mainContentHolder .mainContentPage")[0],
menu: $("#mainContentHolder .optionMenuHolder")[0]
}
let This=this;

let curDOMData;

let Menu=OptionMenu.create(HTML.mainContentHolder);
Menu.addOption(
"Remove",
function () {
return curDOMData.remove();
},
"images/icons/removeIcon.png"
);

Menu.addOption(
"Finish",
function () {
return curDOMData.finish();
},
"images/icons/checkIcon.svg"
);

Menu.addOption(
"Edit",
function () {
return curDOMData.openEdit();
},
"images/icons/changeIconDark.png"
);


this.open=function(_item,_event) {
curDOMData=DOMData.get(_item.parentNode.parentNode);
let project=Server.getProject(curDOMData.projectId);
let task=project.todos.get(curDOMData.taskId);

Menu.enableAllOptions();
if (!project.users.Self.taskActionAllowed("remove",task)) Menu.options[0].disable();
if (!project.users.Self.taskActionAllowed("finish",task)) Menu.options[1].disable();
if (!project.users.Self.taskActionAllowed("update",task)) Menu.options[2].disable();


return Menu.open(_item,{top: -20,left: 0},_event);
}

this.openState=Menu.openState;
this.close=Menu.close;
}












function _MainContent_searchOptionMenu() {
let HTML={
menu: $("#mainContentHolder .optionMenuHolder.searchOption")[0],
mainContentHolder: mainContentHolder,
scrollYHolder: $("#mainContentHolder .mainContentPage")[0]
}
let This=this;
let curProject;
let inputField;
let keyupTimeout=0;

this.openState=false;
this.open=function(_item) {
if (!_item) return;

let project=Server.getProject(MainContent.curProjectId);
let projectId=project ? project.id : Server.projectList[0].id;
curProject=Server.getProject(projectId);

HTML.menu.innerHTML="";
HTML.menu.classList.remove("hide");
this.openState=true;

moveToItem(_item,0);
}


this.openWithInputField=function(_item) {
if (!_item || _item.type != "text") return;

inputField=_item;
keyupTimeout=0;
inputField.onkeyup=function() {
if (keyupTimeout > 0) return keyupTimeout--;

addListItemsByValue(this.value,this.selectionStart);
moveToItem(this,this.selectionStart);
}

this.open(_item);
}


this.hide=function(_reFocusTextElement=false,_setTimeOut=5) {
this.openState=false;
if (!inputField) return;
keyupTimeout=_setTimeOut;
HTML.menu.classList.add("hide");
if (_reFocusTextElement) inputField.focus();
}


this.close=function() {
this.openState=false;

inputField.onkeyup=null;
inputField=null;

HTML.menu.classList.add("hide");
setTimeout('$("#mainContentHolder .optionMenuHolder.searchOption")[0].style.top="-50px";',300);
}

this.chooseFirstSearchItem=function() {
let searchItem=$(".searchOption .optionItem.clickable")[0];
if (!searchItem) return false;
searchItem.click();
return true;
}



this.getItemListByType=function(_type,_project) {
if (!_project) _project=curProject;
if (!_project) _project=Server.projectList[0];
switch (_type)
{
case "#": return _project.tags.list; break;
case ".": return Server.projectList; break;
default: return _project.users.getList(); break;
}
}



function addListItemsByValue(_value,_cursorPosition) {
HTML.menu.innerHTML="";
HTML.menu.classList.remove("hide");
This.openState=true;

if (addListItemsByValueAndType(_value,_cursorPosition,"#")) return;
if (addListItemsByValueAndType(_value,_cursorPosition,"@")) return;
if (addListItemsByValueAndType(_value,_cursorPosition,".")) return;

This.hide(false,0);
}

function addListItemsByValueAndType(_value,_cursorPosition,_type) {
let active=0;
let items=This.getListByValue(_value,_type,_cursorPosition);
for (let i=0; i < items.length; i++)
{
if (!items[i].active) continue;
This.addSearchItem(items[i],_type);
active++;
}

return active > 0;
}

this.getListByValue=function(_value,_type,_cursorPosition) {
let found=[];
let itemList=This.getItemListByType(_type);

for (let i=0; i < itemList.length; i++)
{
let item=_checkValueByItem(_value,itemList[i],_type);
if (!item) continue;

item.active=false;
if (item.startAt <= parseInt(_cursorPosition) && item.length+item.startAt >= parseInt(_cursorPosition)) item.active=true;

found.push(item);
}

return found.sort(function(a,b){
 if (a.score < b.score) return 1;
if (a.score > b.score) return -1;
return 0;
});
}

function _checkValueByItem(_value,_item,_type="#") {
let valueParts=_value.split(_type);
let scores=[];
let itemTitle=_item.title ? _item.title : _item.name;

for (let v=1; v < valueParts.length; v++)
{
let cValue=valueParts[v];
let valueTillHere=Object.assign([],valueParts).splice(0,v).join("#");
let startAt=valueTillHere.length;

for (let i=0; i < cValue.length; i++)
{
let curSubString=cValue.substr(0,i+1);
let item={
startAt: startAt,
length: i+2,
str: curSubString,
score: similarity(curSubString,itemTitle),
item: _item
}
scores.push(item);
}
}

if (scores.length < 1) return false;
return scores.sort(function(a,b){
 if (a.score < b.score) return 1;
if (a.score > b.score) return -1;
return 0;
})[0];
}





this.addSearchItem=function(_item,_type="@") {
let html=document.createElement("div");
html.className="optionItem clickable";
html.innerHTML="<div class='userText optionText'></div>";
HTML.menu.append(html);

let result=createSearchItemIconByType(_type,_item);
html.insertAdjacentHTML("afterbegin",result.htmlStr);
setTextToElement(html.children[1],result.title);

html.addEventListener("click",function() {
if (!inputField) return;
let inValue=inputField.value;
let partA=inValue.substr(0,_item.startAt);
let partB=inValue.substr(_item.startAt+_item.length,inValue.length - _item.startAt - _item.length);
let newStr=partA+_type+result.title+partB;
inputField.value=newStr;

if (_type== ".") curProject=_item.item;

This.hide(true,1);
});
}


function createSearchItemIconByType(_type,_item) {
let title="";
let htmlStr="";
switch (_type)
{
case ".": 
htmlStr="<img src='images/icons/projectIconDark.svg' class='optionIcon'>";
title=_item.item.title;
break;
case "#": 
htmlStr="<div class='optionIcon statusCircle'></div>";
title=_item.item.title;
break;
default:
htmlStr="<img src='images/icons/memberIcon.png' style='opacity: 0.3' class='optionIcon'>";
title=_item.item.name;
break;
}

return {title: title,htmlStr: htmlStr}
}


function moveToItem(_item,_characterIndex=0) {
if (!_item) return false;
let top=_item.getBoundingClientRect().top+HTML.scrollYHolder.scrollTop - 25;
let left=_item.getBoundingClientRect().left - HTML.scrollYHolder.getBoundingClientRect().left;
_characterIndex -= 1;
left+= _characterIndex * 6.2 - 10;

let maxLeft=$("#mainContent")[0].offsetWidth - HTML.menu.offsetWidth - 15;
if (left > maxLeft) left=maxLeft;

HTML.menu.style.left=left+"px";
HTML.menu.style.top=top+"px";
}
}






























function _SideBar() {
this.projectList=new _SideBar_projectList();


}


function _SideBar_projectList() {
let HTML={
projectList: $("#sideBar .projectListHolder .projectList")[0],
projectsHolder: $("#sideBar .projectListHolder .projectList")[0].children[0],
dropDownIcon: $(".projectListHolder .header .dropDownButton")[0],
}


this.openState=true;

this.toggleOpenState=function() {
if (this.openState) return this.close();
this.open();
}


this.open=function() {
this.openState=true;
HTML.dropDownIcon.classList.remove("close");
HTML.projectList.classList.remove("hide");
}

this.close=function() {
this.openState=false;
HTML.dropDownIcon.classList.add("close");
HTML.projectList.classList.add("hide");
}






this.fillProjectHolder=function() {
HTML.projectsHolder.innerHTML="";
for (let i=0; i < Server.projectList.length; i++)
{
_createProjectHTML(Server.projectList[i]);
}
}

function _createProjectHTML(_project) {
if (!_project) return;
let html=document.createElement("div");
html.className="header small clickable";
html.innerHTML='<img src="images/icons/projectIcon.png" class="headerIcon">'+
 '<div class="headerText userText"></div>';

setTextToElement(html.children[1],_project.title);
html.onclick=function() {MainContent.taskPage.tab.open("Project",_project.id);}

HTML.projectsHolder.append(html);
}
}









const Encoder=new function() {
this.objToString=function(_JSON) {
let jsonStr=JSON.stringify(_JSON);
jsonStr=jsonStr.replace(/\+/g,"<plusSign>");

return encodeURIComponent(jsonStr);
}

this.encodeString=encodeURIComponent;


this.decodeObj=function(_jsonObj) {
let jsonStr=JSON.stringify(_jsonObj);
jsonStr=jsonStr.replace(/<plusSign>/g,"+");

return JSON.parse(jsonStr);
}
}

function _Server_project_dataTypeTemplate(_projectId,_dataTypeTemplate) {
this.DataType=Object.keys(_dataTypeTemplate)[0];
this.DataTypeTemplate=_dataTypeTemplate[this.DataType];
this.DataTypeIdKey=Object.keys(this.DataTypeTemplate)[0];

let projectId=String(_projectId);
let This=this;
this.list=[];




this.get=function(_id,_askServer=true) {
for (let i=0; i < this.list.length; i++)
{
if (this.list[i][this.DataTypeIdKey] != _id) continue;
return this.list[i];
}

if (_askServer) return this.DB.get(_id);

return false;
}


this.update=function(_newItem,_updateServer=true) {
let newItem=_filterData(_newItem);
if (!newItem) return false;
if (_updateServer)this.DB.update(newItem);

for (let i=0; i < this.list.length; i++)
{
if (this.list[i][this.DataTypeIdKey] != newItem[this.DataTypeIdKey]) continue;
return this.list[i]=newItem;
}

this.list.push(newItem);
return newItem;
}


this.remove=function(_id,_removeFromServer=true) {
if (_removeFromServer) this.DB.remove(_id);
for (let i=0; i < this.list.length; i++)
{
if (this.list[i][this.DataTypeIdKey] != _id) continue;
this.list.splice(i,1);
return true;
}
return false;
}




this.DB=new function() {
this.update=function(_newItem) {
let parameters="projectId="+projectId+"&dataType="+This.DataType+"&method=update&parameter="+Encoder.objToString(_newItem);
return REQUEST.send("database/project/simpleOperation.php",parameters).then(
function (_result) {
if (typeof _result != "object") return;
console.log(_result);
This.update(_result,false);
}
).catch(function () {});
}
 

this.get=function(_id) {
let parameters="projectId="+projectId+"&dataType="+This.DataType+"&method=get&parameter="+_id;
return REQUEST.send("database/project/simpleOperation.php",parameters).then(
function (_result) {
if (typeof _result != "object") return false;
This.update(_result,false);
}
).catch(function () {});
}

this.remove=function(_id) {
let parameters="projectId="+projectId+"&dataType="+This.DataType+"&method=remove&parameter="+_id;
REQUEST.send("database/project/simpleOperation.php",parameters).then(
function (_result) {
console.warn("REMOVE: "+_id,_result);
}
).catch(function () {});
}


this.getAll=function() {
let parameters="projectId="+projectId+"&dataType="+This.DataType+"&method=getAll"
return REQUEST.send("database/project/simpleOperation.php",parameters).then(
function (_results) {
if (typeof _results != "object") return false;
for (let i=0; i < _results.length; i++) This.update(_results[i],false);
}
).catch(function () {});
}

}








function _filterData(_data) {
_data=Encoder.decodeObj(_data);

let data={};
let keys=Object.keys(This.DataTypeTemplate);

if (!_data[keys[0]]) _data[keys[0]]=newId();

for (let i=0; i < keys.length; i++) 
{
let curKey= keys[i];
let curKeyType=This.DataTypeTemplate[keys[i]];

if (!_data[curKey]) _data[curKey]="";

let curValue=__valueToType(_data[curKey],curKeyType);
data[curKey]=curValue;
}
return data;
}
function __valueToType(_value,_type="int") {
switch (_type) 
{
case "String":return String(_value); break;
case "Array": 
if (typeof _value== "object" && typeof _value.length== "number") return _value;
if (!_value) return [];
return Array(_value);
break;
case "float": return parseFloat(_value); break;
case "Boolean": return Boolean(_value);break;
default:return parseInt(_value); break;
}
}

}










function _Server_project_userComponent(_parent) {
let Parent=_parent;
let This=this;

let DTTemplate=new _Server_project_dataTypeTemplate( 
Parent.id,
{
users: {
id: "String",
name: "String",
permissions:"String",
Self: "Boolean",
isOwner:"Boolean",
type: "String"
}
}
);

this.Self=false;

this.get= function(_id) {return DTTemplate.get(_id);}
this.update=function(_newItem){return DTTemplate.update(_newItem);}
this.remove=function(_id) {return DTTemplate.remove(_id);}

this.getList= function(){return DTTemplate.list;}
this.sync=function(){return DTTemplate.DB.getAll();}


this.inviteUserByEmail=function(_email) {
_email=String(_email);
if (_email.length < 5)return "E_emailTooShort";
if (_email.split("@").length== 1)return "E_invalidEmail";
if (_email.split(".").length== 1)return "E_invalidEmail";

return DTTemplate.DB.inviteUserByEmail(_email);
}
DTTemplate.DB.getAll=function() {
if (typeof _date== "object") _date=_date.toString();
let parameters="projectId="+Parent.id+"&dataType="+DTTemplate.DataType+"&method=getAll"

return REQUEST.send("database/project/simpleOperation.php",parameters).then(
function (_results) {
if (typeof _results != "object") return false;
DTTemplate.list=[];
for (let i=0; i < _results.length; i++)
{
if (_results[i].Self) This.Self=new _Server_project_userComponent_Self(_results[i]);
DTTemplate.update(_results[i],false);
}
}
).catch(function () {});
}
DTTemplate.DB.inviteUserByEmail=function(_email) {
return REQUEST.send("/git/todo/database/project/simpleOperation.php",
"projectId="+Parent.id+"&dataType=users&method=inviteByEmail&parameter="+Encoder.encodeString(_email)
);
}
}



function _Server_project_userComponent_Self(_user) {
this.id=_user.id;
this.name=_user.name;
let isOwner=_user.isOwner;
let Permissions=JSON.parse(_user.permissions);




this.taskActionAllowed=function(_action,_task) {
switch (String(_action).toLowerCase())
{
case "remove":
if (Permissions[1][1] >= 2) return true;
if (Permissions[1][1] >= 1 && _task.creatorId== this.id) return true;
break;
case "update": 
if (Permissions[1][1] >= 2) return true;
if (Permissions[1][1] >= 1 && !_task) return true;
if (Permissions[1][1] >= 1 && _task.creatorId== this.id) return true;
break;
case "finish": 
if (Permissions[1][0] >= 2) return true;
if (Permissions[1][0] >= 1 && _task.assignedT.includes(this.id))return true;
if (Permissions[1][0] >= 0 && _task.creatorId== this.id) return true;
break;
default: 
console.error("Server.project.users.Self.taskActionAllowed: Action ",_action," was not found.");
break;
}

return false;
}

this.userActionAllowed=function(_action,_user) {
switch (String(_action).toLowerCase())
{
case "remove":
if (Permissions[2][0] >= 2 && (!_user.isOwner || isOwner)) return true;
break;
case "update": 
if (Permissions[2][1] >= 1 && (!_user.isOwner || isOwner)) return true;
break;
case "invite": 
if (Permissions[2][0] >= 1) return true;
break;
default: 
console.error("Server.project.users.Self.userActionAllowed: Action ",_action," was not found.");
break;
}

return false;
}

 this.projectActionAllowed=function(_action) {
switch (String(_action).toLowerCase())
{
case "remove":
if (Permissions[3][0] >= 2) return true;
break;
case "rename": 
if (Permissions[3][0] >= 1) return true;
break;
default: 
console.error("Server.project.users.Self.projectActionAllowed: Action ",_action," was not found.");
break;
}

return false;
}
}








function _Server_project_todoComponent(_parent) {
let Parent=_parent;
let This=this;

let DTTemplate=new _Server_project_dataTypeTemplate( 
Parent.id,
{
todos: {
id: "String",
title:"String",
groupType:"String",
groupValue: "String",
projectId:"String",
tagId:"String",
assignedTo: "Array",
creatorId:"String",
finished: "Boolean"
}
}
);
this.DTTemplate=DTTemplate;

this.list=DTTemplate.list;
this.get= function(_id,_askServer=false) {return DTTemplate.get(_id,_askServer);}
this.remove=function(_id) {return DTTemplate.remove(_id);}

this.update=function(_newItem,_updateServer=true) {
_newItem.projectId=Parent.id;
if (!_newItem.creatorId) _newItem.creatorId=Parent.users.Self.id;

let foundTask=Server.todos.get(_newItem.id);
if (foundTask && foundTask.projectId != Parent.id)
{
Server.getProject(foundTask.projectId).todos.remove(foundTask.id);
}

return DTTemplate.update(_newItem,_updateServer);
}


this.getTasksByGroup=function(_type="",_value="",_askServer) {
let tasksOnDate=[];

if (_askServer) DTTemplate.DB.getByGroup(_type,_value);

for (let i=0; i < DTTemplate.list.length; i++)
{
let curItem=DTTemplate.list[i];
if (curItem.groupType != _type) continue;
if (curItem.groupValue != _value) continue;
tasksOnDate.push(curItem);
}
return tasksOnDate;
}

this.getTasksByDateRange=function(_date,_range,_askServer) {
let tasksOnDate=[];
let minDate=new Date().setDateFromStr(_date);
let maxDate=minDate.copy().moveDay(_range);

if (_askServer) DTTemplate.DB.getByDateRange(_date,_range);

for (let i=0; i < DTTemplate.list.length; i++)
{
let curItem=DTTemplate.list[i];
if (curItem.groupType != "date") continue;
let curItemsDate=new Date().setDateFromStr(curItem.groupValue);

if (!curItemsDate.dateIsBetween(minDate,maxDate)) continue;
tasksOnDate.push(curItem);
}
return tasksOnDate;
}


this.getTodosByDate=function(_date,_askServer) {
let todosOnDate=[];
let targetDate=new Date().setDateFromStr(_date);

if (_askServer) DTTemplate.DB.getByDate(_date);

for (let i=0; i < DTTemplate.list.length; i++)
{
let curItem=DTTemplate.list[i];
if (curItem.groupType != "date") continue;
let curItemsDate=new Date().setDateFromStr(curItem.groupValue);
if (!curItemsDate.compareDate(targetDate)) continue;
todosOnDate.push(curItem);
}
return todosOnDate;
}


this.sync=function() {
DTTemplate.DB.getByDateRange(new Date().moveDay(-1),8);
DTTemplate.DB.getByGroup("default","");
}


DTTemplate.DB.getAll=null;
DTTemplate.DB.getByGroup=function(_groupName,_groupValue) {
let parameters="projectId="+Parent.id+"&dataType="+DTTemplate.DataType+"&method=getByGroup&parameter="+JSON.stringify({type: _groupName,value: _groupValue});
return REQUEST.send("database/project/simpleOperation.php",parameters).then(
function (_results) {
if (typeof _results != "object") return false;

for (let i=0; i < _results.length; i++) 
{
_results[i].projectId=Parent.id;
DTTemplate.update(_results[i],false);
}
}
).catch(function () {});
}

DTTemplate.DB.getByDate=function(_date) {
return DTTemplate.DB.getByDateRange(_date,1);
}

DTTemplate.DB.getByDateRange=function(_date,_range) {
if (typeof _date== "object") _date=_date.toString();
let actualParams={date: _date,range: _range};
let parameters="projectId="+Parent.id+"&dataType="+DTTemplate.DataType+"&method=getByDateRange&parameter="+JSON.stringify(actualParams);

return REQUEST.send("database/project/simpleOperation.php",parameters).then(
function (_results) {
if (typeof _results != "object") return false;

for (let i=0; i < _results.length; i++) 
{
_results[i].projectId=Parent.id;
DTTemplate.update(_results[i],false);
}
}
).catch(function () {});
}

}





function _Server_project_tagComponent(_parent) {
let Parent=_parent;

let DTTemplate=new _Server_project_dataTypeTemplate( 
Parent.id,
{
tags: {
id: "String",
title:"String",
colour: "String",
creatorId:"String"
}
}
);

this.list=DTTemplate.list;


this.get=function(_id,_askServer=false){return DTTemplate.get(_id,_askServer);}
this.update=function(_newItem){return DTTemplate.update(_newItem);}
this.remove=function(_id) {return DTTemplate.remove(_id);}


this.sync=function() {
DTTemplate.DB.getAll();
}
}

function _Server_project(_projectId,_projectTitle) {
let This= this;
this.id=String(_projectId);
this.title= String(_projectTitle);

this.todos= new _Server_project_todoComponent(this);
this.users= new _Server_project_userComponent(this);
this.tags=new _Server_project_tagComponent(this);




this.leave=function() {
let users=this.users.getList();
for (user of users)
{
if (!user.Self) continue;
Server.removeProject(this.id);
return this.users.remove(user.id);
}
}


this.rename=function(_newTitle) {
if (!_newTitle) return false;
return new Promise(function (resolve,error) {
This.DB.rename(_newTitle).then(function () {
this.title=_newTitle;
resolve();
});
});
}



this.remove=function() {
this.DB.remove().then(function () {
Server.removeProject(This.id);
console.warn("Succesfully removed this project");

}).catch(function (_error) {
console.warn(_error);
});
}




this.sync=function() {
this.users.sync();
this.todos.sync();
}


this.DB=new function() {
this.rename=function(_newTitle) {
return new Promise(function (resolve,error) {
REQUEST.send("database/project/changeProjectTitle.php","projectId="+This.id+"&newTitle="+Encoder.encodeString(_newTitle)).then(
function (_response) {
if (_response=== 1) resolve();
error(_response);
}
);
});
}

this.remove=function() {
return new Promise(function (resolve,error) {
REQUEST.send("database/project/removeProject.php","projectId="+This.id).then(
function (_response) {
if (_response=== 1) resolve();
error(_response);
}
);
});
}

}
}

const Server=new _Server;
function _Server() {
let This=this;
this.projectList=[];

this.createProject=function(_title) {
return Server.DB.createProject(_title);
};

this.removeProject=function(_id) {
for (let i=0; i < this.projectList.length; i++)
{
if (this.projectList[i].id != _id) continue;
this.projectList.splice(i,1);
}
return false;
}


this.getProject=function(_id) {
for (let i=0; i < this.projectList.length; i++)
{
if (this.projectList[i].id != _id) continue;
return this.projectList[i];
}
return false;
}






this.todos=new function() {
this.getByDate=function(_date) {
let todos=[];
for (let i=0; i < This.projectList.length; i++)
{
let curProject=This.projectList[i];
todos=todos.concat(curProject.todos.getTodosByDate(_date));
}
return todos;
}

this.get=function(_id) {
for (let i=0; i < This.projectList.length; i++)
{
let curProject=This.projectList[i];
let foundTodo=curProject.todos.get(_id);

if (!foundTodo || isPromise(foundTodo)) continue;
foundTodo.projectId=curProject.id;
return foundTodo;
}

return false;
}
}


 











this.sync=function(_) {
console.warn("Server.sync()");
return new Promise(
function (resolve,reject) {
Server.DB.getProjects().then(
function () {
_syncProjectContents();
var loopTimer=setTimeout(resolve,100);
}
);
}
)
}

function _syncProjectContents() {
for (let i=0; i < This.projectList.length; i++)
{
This.projectList[i].sync();
}
}



this.DB=new function() {

this.createProject=function(_title) {
return new Promise(function (resolve,error) {
REQUEST.send("database/project/createProject.php","title="+encodeURIComponent(_title)).then(
function (_project) {
_importProject(_project);
resolve(_project);
}
).catch(function () {error()});
});
}


this.getProjects=function() {
return REQUEST.send("database/project/getProjectList.php").then(
function (_projectList) {
if (!_projectList) return false;

for (let i=0; i < _projectList.length; i++)
{
_importProject(_projectList[i]);
}
}
).catch(function () {});
}

function _importProject(_project) {
if (!_project || typeof _project != "object") return;
let cachedProject=This.getProject(_project.id);
if (cachedProject)
{
cachedProject.title=String(_project.title);
return true;
}


let project=new _Server_project(
_project.id,
_project.title
);

This.projectList.push(project);
}
}


}










const OptionMenu= new _OptionMenu();
var App=new _app();
var SideBar=new _SideBar();
var MainContent=new _MainContent();



function _app() {

this.update=function() {
Server.sync().then(
function() {
MainContent.taskPage.tab.reopenCurTab();
SideBar.projectList.fillProjectHolder();
},function() {}
);
}





this.delimitMemberText=function(_members,_delimiter=20) {
if (!_members || !_members.length) return "";
let defaultMemberText=_members[0].name;
for (let i=1; i < _members.length; i++) defaultMemberText+= ","+_members[i].name;

let memberText="";
for (let m=0; m < _members.length; m++)
{
if (memberText) memberText+= ",";
memberText+= _members[m].name;

if (memberText.length <= _delimiter || m== _members.length - 1) continue; 

let hiddenMemberCount=_members.length - m - 1;
memberText+= " and "+hiddenMemberCount+" other";
if (hiddenMemberCount > 1) memberText+= "s";

break;
}

if (defaultMemberText.length <= memberText) return defaultMemberText;
return memberText;
}
this.setup=function() {
this.update();
document.body.addEventListener("keydown",function(_e) {
KEYS[_e["key"]]=true;
let preventDefault=KeyHandler.handleKeys(KEYS,_e);
if (preventDefault) _e.preventDefault();
});
document.body.addEventListener("keyup",function(_e) {
KEYS[_e["key"]]=false;
});
document.body.addEventListener("click",function(_e) {
let close=true;
if (isDescendant($("#mainContentHolder .optionMenuHolder")[0],_e.target))close=false;
if (isDescendant($(".functionItem.optionIcon"),_e.target)) close=false;
if (isDescendant($("#mainContentHolder .optionMenuHolder.searchOption")[0],_e.target)) close=false;
if (isDescendant($(".todoItem.createTaskHolder .rightHand"),_e.target))close=false;
if (!close) return false;
MainContent.optionMenu.close();
MainContent.searchOptionMenu.hide();
});
SideBar.projectList.open();}}
App.setup();