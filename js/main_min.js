const DOMData = new function () {
let Data = [];
return {
get: function(_element) {
for (e of Data) 
{
if (e.element !== _element) continue;
return e.data;
}
return false;
},
set: function(_element, _data) {
for (let i = 0; i < Data.length; i++) 
{
if (Data[i].element !== _element) continue;
Data[i].data = _data;
return true;
}
let dataHolder = {
element: _element,
data: _data,
}
Data.push(dataHolder);
return true;
},
}
}
Date.prototype.copy = function() {return new Date().setDateFromStr(this.toString(true));}
Date.prototype.stringIsDate = function(_date) {
if (!_date) return false;
return !isNaN(
new Date().setDateFromStr(_date)
);
}
Date.prototype.setDateFromStr = function(_str) {
if (typeof _str != "string" || !_str) return _str;
let dateTime = _str.split(" ");
let date = new Date();
let dateParts = dateTime[0].split("-");
this.setYear(dateParts[2]);
this.setMonth(parseInt(dateParts[1]) - 1);
this.setDate(dateParts[0]);
if (!dateTime[1]) return this;
let timeParts = dateTime[1].split(":");
this.setHours(timeParts[0]);
this.setMinutes(timeParts[1]);
return this;
}
Date.prototype.setFromStr = Date.prototype.setDateFromStr;
Date.prototype.toString = function(_addTime = false) {
let dateStr = this.getDate() + "-" + (this.getMonth() + 1) + "-" + this.getFullYear();
if (!_addTime) return dateStr;
return dateStr + " " + this.getHours() + ":" + this.getMinutes();
}
Date.prototype.getDayName = function() {
let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
return dayNames[this.getDay()];
}
Date.prototype.getTimeInMinutes = function() {
return this.getMinutes() + this.getHours() * 60;
}
Date.prototype.getDateInDays = function(_addYears) {
let monthList = this.getMonths();
let totalDays = this.getDate();
for (let i = 0; i < this.getMonth(); i++)
{
totalDays += monthList[i].length;
}
if (!_addYears) return totalDays;
for (let i = 0; i < this.getFullYear(); i++) 
{
totalDays += 365;
if (this.isLeapYear(i + 1)) totalDays++;
}
return totalDays;
}
Date.prototype.isLeapYear = function(_year) {
let year = this.getFullYear();
if (_year) year = _year;
let devidableByFour = Math.floor(year / 4) == year / 4;
let devidableByFourhundred = Math.floor(year / 400) == year / 400;
let devidableByHundred = Math.floor(year / 100) == year / 100;
return devidableByFour == true && (devidableByHundred == false || devidableByFourhundred == true);
};
Date.prototype.getMonths = function() {
let months = [
{name: "January", length: 31},
{name: "February", length: 28},
{name: "March", length: 31},
{name: "April", length: 30},
{name: "May", length: 31},
{name: "June", length: 30},
{name: "July", length: 31},
{name: "August", length: 31},
{name: "September", length: 30},
{name: "October", length: 31},
{name: "November", length: 30},
{name: "December", length: 31}
];
if (this.isLeapYear()) months[1].length = 29;
return months;
}
Date.prototype.getWeek = function() {
var onejan = new Date(this.getFullYear(), 0, 1);
return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}
Date.prototype.getFirstDayDate = function(_dayIndex) {
let curDayIndex = this.getDay();
let moveDays = _dayIndex - curDayIndex;
if (moveDays < 0) moveDays += 7;
this.moveDay(moveDays);
return this;
}
Date.prototype.compareDate = function(_date) {
return _date.getDateInDays(true) == this.getDateInDays(true);
}
Date.prototype.dateIsBetween = function(_min, _max) {
if (typeof _min == "string") _min = new Date().setDateFromStr(_min);
if (typeof _max == "string") _max = new Date().setDateFromStr(_max);
let minDays = _min.getDateInDays(true);
let maxDays = _max.getDateInDays(true);
let targetDays = this.getDateInDays(true);
return minDays <= targetDays && targetDays <= maxDays;
}
Date.prototype.moveDay = function(_days = 0) {
this.setDate(this.getDate() + parseInt(_days));
return this;
}
Date.prototype.moveMonth = function(_months = 0) {
this.setMonth(this.getMonth() + parseInt(_months));
return this;
}
Date.prototype.moveMinutes = function(_minutes = 0) {
this.setMinutes(this.getMinutes() + parseInt(_minutes));
return this;
}
const DateNames = function() {
const dateNames = [
{name: "Yesterday",   date: new Date().moveDay(-1)},
{name: "Today",       date: new Date()},
{name: "Tomorrow",    date: new Date().moveDay(1)},
{name: "Next week",   date: new Date().moveDay(7)},
{name: "Sunday",  	date: new Date().getFirstDayDate(0)},
{name: "Monday",  	date: new Date().getFirstDayDate(1)},
{name: "Tuesday",  	date: new Date().getFirstDayDate(2)},
{name: "Wednesday",  	date: new Date().getFirstDayDate(3)},
{name: "Thursday",  	date: new Date().getFirstDayDate(4)},
{name: "Friday",  	date: new Date().getFirstDayDate(5)},
{name: "Saturday",  	date: new Date().getFirstDayDate(6)}
];
return {
dateNames: dateNames,
toString: toString,
toDate: strToDate,
}
function getDateStrFromDateNames(_date) {
if (!_date) return "";
for (obj of dateNames)
{
if (!obj.date.compareDate(_date)) continue;
return obj.name;
}
return "";
}
function toString(_date, _compact) {
let dateName = getDateStrFromDateNames(_date);
if (dateName) return dateName;
dateName = _date.getDayName();
if (!dateName) return false;
if (_compact) dateName = dateName.substr(0, 3);
let monthName = _date.getMonths()[_date.getMonth()].name;
if (_compact)
{
dateName += " " + _date.getDate() + " " + monthName.substr(0, 3);
} else dateName += " - " + _date.getDate() + " " + monthName;
if (_date.getFullYear() != new Date().getFullYear()) dateName += " " + _date.getFullYear();
return dateName;
}
function strToDate(_str) {
let date = new Date().setFromStr(_str);
if (!isNaN(date)) return date;
date = relativeStrToDate(_str)
if (date) return date.date;
date = spelledStrToDate(_str)
if (date) return date;
return false;
}
function relativeStrToDate(_str) {
let options = []; 
for (dateObj of dateNames)
{
dateObj.score = similarity(_str, dateObj.name);
if (dateObj.score < 0.8) continue;
options.push(dateObj);
}
return options.sort(function(a, b){
if (a.score < b.score) return 1;
if (a.score > b.score) return -1;
return 0;
})[0];
}
function spelledStrToDate(_str) {
let parts = _str.split(" ");
if (parts.length < 2) return false;
let date = new Date();
let day = parseInt(parts[0].replace(/[^0-9]+/g, ''));
if (isNaN(day)) return false;
date.setDate(day);
if (!parts[1]) return date;
let month = getMonthFromStr(parts[1].replace(/[^a-z^A-Z]+/g, ''));
if (typeof month == "number") date.setMonth(month);
if (!parts[2]) return date;
let year = getYearFromStr(parts[2].replace(/[^0-9]+/g, ''));
if (year) date.setYear(year);
return date;
}
function getMonthFromStr(_str) {
let curMonth = false;
let curMonthScore = 0;
let months = new Date().getMonths();
for (let m = 0; m < months.length; m++)
{
let monthName = months[m].name;
let fullScore = similarity(monthName, _str);
let shortScore = similarity(monthName.substr(0, 3), _str);
let score = fullScore > shortScore ? fullScore : shortScore;
if (score < curMonthScore) continue;
curMonthScore = score;
curMonth = m;
}
if (curMonthScore <= .5) return false;
return curMonth;
}
function getYearFromStr(_str) {					
if (!_str) 						return false;
let year = parseInt(_str);
if (isNaN(year)) 				return false;
if (String(year).length != 4) 	return false;
return year;
}
}();
const COLOR = {
DANGEROUS: "rgb(220, 50, 4)",
WARNING: "rgb(220, 135, 0)",
POSITIVE: "rgb(0, 190, 60)",
}
const PLACEHOLDERTEXTS = [
'Read some books...',
'Clean your room...',
'Finish your project...',
'Be a social person for once...',
'Call an old friend...',
'Add a task...',
'Make some homework...'
];
function newId() {return parseInt(Math.round(Math.random() * 100000000) + "" + Math.round(Math.random() * 100000000));}
function setTextToElement(element, text) {
element.innerHTML = "";
let a = document.createElement('a');
a.text = text;
element.append(a);
}
function isDescendant(parent, child) {
if (typeof parent.length !== "number") return _isDescendant(parent, child);
for (let i = 0; i < parent.length; i++)
{
if (_isDescendant(parent[i], child)) return true;
}
function _isDescendant(parent, child) {
if (parent == child) return true;
var node = child.parentNode;
while (node != null) {
if (node == parent) {
return true;
}
node = node.parentNode;
}
return false;
}
}
function inArray(arr, item) {
for (let i = 0; i < arr.length; i++)
{
if (arr[i] == item)
{
return true;
}
}
return false;
}
Array.prototype.randomItem = function() {
return this[Math.round((this.length - 1) * Math.random())];
}
Array.prototype.lastItem = function() {
return this[this.length - 1];
}
function isPromise(_promise) {
if (_promise.then) return true;
return false;
}
function mergeColours(_colourA, _colourB, _colourAPerc = 0.5) {
colorBPerc = 1 - _colourAPerc;
if (Object.keys(_colourA).length < 3 && Object.keys(_colourB).length < 3) return {r: 255, g: 255, b: 255};
if (Object.keys(_colourA).length < 3) return _colourB;
if (Object.keys(_colourB).length < 3) return _colourA;
let obj = {
r: _colourA.r * _colourAPerc + _colourB.r * colorBPerc,
g: _colourA.g * _colourAPerc + _colourB.g * colorBPerc,
b: _colourA.b * _colourAPerc + _colourB.b * colorBPerc
}
if (_colourA.a && _colourB.a) obj.a = _colourA.a * _colourAPerc + _colourB.a * colorBPerc;
return obj;
}
function colourToString(_colour) {
if (!_colour || typeof _colour.r !== "number" || typeof _colour.g !== "number" || typeof _colour.b !== "number") return false;
let color = "rgb(" + parseInt(_colour.r) + ", " + parseInt(_colour.g) + ", " + parseInt(_colour.b) + ")";
if (_colour.a) color = "rgba(" + parseInt(_colour.r) + ", " + parseInt(_colour.g) + ", " + parseInt(_colour.b) + ", " + _colour.a + ")";
return color;
}
function stringToColour(_str) {
if (!_str || typeof _str !== "string") return false;
if (_str.substr(0, 1) == "#") return hexToRgb(_str)
let prefix = _str.split("rgba(");
if (prefix.length < 2) prefix = _str.split("rgb(");
let colors = prefix[1].substr(0, prefix[1].length - 1).split(",");
return {
r: parseFloat(colors[0]),
g: parseFloat(colors[1]),
b: parseFloat(colors[2]),
a: colors[3] ? parseFloat(colors[3]) : 1
}
}
function rgbToHex(_colour) {
return "#" + componentToHex(_colour.r) + componentToHex(_colour.g) + componentToHex(_colour.b);
function componentToHex(c) {
var hex = c.toString(16);
return hex.length == 1 ? "0" + hex : hex;
}
}
function hexToRgb(_hex) {
var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(_hex);
return result ? {
r: parseInt(result[1], 16),
g: parseInt(result[2], 16),
b: parseInt(result[3], 16)
} : null;
}
function similarity(s1, s2) {
var longer = s1;
var shorter = s2;
if (s1.length < s2.length) {
longer = s2;
shorter = s1;
}
var longerLength = longer.length;
if (longerLength == 0) {return 1.0;}
return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
function editDistance(s1, s2) {
s1 = s1.toLowerCase();
s2 = s2.toLowerCase();
var costs = new Array();
for (var i = 0; i <= s1.length; i++) {
var lastValue = i;
for (var j = 0; j <= s2.length; j++) {
if (i == 0)
{
costs[j] = j;
} else {
if (j > 0) {
var newValue = costs[j - 1];
if (s1.charAt(i - 1) != s2.charAt(j - 1))
newValue = Math.min(Math.min(newValue, lastValue),
costs[j]) + 1;
costs[j - 1] = lastValue;
lastValue = newValue;
}
}
}
if (i > 0)
costs[s2.length] = lastValue;
}
return costs[s2.length];
}
}
function removeSpacesFromEnds(_str) {
for (let c = 0; c < _str.length; c++)
{
if (_str[0] !== " ") continue;
_str = _str.substr(1, _str.length);
}
for (let c = _str.length; c > 0; c--)
{
if (_str[_str.length - 1] !== " ") continue;
_str = _str.substr(0, _str.length - 1);
}
return _str;
} 
function clearSelection() {
if (window.getSelection) {window.getSelection().removeAllRanges();}
else if (document.selection) {document.selection.empty();}
}
function optionGroup_select(_item) {
let group = _item.parentNode;
for (let i = 0; i < group.children.length; i++)
{
group.children[i].classList.remove("selected");
if (group.children[i] == _item) 
{
group.value = i;
}
}
_item.classList.add("selected");
}
function _OptionMenu() {
this.create = function(_parent) {
let html = document.createElement("div");
html.className = "optionMenuHolder hide";
_parent.append(html);
let Menu = new _OptionMenu_menu(html);
document.body.addEventListener("click", function(_e) {
if (inArray(_e.target.classList, "clickable")) return;
if (isDescendant(html, _e.target)) return;
Menu.close();
});
return Menu;
}
}
function _OptionMenu_menu(_self) {
let HTML = {
Self: _self,
parent: _self.parentNode
}
let This = this;
this.options = [];
this.openState = false;
this.open = function(_item, _relativePosition, _event) {
if (!this.options.length) return;
this.openState = true;
moveToItem(_item, _relativePosition, _event);
HTML.Self.classList.remove("hide");
}
this.close = function() {
this.openState = false;
HTML.Self.classList.add("hide");
}
this.enableAllOptions = function() {
for (option of this.options) option.enable();
}
this.removeAllOptions = function() {
this.options = [];
HTML.Self.innerHTML = "";
}
this.clickFirstOption = function() {
let option = this.options[0];
if (!option) return;
option.html.click();
This.close();
}
function removeOption(_option) {
for (let i = 0; i < This.options.length; i++)
{
if (_option != This.options[i]) continue;
This.options.splice(i, 1);
return true;
}
return false;
}
this.addOption = function(_title = "", _onclick, _icon = "") {
let option = document.createElement("div");
option.className = "optionItem clickable";
option.innerHTML = 	"<img class='optionIcon' src='images/icons/removeIcon.png'>" + 
"<div class='optionText'>Remove task</div>";
option.children[0].setAttribute("src", _icon);
setTextToElement(option.children[1], _title);
HTML.Self.append(option);
option.onclick = function () {
let close;
try {
close = _onclick();
}
catch (e) {return};
if (close) This.close();
}
this.options.push(new function() {
this.title = _title;
this.html = option;
this.remove = function() {
removeOption(this);
this.html.parentNode.removeChild(this.html);
}
this.disable = function() {
this.html.classList.add("disabled");
}
this.enable = function() {
this.html.classList.remove("disabled");
}
this.hide = function() {
this.html.style.display = "none";
}
this.show = function() {
this.html.style.display = "block";
}
});
}
function moveToItem(_item, _relativePosition = {left: 0, top: 0}, _event) {
if (!_item) return false;
let top = _item.getBoundingClientRect().top + HTML.parent.scrollTop + _relativePosition.top;
let left = _event ? _event.clientX - 325 :  $("#mainContentHolder")[0].offsetWidth - 180;
left += _relativePosition.left;
let maxLeft = $("#mainContent")[0].offsetWidth - HTML.Self.offsetWidth - 15;
if (left > maxLeft) left = maxLeft;
HTML.Self.style.left = left + "px";
HTML.Self.style.top	 = top + "px";
}
}
const Popup = new function () {
let HTML = {
notificationHolder: $("#notificationBoxHolder")[0],
notifcationBox: $("#notificationBox")[0]
}
this.newVersionMenu 		= new _Popup_newVersionMenu();
this.createProjectMenu 	 	= new _Popup_createProject();
this.renameProjectMenu	  	= new _Popup_renameProject();
this.permissionMenu 		= new _Popup_permissionMenu();
this.inviteByLinkCopyMenu 	= new _Popup_inviteByLinkCopyMenu();
this.inviteByEmailMenu 		= new _Popup_inviteByEmailMenu();
}
function _popup(_builder) {
let This = this;
const Builder = _builder;
this.HTML = {
Self: buildPopup(Builder)
};
this.HTML.popup = this.HTML.Self.children[0];
this.openState = false;
this.open = function() {
this.openState = true;
this.HTML.Self.classList.remove("hide");		
}
this.close = function() {
this.openState = false;
this.HTML.Self.classList.add("hide");
}
function buildPopup(_builder) {
let popupHolder = document.createElement("div");
popupHolder.className = "popupBoxHolder hide";
popupHolder.innerHTML = "<div class='popup'></div>";
let popup = popupHolder.children[0];
for (let i = 0; i < _builder.length; i++)
{
let element = _buildItem(_builder[i]);
popup.appendChild(element);
}
document.body.append(popupHolder);
popupHolder.onclick = function(_e) {
if (_e.target == this) This.close();
}
return popupHolder;
}
function _buildItem(_item) {
let element = false;
if (typeof _item == "string") 	return _buildString(_item);
if ("title" in _item) 			element = _buildTitle(_item);
if ("text" in _item) 			element = _buildText(_item);
if ("subHeader" in _item) 		element = _buildSubHeader(_item);
if ("checkBox" in _item) 		element = _buildCheckbox(_item);
if ("button" in _item) 			element = _buildButton(_item);
if ("buttons" in _item) 		element = _buildButtons(_item.buttons);
if ("input" in _item) 			element = _buildInput(_item);
if ("options" in _item) 		element = _buildOptionHolder(_item);
if (_item.onclick) 				element.onclick = _item.onclick;
if (_item.customClass) 			element.classList.add(_item.customClass);
return element;
}
function _buildString(_string) {
let parent = document.createElement("div");
parent.innerHTML = _string;
return parent;
}
function _buildTitle(_info) {
let element = document.createElement("a");
element.className = "header text";
setTextToElement(element, _info.title);
return element;
}
function _buildText(_info) {
let element = document.createElement("div");
element.className = "text";
if (_info.highlighted)									element.classList.add("highlighted");
if (_info.text.substr(0, 1) == " ")						element.style.marginLeft = "4px";
if (_info.text.substr(_info.text.length - 1, 1) == " ") element.style.marginRight = "4px";
setTextToElement(element, _info.text);
return element;
}
function _buildCheckbox(_info) {
let element = document.createElement("div");
element.className = "checkBoxHolder";
element.append(_buildText({text: _info.checkBox}))
let html = '<input type="checkbox">';
element.innerHTML = html;
if (_info.id) element.children[0].setAttribute("id", _info.id);
if (_info.checked) element.children[0].classList.add("checked");
return element;
}
function _buildButtons(_buttons) {
let buttonBar = document.createElement("div");
buttonBar.className = "buttonBar";
for (let i = _buttons.length - 1; i >= 0; i--)
{
let curButton = _buildButton(_buttons[i]);
buttonBar.appendChild(curButton);
}
return buttonBar;
}
function _buildButton(_buttonInfo) {
let button = document.createElement("div");
button.className = "boxButton text";
if (_buttonInfo.important) button.classList.add("important");
if (_buttonInfo.color) button.style.background = _buttonInfo.color;
if (_buttonInfo.onclick) button.onclick = _buttonInfo.onclick;
setTextToElement(button, _buttonInfo.button);
return button;
} 
function _buildInput(_info) {
let input = document.createElement("input");
input.className = "inputField";
if (_info.id) input.setAttribute("id", String(_info.id));
if (_info.input) input.setAttribute("placeHolder", String(_info.input));
if (_info.value) input.value = String(_info.value);
return input;
}
function _buildOptionHolder(_info) {
let select = document.createElement("select");
select.className = "optionHolder";
if (_info.id) select.setAttribute("id", _info.id);
for (let i = 0; i < _info.options.length; i++)
{
let option = _buildOptions(_info.options[i]);
select.appendChild(option);
}
return select;
}
function _buildOptions(_option) {
let option = document.createElement("option");
option.className = "optionItem";
if (_option.option) option.text = _option.option;
if (_option.value) option.value = _option.value;
return option;
}
function _buildSubHeader(_info) {
let element = document.createElement("a");
element.className = "text header subHeader";
setTextToElement(element, _info.subHeader);
return element;
}
}
function _Popup_createProject() {
let This = this;
let builder = [
{title: "CREATE PROJECT"},
"<br><br>",
{input: "Project title", value: null, customClass: "text"},
"<br><br>",
"<br><br>",
"<br>",
{buttons: [
{button: "CANCEL", onclick: function () {This.close()}},
{button: "CREATE", onclick: function () {This.createProject()}, important: true, color: COLOR.POSITIVE}
]}
];
_popup.call(this, builder);
this.HTML.projectTitle = this.HTML.popup.children[2];
this.HTML.projectTitle.maxLength = 256;
let extend_open = this.open;
this.open = function() {
extend_open.apply(this);
this.HTML.projectTitle.value = null;
this.HTML.projectTitle.focus();
}
this.createProject = async function() {
let project = scrapeProjectData();
if (typeof project != "object") return alert(project);
project = await Server.createProject(project.title);
if (!project) return console.error("Something went wrong while creating a project:", project);
await Server.sync();
SideBar.projectList.fillProjectHolder();
MainContent.taskPage.open();
MainContent.curPage.projectTab.open(project.id);
this.close();
} 
function scrapeProjectData() {
let project = {title: This.HTML.projectTitle.value};
if (!project.title || project.title.length < 2) return "E_incorrectTitle";
return project;
}
}
function _Popup_inviteByLinkCopyMenu() {
let This = this;
let builder = [
{title: "SUCCESSFULLY CREATED LINK"},
"<br><br>",
{text: "Copy and send this link to your invitee."},
"<br><br>",
{input: "Invitelink", value: null, customClass: "text"},
"<br><br>",
"<br><br>",
{buttons: [
{button: "CLOSE", onclick: function () {This.close()}, important: true, color: COLOR.WARNING}
]}
];
_popup.call(this, builder);
this.HTML.linkHolder = this.HTML.popup.children[4];
this.HTML.linkHolder.setAttribute("readonly", "true");
let extend_open = this.open;
this.open = function(_link) {
extend_open.apply(this);
this.HTML.linkHolder.value = _link;
this.HTML.linkHolder.setSelectionRange(0, _link.length);
}
}
function _Popup_inviteByEmailMenu() {
let This = this;
let builder = [
{title: "INVITE BY EMAIL"},
"<br><br>",
{text: "Enter your invitees email-adress."},
"<br><br>",
{input: "Email-adress", value: null, customClass: "text"},
"<br><br>",
"<br><br>",
{buttons: [
{button: "CANCEL", onclick: function () {This.close()}},
{button: "INVITE", onclick: function () {This.inviteUser()}, important: true, color: COLOR.POSITIVE}
]}
];
_popup.call(this, builder);
this.HTML.emailAdressHolder = this.HTML.popup.children[4];
let extend_open = this.open;
this.open = function() {
extend_open.apply(this);
this.HTML.emailAdressHolder.value = null;
this.HTML.emailAdressHolder.focus();
}
this.inviteUser = async function() {
let email = this.HTML.emailAdressHolder.value;
let project = Server.getProject(MainContent.curProjectId);
let returnVal = await project.users.inviteByEmail(email);
if (returnVal !== true) console.error("An error accured while inviting a user:", returnVal);
this.HTML.emailAdressHolder.value = null;
This.close();
MainContent.settingsPage.open(MainContent.curProjectId);
}
}
function _Popup_renameProject() {
let This = this;
let builder = [
{title: "RENAME PROJECT"},
"<br><br>",
{text: "Rename "},
{text: "", highlighted: true},
{text: " to:"},
"<br><br><br>",
{input: "Project title", value: null, customClass: "text"},
"<br><br>",
"<br><br>",
"<br>",
{buttons: [
{button: "CANCEL", onclick: function () {This.close()}},
{button: "RENAME", onclick: function () {This.renameProject()}, important: true, color: COLOR.DANGEROUS}
]}
];
_popup.call(this, builder);
this.HTML.projectTitle = this.HTML.popup.children[3];
this.HTML.newTitleHolder = this.HTML.popup.children[6];
this.HTML.newTitleHolder.maxLength = 256;
let extend_open = this.open;
this.curProjectId = false;
this.open = function(_projectId) {
let project = Server.getProject(_projectId);
if (!project) return false;
this.curProjectId = project.id;
extend_open.apply(this);
setTextToElement(this.HTML.projectTitle, project.title);
this.HTML.newTitleHolder.value = project.title;
this.HTML.newTitleHolder.focus();
}	
this.renameProject = function() {
let project = Server.getProject(this.curProjectId);
let newTitle = this.HTML.newTitleHolder.value;
if (!newTitle || newTitle.length < 3) return false;
project.rename(newTitle).then(function () {
This.close();
App.update();
});
}
}
function _Popup_permissionMenu() {
let This = this;
let builder = [
{title: "CHANGE USER PERMISSIONS"},
"<br><br>",
{text: "Change "},
{text: "Member-name", highlighted: true},
{text: " permissions to:"},
"<br><br><br>",
"<div id='PERMISSIONMENU'>" + 
"<a class='text optionGroupLabel'>Create and finish tasks</a>" +
"<div class='optionGroup'>" + 
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Own</div>" + 
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Assigned to</div>" + 
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>All</div>" + 
"</div>" + 
'<br><div class="HR"></div>' + 
"<a class='text optionGroupLabel'>Invite and remove users</a>" + 
"<div class='optionGroup'>" + 
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>None</div>" + 
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Can invite</div>" + 
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Can remove</div>" + 
"</div>" + 
'<br><div class="HR"></div>' + 
"<a class='text optionGroupLabel'>User permissions</a>" +
"<div class='optionGroup'>" + 
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>None</div>" + 
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>can change</div>" + 
"</div>" +
'<br><div class="HR"></div>' + 
"<a class='text optionGroupLabel'>Rename and remove this project</a>" + 
"<div class='optionGroup'>" + 
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>None</div>" + 
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Rename</div>" + 
"<div class='optionItem text clickable' onclick='optionGroup_select(this)'>Remove</div>" + 
"</div>" +
"</div>",
"<br><br><br><br>",
{buttons: [
{button: "CANCEL", onclick: function () {This.close()}},
{
button: "CHANGE", 
onclick: function () {Popup.permissionMenu.updatePermissions()}, 
important: true, 
color: COLOR.DANGEROUS
}
]}
];
_popup.call(this, builder);
this.HTML.memberName = this.HTML.popup.children[3];
let extend_open = this.open;
let curMember = false;
this.open = async function(_memberId) {
extend_open.apply(this);
let project	= Server.getProject(MainContent.curProjectId);
let member 	= await project.users.get(_memberId);
curMember 	= member;
setMemberData(member);
}
function setMemberData(_member) {
setTextToElement(This.HTML.memberName, _member.name + "'s");
let permissions = JSON.parse(_member.permissions);
let optionGroup = $("#PERMISSIONMENU .optionGroup");
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
this.updatePermissions = async function() {
if (!curMember) return;
let optionGroup = $("#PERMISSIONMENU .optionGroup");
let newPermissions = [
"2",
String(optionGroup[0].value) + (optionGroup[0].value > 0 ? optionGroup[0].value : 1),
String(optionGroup[1].value) + String(optionGroup[2].value),
String(optionGroup[3].value)
];
curMember.permissions = JSON.stringify(newPermissions);
let project = Server.getProject(MainContent.curProjectId);
if (!project) return false;
await project.users.update(curMember);
curMember = false;
This.close();
await project.users.getAll();
MainContent.settingsPage.open(MainContent.curProjectId);
}
}
function _Popup_newVersionMenu() {
let This = this;
let builder = [
"<br>",
"<img src='images/icons/updateIcon.png' class='fullIcon'><br>",
"<br><div class='text header' style='text-align: center; width: 100%'>UPDATED TO VERSION 1.1</div>",
"<br><br><br><br><br><br>",
{text: "New Features", highlighted: true},
"<br><div style='height: 5px'></div>",
{text: "- Drag and drop support for tasks (Cross-date)"},
"<br>", {text: "- Option to invite someone using a link"},
"<br>", {text: "- Hover on the little dot next to a task to see the task's owner"},
"<br>", {text: "- Drop-down-menu's for the taskHolders"},		
"<br>", {text: "- Midend / clientside datamanagement redesign"},
"<br>", {text: "- Full-overdue history"},
"<br><br>",
"<br>", {text: "Bug Fixes", highlighted: true},
"<br>", {text: "- You can now mention members that have an '@' in their name"},
"<br>", {text: "- When your session expires you will be prompted to login again"},
"<br>", {text: "- A lot of less noteworthy bugs"}, 
"<br><br>",
{button: "CLOSE", onclick: function () {This.close()}, important: false},
];
_popup.call(this, builder);
this.HTML.popup.style.maxHeight = "250px";
this.HTML.popup.style.overflow = "auto";
this.HTML.popup.children[this.HTML.popup.children.length - 1].style.fontSize = "14px";
let extend_open = this.open;
this.open = function() {
extend_open.apply(this);
}	
}
document.onmousedown = function() { 
DragHandler.mouseDown = true;
}
document.onmouseup = function() {
DragHandler.mouseDown = false;
}
let DragHandler = new _DragHandler();
function _DragHandler() {
let list = [];
let This = this;
this.mouseDown = false;
let CurDragId = false;
document.body.addEventListener("mousemove", 
function (_event) {
if (!CurDragId) return;
This.dragHandler(CurDragId, _event);
}
)
document.body.addEventListener("mouseup", 
function (_event) {
if (!CurDragId) return;
This.stopDraging(CurDragId, _event);
}
);
this.register = function(_item, _moveCallBack, _stopDragingCallback) {
if (!_item) return false;
let id = newId();
_item.addEventListener("mousedown", 
function (_event) {
This.startDraging(id, _event);
}
);
list.push({
html: _item,
moveCallBack: _moveCallBack, 
stopDragingCallback: _stopDragingCallback,
id: id,
draging: false,
dragStarted: false,
x: 0,
y: 0,
rx: 0,
ry: 0,
startDraging: new Date(),
placeHolder: false
});
return id;
}
function get(_id) {
for (let i = 0; i < list.length; i++)
{
if (list[i].id == _id) return list[i];
}
}
this.constructor.prototype.startDraging = function(_id, _event) {
let item = get(_id);
if (!item) return false;
item.draging = true;
CurDragId = _id;
if (!_event) return false;
let pos = item.html.getBoundingClientRect();
item.rx = _event.x - pos.left;
item.ry = _event.y - pos.top;
item.startCoords = {
x: _event.pageX - item.rx,
y: _event.pageY - item.ry,
}
item.startDraging = new Date();
}
this.constructor.prototype.dragHandler = function(_id, _event) {
let item = get(_id);
if (!item || !item.draging) return false;
if (!this.mouseDown) return This.stopDraging(_id, _event);
if (!item.dragStarted) if (new Date() - item.startDraging > 100) 
{
item.dragStarted = true;
item.placeHolder = addPlaceHolderItem(item);
item.placeHolder.classList.add("draging");
item.html.classList.add("hide");
document.body.classList.add("noselect");
} else return false;
item.x = _event.x - item.rx;
item.y = _event.y - item.ry;
item.placeHolder.style.left = item.x + "px";
item.placeHolder.style.top  = item.y + "px";
try {
let dropTarget = dropTargetByEvent(_event);
item.moveCallBack(item, dropTarget);
}
catch (e) {console.error("DragHandler: An error accured while trying to handle the moveCallBack", e)}
}
this.constructor.prototype.stopDraging = function(_id, _event) {
let item = get(_id);
if (!item || !item.draging || !item.dragStarted) return false;
CurDragId = false;
document.body.classList.remove("noselect");
item.html.classList.remove("hide");
item.draging = false;
item.dragStarted = false;
let dropCoords = {};
try {
let dropTarget = dropTargetByEvent(_event);
dropCoords = item.stopDragingCallback(item, dropTarget);
}
catch (e) {console.error("DragHandler: An error accured while trying to handle the dropCallBack", e)}
item.placeHolder.classList.remove("draging");
if (!dropCoords) dropCoords = item.startCoords;
item.placeHolder.style.left = dropCoords.x + "px";
item.placeHolder.style.top  = dropCoords.y + "px";
setTimeout(function () {
removePlaceHolder(item);
}, 500);
}
function dropTargetByEvent(_event) {
let hoveringTarget = _event.target;
if (hoveringTarget.classList.contains("dropTarget")) return hoveringTarget;
return false;
}
function addPlaceHolderItem(item) {
let placeHolderItem = item.html.cloneNode(true);
placeHolderItem.setAttribute("id", "DragHandler_dragObject");
document.body.append(placeHolderItem);
return placeHolderItem;
}
function removePlaceHolder(item) {
if (!item.placeHolder || !item.placeHolder.parentNode) return false;
item.placeHolder.parentNode.removeChild(item.placeHolder);
}
}
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
let DoubleClick = new _DoubleClick();
function _DoubleClick() {
let list = [];
let doubleClickThreshold = 200;
this.register = function(_item, _callBack) {
if (!_item) return false;
let id = newId();
_item.addEventListener(
"click", 
function (_event) {handleClick(id, _event);}
);
list.push({
html: _item,
callBack: _callBack,
id: id,
lastClicked: new Date()
});
}
function get(_id) {
for (let i = 0; i < list.length; i++)
{
if (list[i].id == _id) return list[i];
}
return false;
}
function handleClick(_id, _event) {
let item = get(_id);
if (!item) return false;    
let curDate = new Date();
if (curDate - item.lastClicked < doubleClickThreshold)
{
try {
item.callBack(_event, item.html);
}
catch (e) {console.error("DoubleClick.handleClick: An error accured:", e)}
}
item.lastClicked = curDate;
}
}
let RightClick = new _RightClick();
function _RightClick() {
let list = [];
this.register = function(_item, _callBack) {
if (!_item) return false;
let id = newId();
_item.addEventListener(
"contextmenu", 
function (_event) {handleClick(id, _event);}
);
list.push({
html: _item,
callBack: _callBack,
id: id,
});
}
function get(_id) {
for (let i = 0; i < list.length; i++)
{
if (list[i].id == _id) return list[i];
}
return false;
}
function handleClick(_id, _event) {
let item = get(_id);
if (!item) return false;    
_event.preventDefault();
var isRightMB;
_event = _event || window.event;
if ("which" in _event)
isRightMB = _event.which == 3; 
else if ("button" in _event)
isRightMB = _event.button == 2; 
if (!isRightMB) return;
try {
item.callBack(_event, item.html);
}
catch (e) {console.error("RightClick.handleClick: An error accured:", e);}
clearSelection();
return false;
}
}
function _MainContent_header() {
let HTML = {
mainContent: mainContent,
Self: $("#mainContentHeader .header")[0],
titleHolder: $("#mainContentHeader .header.titleHolder")[0],
memberList: $("#mainContentHeader .functionHolder .memberList")[0],
optionIcon: $("#mainContentHeader .functionItem.icon.clickable")[0],
functionItems: $("#mainContentHeader .functionHolder > .functionItem"),
}
this.optionMenu = new function() {
let Menu = OptionMenu.create(HTML.mainContent);		
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
Popup.renameProjectMenu.open(MainContent.curProjectId);
return true;
}, 
"images/icons/changeIconDark.png"
);
this.open = function() {
let project = Server.getProject(MainContent.curProjectId);
Menu.enableAllOptions();
return Menu.open(HTML.optionIcon, {top: 45});
}
this.openState 	= Menu.openState;
this.close 		= Menu.close;
HTML.optionIcon.onclick = this.open;
}
this.hide = function() {
HTML.Self.classList.add("hide");
}
this.show = function() {
HTML.Self.classList.remove("hide");
}
this.showItemsByPage = function(_pageName) {
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
case "taskpage - week":
break;
default:
HTML.functionItems[0].classList.remove("hide");
HTML.functionItems[2].classList.remove("hide");
HTML.functionItems[3].classList.remove("hide");
break;
}
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
function hideAllFunctionItems() {
for (item of HTML.functionItems)
{
item.classList.add("hide");
}
}
}
function MainContent_page(_config) {
this.name = _config.name;
let onOpen = _config.onOpen;
this.settings = {
index: _config.index
}
const HTML = {
pages: $("#mainContent .mainContentPage"),
mainContent: mainContent
}
this.isOpen = function() {return this.name == MainContent.curPage.name}
this.open = function(_projectId) {
HTML.mainContent.classList.add("loading");
resetPage();
MainContent.curPage			= this;
if (_projectId) MainContent.curProjectId = _projectId;
openPageByIndex(this.settings.index);
MainContent.header.showItemsByPage(this.name);
onOpen(_projectId);
setTimeout('mainContent.classList.remove("loading");', 100);
}
function openPageByIndex(_index) {
for (let i = 0; i < HTML.pages.length; i++) if (i != _index) HTML.pages[i].classList.add("hide");
HTML.pages[parseInt(_index)].classList.remove("hide");
}
function resetPage() {
MainContent.optionMenu.close();
}
}
function MainContent_taskPage() {
let This = this;
MainContent_page.call(this, {
name: "task",
index: 0,
onOpen: function() {if (!This.curTab) This.todayTab.open()}
});
const HTML = {
todoHolder: $("#mainContentHolder .todoListHolder")[0],
}
this.renderer 		= new _TaskRenderer(HTML.todoHolder);
this.curTab;
this.todayTab 	= new taskPage_tab_today();
this.weekTab	= new taskPage_tab_week();
this.projectTab = new taskPage_tab_project();
this.reopenCurTab = function() {
if (!this.curTab) return this.todayTab.open();
this.curTab.open(MainContent.curProjectId);
}
}
function taskPage_tab(_settings) {
this.name = _settings.name;
let onOpen = _settings.onOpen;
const HTML = {
loadMoreButton: $("#mainContentHolder .loadMoreButton")[0],
}
this.open = async function(_projectId) {
MainContent.startLoadingAnimation();
HTML.loadMoreButton.classList.add("hide");
MainContent.taskPage.curTab	= this;
MainContent.curProjectId 	= _projectId;
if (!MainContent.taskPage.isOpen()) MainContent.taskPage.open();
resetPage();
await MainContent.taskHolder.addOverdue();
onOpen(_projectId);
MainContent.stopLoadingAnimation();
applySettings(_settings);
}
function applySettings(_settings) {
if (_settings.showLoadMoreButton) setTimeout(function () {
HTML.loadMoreButton.classList.remove("hide");
}, 100);
} 
function resetPage() {
MainContent.optionMenu.close();
MainContent.taskHolder.clear();
}
}
function taskPage_tab_today() {
taskPage_tab.call(this, {
name: "today",
onOpen: onOpen
});
let This = this;
async function onOpen() {
let date = new Date();
MainContent.header.showItemsByPage("taskpage - " + This.name);
MainContent.header.setTitle("Today - " + date.getDate() + " " + date.getMonths()[date.getMonth()].name);
MainContent.header.setMemberList([]);
let taskHolder 	= MainContent.taskHolder.add(
"date",
{
displayProjectTitle: true, 
displayDate: false
}, 
[date]
);
let taskList 	= await Server.global.tasks.getByDate(date);
if (!taskList || !taskList[date]) return false;
taskList = taskList[date];
let finalList = [];
for (task of taskList)
{
if (!shouldRenderTask(task)) continue;
finalList.push(task);
}
finalList = TaskSorter.defaultSort(finalList);
taskHolder.task.addTaskList(finalList);
}
function shouldRenderTask(_task) {
if (_task.finished) return false;
return This.taskIsMine(_task);
}
this.taskIsMine = function(_task) {
let project = Server.getProject(_task.projectId);
let userId = project.users.Self.id;
if (_task.assignedTo.length == 0 && _task.creatorId != userId) return false;
if (
_task.assignedTo.length > 0 && 
!_task.assignedTo.includes(userId)
) return false;
return true;
}
}
function taskPage_tab_week() {
taskPage_tab.call(this, {
name: "week",
onOpen: onOpen,
showLoadMoreButton: true
});
async function onOpen() {
MainContent.header.showItemsByPage("taskPage - week");
MainContent.header.setTitle("This week");
MainContent.header.setMemberList([]);
let startDate = new Date();
let dateList = await Server.global.tasks.getByDateRange(startDate, 7);
for (let i = 0; i < 7; i++)
{
let date = startDate.copy().moveDay(i);
let taskList = dateList[date.toString()];
let finalList = [];
if (taskList) 
{
for (task of taskList)
{
if (!shouldRenderTask(task)) continue;
finalList.push(task);
}
}
addTaskHolder(date, finalList);
}
}
function shouldRenderTask(_task) {
return MainContent.taskPage.todayTab.taskIsMine(_task);
}
function addTaskHolder(_date, _taskList) {
let taskHolder 	= MainContent.taskHolder.add(
"date",
{
displayProjectTitle: true, 
displayDate: false
}, 
[_date]
);
_taskList = TaskSorter.defaultSort(_taskList);
taskHolder.task.addTaskList(_taskList);
}
let loadingMoreDays = false;
this.loadMoreDays = async function(_days = 1) {
if (loadingMoreDays) return false;
loadingMoreDays = true;
let startDate = getNewDate();
let dateList = await Server.global.tasks.getByDateRange(startDate.copy().moveDay(1), _days);
for (let i = 1; i < _days + 1; i++)
{
let date = startDate.copy().moveDay(i);
let taskList = dateList[date.toString()];
addTaskHolder(date, taskList);
}
loadingMoreDays = false;
}
function getNewDate() {
let lastTaskHolder = MainContent.taskHolder.list.lastItem();
if (lastTaskHolder.type != "date") return false;
return lastTaskHolder.date;
}
}
function taskPage_tab_project() {
taskPage_tab.call(this, {
name: "project",
onOpen: onOpen
});
async function onOpen(_projectId) {
let project = Server.getProject(_projectId);
if (!project) return;
MainContent.header.showItemsByPage("project");
MainContent.header.setTitle(project.title);
MainContent.header.setMemberList(project.users.getLocalList());
let plannedTasks 		= await project.tasks.getByDateRange(new Date(), 1000);
if (Object.keys(plannedTasks).length)
{
let taskHolder_planned = MainContent.taskHolder.add(
"default",
{
displayProjectTitle: false, 
}, 
["Planned"]
);
let dates = Object.keys(plannedTasks);
for (date of dates)
{
plannedTasks[date] = TaskSorter.defaultSort(plannedTasks[date]);
taskHolder_planned.task.addTaskList(
plannedTasks[date]
);
}	
}
let nonPlannedTasks = await project.tasks.getByGroup("default");
let taskHolder_nonPlanned = MainContent.taskHolder.add(
"default",
{
displayProjectTitle: false, 
}, 
["Not Planned"]
);
nonPlannedTasks = TaskSorter.defaultSort(nonPlannedTasks);
taskHolder_nonPlanned.task.addTaskList(nonPlannedTasks);
}
}
function MainContent_settingsPage(_projectId) {
MainContent_page.call(this, {
name: "settings",
index: 1,
onOpen: onOpen
});
let This = this;
let HTML = {
Self: $(".mainContentPage.settingsPage")[0],
memberHolder: $(".mainContentPage.settingsPage .memberHolder")[0],
}
async function onOpen(_projectId) {
if (!_projectId) _projectId = Server.projectList[0].id;
let project = Server.getProject(_projectId);
MainContent.header.setTitle("Settings - " + project.title);
let users = await project.users.getAll();
This.setMemberItemsFromList(users);
}
this.inviteUserByLink = async function() {
let project = Server.getProject(MainContent.curProjectId);
let returnVal = await project.users.inviteByLink();
if (typeof returnVal !== "string") console.error("An error accured while inviting a user:", returnVal);
Popup.inviteByLinkCopyMenu.open("https://florisweb.tk/git/veratio/invite?id=" + returnVal);
This.open(MainContent.curProjectId);
}
this.setMemberItemsFromList = function(_memberList) {
HTML.memberHolder.innerHTML = '<div class="text header">Members (' + _memberList.length + ')</div>';
for (member of _memberList) this.addMemberItem(member);
}
this.addMemberItem = function(_member) {
let html = createMemberItemHtml(_member);
HTML.memberHolder.append(html);
}
function createMemberItemHtml(_member) { 
let html = document.createElement("div");
html.className = "listItem memberItem";
if (_member.Self) html.classList.add("isSelf");
html.innerHTML = '<img class="mainIcon icon" src="images/icons/memberIcon.png">' + 
'<div class="titleHolder userText text">Dirk@dirkloop.com</div>' +
'<div class="rightHand">' + 
'<img src="images/icons/optionIcon.png" class="rightHandItem optionIcon onlyShowOnItemHover icon clickable">' +
'<div class="rightHandItem text"></div>' + 
'</div>';
if (_member.type == "invite") 	html.children[0].setAttribute("src", "images/icons/inviteIconDark.png");
if (_member.type == "link") 	html.children[0].setAttribute("src", "images/icons/linkIconDark.png");
if (_member.isOwner)			html.children[0].setAttribute("src", "images/icons/ownerIconDark.png");
setTextToElement(html.children[1], _member.name);
setTextToElement(html.children[2].children[1], _member.permissions);
DoubleClick.register(html.children[2].children[1], function () {
let project = Server.getProject(MainContent.curProjectId);
Popup.permissionMenu.open(_member.id);
})
html.children[2].children[0].onclick = function () {
MainContent.settingsPage.optionMenu.open(html.children[2].children[0]);
}
DOMData.set(html, _member.id);
return html;
}
this.optionMenu = new function() {
let Menu = OptionMenu.create(HTML.Self);
let curItem = "";
let curMemberId = "";	
Menu.addOption(
"Remove user", 
function () {
let project 	= Server.getProject(MainContent.curProjectId);
if (!project || !curMemberId) return false;
let removed = project.users.remove(curMemberId);
if (removed) curItem.classList.add("hide");
return removed;
}, 
"images/icons/removeIcon.png"
);
Menu.addOption(
"Change permissions", 
function () {
Popup.permissionMenu.open(curMemberId);
return true;
}, 
"images/icons/changeIconDark.png"
);
this.open = async function(_target) {
curItem 		= _target.parentNode.parentNode;
curMemberId 	= DOMData.get(curItem);
Menu.enableAllOptions();
return Menu.open(_target, {left: -100, top: -45});
}
this.openState 	= Menu.openState;
this.close 		= Menu.close;
}
}
function _MainContent_taskHolder() {
let HTML = {
todoHolder: $("#mainContentHolder .todoListHolder")[0],
taskPage: $(".mainContentPage")[0]
}
this.dateOptionMenu = function() {
let Menu = OptionMenu.create(HTML.taskPage, true);
Menu.removeAllOptions = function() {
for (option of Menu.options) this.options[0].remove();
}
let menu_open = Menu.open;
Menu.open = function(_item, _event) {
menu_open.call(Menu, _item, {left: 0, top: -20}, _event);
if (_item.tagName != "INPUT") return;
_item.onkeyup = function(_e) {
menu_open.call(Menu, _item, {left: 0, top: -20});
Menu.openState = true;
Menu.removeAllOptions();
let optionDate = DateNames.toDate(_item.value);
if (!optionDate) return Menu.close();
Menu.addOption(DateNames.toString(optionDate), function () {
_item.value = optionDate.toString();
Menu.close();
}, "");
}
}
return Menu;
}();
this.list = [];
this.add = function(_type = "default", _renderPreferences = {}, _parameters = []) {
let taskHolder = buildDayItem(_type, _renderPreferences, _parameters);
this.list.push(taskHolder);
return taskHolder;
}
this.addOverdue = async function() {
let project = Server.getProject(MainContent.curProjectId);
let taskList = []; 
if (project) 
{
taskList = await project.tasks.getByGroup("overdue", "*");
} else {
let projectList = await Server.global.tasks.getByGroup("overdue", "*");
for (project of projectList) taskList = taskList.concat(project);
}
if (!taskList || !taskList.length) return false;
let item = this.add(
"overdue", 
{
displayProjectTitle: !MainContent.curProjectId
}
);
taskList = TaskSorter.defaultSort(taskList);
item.task.addTaskList(taskList);
}
const constructors = {
default: 	TaskHolder_default,
date: 		TaskHolder_date,
overdue: 	TaskHolder_overdue
}
function buildDayItem(_type, _renderPreferences, _parameters) {
const config = {
html: {
appendTo: HTML.todoHolder
},
renderPreferences: _renderPreferences
}
let parameters = [config].concat(_parameters);
return new constructors[_type](...parameters);
}
this.get = function(_id) {
for (let i = 0; i < this.list.length; i++)
{
if (this.list[i].id != _id) continue;
return this.list[i];
}
return false;
}
this.remove = function(_id) {
for (let i = 0; i < this.list.length; i++)
{
if (this.list[i].id != _id) continue;
this.list.splice(i, 1);
return true;
}
return false;
}
this.clear = function() {
HTML.todoHolder.innerHTML = "";
this.list = [];
}
this.renderTask = function(_task) {
for (taskHolder of this.list) 
{
if (!taskHolder.shouldRenderTask(_task)) continue;
taskHolder.task.addTask(_task);
return true;
}
}
this.createTask = function() {
for (taskHolder of this.list)
{
if (!taskHolder.createMenu) continue;
if (!taskHolder.createMenu.openState) continue;
taskHolder.createMenu.createTask();
return true;
}
return false;
}
this.closeAllCreateMenus = function(_ignorerer) {
let closedCreateMenu = false;
for (taskHolder of this.list)
{
if (!taskHolder.createMenu) continue;
if (!taskHolder.createMenu.openState) continue;
if (taskHolder == _ignorerer) continue;
taskHolder.createMenu.close();
closedCreateMenu = true;
}
return closedCreateMenu;
}
}
function TaskHolder_default(_config, _title) {
_config.title = _title;
TaskHolder.call(this, _config, "default");
TaskHolder_createMenuConstructor.call(this, _config);
this.shouldRenderTask = function(_task) {
if (this.config.title == "Planned" && _task.groupType != "date") return false;
if (_task.groupType != "default" && this.config.title != "Planned") return false;
if (MainContent.curProjectId && MainContent.curProjectId != _task.projectId) return false;
return true;
}
}
function TaskHolder_date(_config, _date) {
this.date = _date;
_config.title = DateNames.toString(_date, false);
TaskHolder.call(this, _config, "date");
TaskHolder_createMenuConstructor.call(this, _config);
this.shouldRenderTask = function(_task) {
if (_task.groupType != "date") return false;
if (MainContent.curProjectId && MainContent.curProjectId != _task.projectId) return false;
let taskDate = new Date().setDateFromStr(_task.groupValue);
if (!this.date.compareDate(taskDate)) return false;
return true;
}
}
function TaskHolder_overdue(_config) {
_config.title 		= "Overdue";
_config.html.class 	= "overdue";
TaskHolder.call(this, _config, "overdue");
this.shouldRenderTask = function(_task) {
if (_task.groupType != "overdue") return false;
if (MainContent.curProjectId && MainContent.curProjectId != _task.projectId) return false;
return true;
}
this.onTaskFinish = function(_taskWrapper) {
this.onTaskRemove(_taskWrapper.task.id)
}
this.onTaskRemove = function(_taskId) {
this.task.removeTask(_taskId);
if (this.task.taskList.length > 0) return;
this.remove();
}
}
function TaskHolder(_config = {}, _type = "default") {
let This = this;
this.id 			= newId();
this.config 		= _config;
this.type 			= _type;
this.HTML = {
Parent: _config.html.appendTo,
}
this.HTML.Self 	= renderTaskHolder(this.HTML.Parent);
this.task 		= new TaskHolder_task(this);
this.remove = function() {
this.HTML.Self.parentNode.removeChild(this.HTML.Self);
MainContent.taskHolder.remove(this.id);
}
this.onTaskFinish = function(_task) {}
this.onTaskRemove = function(_taskId) {
this.task.removeTask(_taskId);
}
this.taskHolderOpenState = true;
function renderTaskHolder(_parent) {
let html = document.createElement("div");
html.className = "taskHolder animateIn";
setTimeout(function () {html.classList.remove("animateIn");}, 50);
html.setAttribute("taskHolderId", This.id);
if (This.config.html.class) html.className += " " + This.config.html.class;
html.innerHTML = 	'<img src="images/icons/dropDownIconDark.png" class="dropDownButton clickable dropTarget">' +
'<div class="header dateHolder dropTarget"></div>' + 
'<div class="todoHolder"></div>';
html.onclick = function(_e) {
if (_e.target.classList.contains("dropDownButton")) return;
This.taskHolderOpenState = true;
html.classList.remove("hideTasks");
}
html.children[0].onclick = function() {
This.taskHolderOpenState = !This.taskHolderOpenState;
let Function = This.taskHolderOpenState ? "remove" : "add";
html.classList[Function]("hideTasks");
}
if (!This.config.title) html.style.marginTop = "0";
setTextToElement(html.children[1], This.config.title);
_parent.append(html);
return html;
}
}
function TaskHolder_task(_parent) {
const Parent = _parent;
let TaskHolder = this;
Parent.HTML.todoHolder = Parent.HTML.Self.children[2];
this.taskList = [];
this.addTaskList = function(_taskList) {
if (!_taskList) return;
for (task of _taskList) this.addTask(task);
}
this.addTask = function(_task) {
this.removeTask(_task.id, false);
let task = new _taskWrapper(_task);
this.taskList.push(task);
task.render();
return task;
}
this.reRenderTaskList = function() {
for (task of this.taskList) task.render();
}
this.removeTask = function(_id, _animate = true) {
for (let i = 0; i < this.taskList.length; i++)
{
if (this.taskList[i].task.id != _id) continue;
this.taskList[i].removeHTML(_animate);
this.taskList.splice(i, 1);
return true;
}
return false;
}
this.dropTask = function(_task, _taskIndex) {
_task = updateTaskToNewTaskHolder(_task);
let task = moveTaskToNewLocalPosition(_task, _taskIndex);
task.render(_taskIndex);
}
function updateTaskToNewTaskHolder(_task) {
_task.groupType = Parent.type;
if (Parent.type == "date") _task.groupValue = Parent.date.toString();
let project = Server.getProject(_task.projectId);
project.tasks.update(_task);
return _task;
}
function get(_id) {
for (task of TaskHolder.taskList) 
{
if (task.id == _id) return task;
}
return false;
}
function moveTaskToNewLocalPosition(_task, _taskIndex) {
if (typeof _taskIndex != "number") _taskIndex = TaskHolder.taskList.length;
for (let i = 0; i < TaskHolder.taskList.length; i++)
{
if (TaskHolder.taskList[i].id != _task.id) continue;
TaskHolder.taskList.splice(i, 1);
}
let newTask = new _taskWrapper(_task);
TaskHolder.taskList.splice(_taskIndex, 0, newTask);
return newTask;
}
function _taskWrapper(_task) {
let This = {
task: _task,
html: false,
taskHolder: Parent,
finish: finish,
openEdit: openEdit,
remove: remove,
removeHTML: removeHTML,
render: render,
}
async function finish() {		
if (This.task.finished)
{
This.html.classList.remove("finished");
This.task.finished = false;
} else {
This.html.classList.add("finished");
this.task.finished = true;
}
let project = Server.getProject(This.task.projectId);
project.tasks.update(This.task, true);
This.taskHolder.onTaskFinish(This);
}
async function remove() {					
let project = Server.getProject(This.task.projectId);
await project.tasks.remove(This.task.id);
This.taskHolder.onTaskRemove(This.task.id);
}
function openEdit() {
if (!This.taskHolder.createMenu) return;
This.taskHolder.createMenu.openEdit(This.html, This.task);
}
function removeHTML(_animate = true) {
let html = This.html;
if (!html) return false;
html.classList.add("hide");
setTimeout(
function () {
if (!html.parentNode) return;
html.parentNode.removeChild(html);
}, 
500 * _animate
);
}
function render(_insertionIndex) {
This.removeHTML(false);
This.html = MainContent.taskPage.renderer.renderTask(
This, 
Parent.config.renderPreferences
);
if (typeof _insertionIndex != "number" || _insertionIndex == TaskHolder.taskList.length) return Parent.HTML.todoHolder.append(This.html);
let insertBeforeElement = Parent.HTML.todoHolder.children[_insertionIndex];
Parent.HTML.todoHolder.insertBefore(This.html, insertBeforeElement);
}
return This;
}
}
function TaskHolder_createMenuConstructor(_config, _type) {
this.HTML.Self.append(createCreateMenuHTML(this));
this.createMenu = new TaskHolder_createMenu(this);
function createCreateMenuHTML(This) {
let html = document.createElement("div");
html.className = "taskItem createTaskHolder close";
html.innerHTML = '<div class="createMenuHolder">' + 
'<input class="text inputField iBoxy clickable taskTitle">' + 
'<input class="text inputField iBoxy clickable taskPlannedDate" placeholder="Planned Date">' + 
'<div class="leftHand">' + 
'<div class="text button bDefault bBoxy" style="float: left"></div>' + 
'<div class="text button" style="float: left">Cancel</div>' + 
'</div>' +
'<div class="rightHand">' + 
'<img src="images/icons/tagIcon.png" class="icon tagIcon clickable">' +
'<img src="images/icons/memberIcon.png" class="icon clickable">' +
'<img src="images/icons/projectIconDark.svg" class="icon projectIcon clickable">' +
'</div>' +
'</div>' + 
'<div class="addButtonHolder smallTextHolder clickable" onclick="MainContent.taskHolder.openCreateMenu(this.parentNode)">' + 
'<a class="smallText smallTextIcon">+</a>' + 
'<div class="smallText">Add Task</div>' + 
'</div>';
This.HTML.createMenuHolder 	= html;
This.HTML.createMenu 		= html.children[0];
addEventListeners(This);
return html;
}
function addEventListeners(This) {
This.HTML.createMenuHolder.children[1].onclick 			= function () {This.createMenu.open();}
This.HTML.createMenu.children[2].children[0].onclick 	= function () {This.createMenu.createTask();}
This.HTML.createMenu.children[2].children[1].onclick 	= function () {This.createMenu.close();}
This.HTML.createMenu.children[3].children[0].onclick 	= function () {This.createMenu.openTagSelectMenu()}
This.HTML.createMenu.children[3].children[1].onclick 	= function () {This.createMenu.openMemberSelectMenu()}
This.HTML.createMenu.children[3].children[2].onclick 	= function () {This.createMenu.openProjectSelectMenu()}
This.HTML.inputField = This.HTML.createMenu.children[0];
This.HTML.inputField.placeholder = PLACEHOLDERTEXTS.randomItem();
This.HTML.plannedDateField = This.HTML.createMenu.children[1];
This.HTML.plannedDateField.onfocusin = function() {
MainContent.taskHolder.dateOptionMenu.open(This.HTML.plannedDateField);
}
This.HTML.plannedDateField.onfocusout = function() {
This.HTML.createMenu.children[0].focus();
}
}
}
function TaskHolder_createMenu(_parent) {
let Parent = _parent;
let This = this;
let editData = {
task: false,
html: false
}
this.openState = false;
this.open = function() {
MainContent.taskHolder.closeAllCreateMenus(Parent);
if (!editData.task) MainContent.searchOptionMenu.curProject = Server.getProject(MainContent.curProjectId);
MainContent.searchOptionMenu.openWithInputField(Parent.HTML.inputField);
this.openState = true;
Parent.HTML.createMenuHolder.classList.remove("close");
Parent.HTML.inputField.focus();
Parent.HTML.inputField.value 		= null;
Parent.HTML.plannedDateField.value 	= null;
let buttonTitle = editData.task ? "Change" : "Add";
Parent.HTML.createMenu.children[2].children[0].innerHTML = buttonTitle;	
if (Parent.date) Parent.HTML.plannedDateField.value = DateNames.toString(Parent.date);
}
this.openEdit = async function(_taskHTML, _task) {
if (!_task || !_taskHTML) return false;
let project = Server.getProject(_task.projectId);
MainContent.searchOptionMenu.curProject = project;
resetEditMode(false);
editData.task = _task;
editData.html = _taskHTML;
editData.html.classList.add("hide");
this.open();
Parent.HTML.inputField.value = _task.title;
if (_task.groupType == "date") Parent.HTML.plannedDateField.value = _task.groupValue;
}
this.close = function() {
this.openState = false;
Parent.HTML.createMenuHolder.classList.add("close");
resetEditMode(false);
}
this.createTask = async function() {
let task 		= scrapeTaskData();
let project 	= Server.getProject(task.projectId);
if (!project) 	return false;
if (typeof task != "object") return task;
let newTask = await project.tasks.update(task);
if (editData.task && task.projectId != editData.task.projectId && newTask) removeOldTask(editData.task);
resetEditMode(true);
MainContent.taskHolder.renderTask(newTask);
this.close();
MainContent.searchOptionMenu.close();
return true;
}
function removeOldTask(_task) {
let prevProject = Server.getProject(_task.projectId);
if (!prevProject) return false;
return prevProject.tasks.remove(_task.id);
}
this.openTagSelectMenu = function() {
openSelectMenu(0, "#");
}
this.openMemberSelectMenu = function() {
openSelectMenu(1, "@");
}	
this.openProjectSelectMenu = function() {
openSelectMenu(2, ".");
}
This.close(false);
function openSelectMenu(_iconIndex = 0, _type = ".") {
if (!This.openState) return false;
let htmlElement = Parent.HTML.createMenu.children[3].children[_iconIndex];
let items = MainContent.searchOptionMenu.getItemListByType(_type);
MainContent.searchOptionMenu.openWithList(htmlElement, items, _type);
}
function resetEditMode(_deleteTaskHTML = false) {
if (editData.html) editData.html.classList.remove("hide");
if (editData.html && _deleteTaskHTML) editData.html.parentNode.removeChild(editData.html);
editData.html = false;
editData.task = false;
}
function scrapeTaskData() {
let createMenuItems = Parent.HTML.createMenu.children;
if (!createMenuItems[0]) return false;
let task = _inputValueToData(createMenuItems[0].value);
let taskDate = filterDate(createMenuItems[1].value);
if (!task.title || task.title.split(" ").join("").length < 1) return "E_InvalidTitle";
task.groupType = "default";
if (Parent.type == "date" && !taskDate) taskDate = Parent.date.copy().toString();
if (taskDate) 
{
task.groupType = "date";
task.groupValue = taskDate;
}
return task;
}
function _inputValueToData(_value) {
let task = {
assignedTo: [],
id: newId()
};
if (editData.task) task = Object.assign({}, editData.task);
let projects = getListByValue(_value, ".");
task.title 	= projects.value;
if (projects.list[0]) 
{
task.projectId = projects.list[0].id;
} else if (!editData.task) 
{
let project 	= Server.getProject(MainContent.curProjectId);
task.projectId 	= project ? project.id : Server.projectList[0].id;
}
let tags = getListByValue(task.title, "#");
task.title 	= tags.value;
if (tags.list[0]) task.tagId = tags.list[0].id;
let members = getListByValue(task.title, "@");
task.title 	= members.value;
for (member of members.list)
{
if (task.assignedTo.includes(member.id)) continue;
task.assignedTo.push(member.id);
}
task.title 	= removeSpacesFromEnds(task.title);
return task;
}
function getListByValue(_value, _type) {
let items = MainContent.searchOptionMenu.getListByValue(_value, _type);
let found = [];
for (item of items)
{
if (item.score < 1) return {list: found, value: _value};
found.push(item.item);
let parts = _value.split(_type + item.str);
_value = parts.join("");
}
return {list: found, value: _value};
}
function filterDate(_strDate) {
let date = DateNames.toDate(_strDate);
if (date && date.getDateInDays()) return date.toString();
return false;
}
}
function _TaskRenderer() {
let This = this;
let HTML = {
scrollHolder: $(".mainContentPage")[0]
}
this.renderTask = function(_taskWrapper, _renderSettings) {
if (!_taskWrapper) return false;
let project = Server.getProject(_taskWrapper.task.projectId);
if (!project) return false;
let tag 	= false;
let todoRenderData = {
project: 		project,
assignedToMe: 	_taskWrapper.task.assignedTo.includes(project.users.Self.id),
taskOwner: 		project.users.getLocal(_taskWrapper.task.creatorId),
memberText: 	_createMemberTextByUserIdList(_taskWrapper.task.assignedTo, project),
}
if (
(_taskWrapper.task.groupType == "date" || _taskWrapper.task.groupType == "overdue") && 
_renderSettings.displayDate !== false &&
new Date().stringIsDate(_taskWrapper.task.groupValue)
) {
let date = new Date().setDateFromStr(_taskWrapper.task.groupValue);
todoRenderData.plannedDateText = DateNames.toString(
date,
true
);
let dateIndex = date.getDateInDays(true);
let todayIndex =  new Date().getDateInDays(true);
if (dateIndex > todayIndex + 1 && dateIndex <= todayIndex + 7) 	todoRenderData.plannedDateClass = "thisWeek";
if (dateIndex == todayIndex + 1) 								todoRenderData.plannedDateClass = "tomorrow";
if (dateIndex == todayIndex) 									todoRenderData.plannedDateClass = "today";
} 
if (_renderSettings.displayProjectTitle !== false) todoRenderData.projectTitle = project.title;
if (tag) todoRenderData.tagColour = tag.colour;
let html = createTaskHTML(todoRenderData, _taskWrapper);
DOMData.set(html, _taskWrapper);
return html;
}
function _createMemberTextByUserIdList(_userIdList, _project) {
if (!_project || !_userIdList || !_userIdList.length) return "";
let users = _project.users.getLocalList();
let memberList = [];
for (id of _userIdList)
{
for (user of users)
{
if (user.id != id) continue;
memberList.push(user);
}
}
return App.delimitMemberText(memberList, 20);
}
function createTaskHTML(_renderData, _taskWrapper) {
let html = document.createElement("div");
html.className = "listItem taskItem dropTarget";
if (_taskWrapper.task.finished) html.classList.add("finished");
if (_renderData.assignedToMe) html.classList.add("isSelf");
const statusCircleSVG = '<?xml version="1.0" standalone="no"?><svg class="statusCircle clickable" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation:isolate" viewBox="0 0 83 83" width="83" height="83"><defs><clipPath id="_clipPath_EvyxEBqQoipdaXxIJMEjCjvXV7edc1qw"><rect width="83" height="83"/></clipPath></defs><g clip-path="url(#_clipPath_EvyxEBqQoipdaXxIJMEjCjvXV7edc1qw)"><rect x="0.729" y="42.389" width="43.308" height="20" transform="matrix(0.707,0.707,-0.707,0.707,43.601,-0.482)"/><rect x="16.22" y="30.02" width="70" height="20" transform="matrix(0.707,-0.707,0.707,0.707,-13.296,47.939)"/></g></svg>';
html.innerHTML = 	"<div class='taskOwnerIndicator'></div>" + 
"<div class='statusCircleHitBox'>" + statusCircleSVG + "</div>" + 
'<div class="titleHolder text userText"></div>' + 
'<div class="functionHolder">' +
'<img src="images/icons/optionIcon.png" onclick="MainContent.optionMenu.open(this)" class="functionItem optionIcon icon clickable">' +
'<div class="functionItem projectHolder"></div>' +
'<div class="functionItem plannedDateHolder userText"></div>' +
'<div class="functionItem memberList userText"></div>' +
'</div>';
setOwnerIndicator(_renderData, html);
if (_renderData.tagColour) setTagColour(_html, _renderData);
setTextToElement(html.children[2], _taskWrapper.task.title);
if (_renderData.memberText) 		setTextToElement(html.children[3].children[3], _renderData.memberText);
if (_renderData.plannedDateText) 	setTextToElement(html.children[3].children[2], _renderData.plannedDateText);
if (_renderData.plannedDateClass) html.children[3].children[2].classList.add(_renderData.plannedDateClass);
if (_renderData.projectTitle) 
{
let projectTitleHolder = html.children[3].children[1];
let projectTitleHtml =  '<img src="images/icons/projectIconDark.svg" class="functionItem projectIcon">' +
'<div class="functionItem projectTitle userText"></div>';
projectTitleHolder.innerHTML = projectTitleHtml;
setTextToElement(projectTitleHolder.children[1], _renderData.projectTitle);
}
return assignEventHandlers(html, _renderData, _taskWrapper);
}
function setTagColour(_html, _renderData) {
let tagColour = stringToColour(_renderData.tagColour);
let colorTarget = _html.children[1].children[0]; 
colorTarget.style.backgroundColor = colourToString(
mergeColours(
tagColour,
{r: 255, g: 255, b: 255, a: 0.1}, 
.15
)
);
colorTarget.style.borderColor = colourToString(
mergeColours(
tagColour,
{r: 220, g: 220, b: 220}, 
.2
)
);
colorTarget.style.fill = colourToString(
mergeColours(
tagColour,
{r: 130, g: 130, b: 130}, 
.2
)
);
}
function setOwnerIndicator(_taskData, _html) {
if (!_taskData.taskOwner || _taskData.taskOwner.id == _taskData.project.users.Self.id) return;
_html.classList.add("isNotMyTask");
let ownerIndicator = _html.children[0];
let onIndicator = false;
ownerIndicator.onmouseleave = function() {
onIndicator = false;
MainContent.userIndicatorMenu.close();
}
ownerIndicator.onmouseenter = function(_event) {
onIndicator = true;	
setTimeout(function () {
if (!onIndicator) return;
MainContent.userIndicatorMenu.open(_taskData.taskOwner, ownerIndicator, _event);
}, 500);
}
}
function assignEventHandlers(_html, _taskData, _taskWrapper) {
_html.children[1].onclick = async function() {
_taskWrapper.finish();
}
DoubleClick.register(_html, async function() {
_taskWrapper.openEdit();
});
RightClick.register(_html, function(_event, _html) {
MainContent.optionMenu.open(_html.children[2].children[0], _event);
});
return assignDragHandler(_html, _taskWrapper);
}
function assignDragHandler(_html, _taskWrapper) {
let lastDropTarget = false;
DragHandler.register(
_html, 
function (_item, _dropTarget) {
if (!_dropTarget) return;
clearLastDropTarget();
if (dropTargetIsHeader(_dropTarget))
{
_dropTarget.parentNode.children[2].style.marginTop = "38px";
} else {
_dropTarget.style.marginBottom = _dropTarget.offsetHeight + "px";
}
lastDropTarget = _dropTarget;
}, 
async function (_item) {						
clearLastDropTarget();
let dropData = getDropData(_item);
if (!dropData) return;
let dropCoords = {
x: dropData.x, 
y: dropData.y
}
_item.placeHolder.style.transition 	= "all .3s";
_item.placeHolder.style.left 		= dropData.x + "px";
_item.placeHolder.style.top 		= dropData.y + "px";
_item.html.classList.add("hide");
_taskWrapper.taskHolder.onTaskRemove(_taskWrapper.task.id);
let task = await Server.global.tasks.get(_taskWrapper.task.id);				
dropData.taskHolder.task.dropTask(task, dropData.index);
return dropCoords;
}
);
return _html;
function clearLastDropTarget() {
if (!lastDropTarget) return;
lastDropTarget.style.marginBottom 	= "";
if (!lastDropTarget.parentNode.children[2]) return;
lastDropTarget.parentNode.children[2].style.marginTop = "";
}
function dropTargetIsHeader(_target) {
return 	_target.classList.contains("dropDownButton") || 
_target.classList.contains("dateHolder");
}
function getDropData(_item) {
if (!lastDropTarget) return false;
let data = {
index: getDropIndex(_item),
}
data.taskHolder  = getTaskHolderByDropTarget(lastDropTarget)
if (!data.taskHolder) return false;
let positionObj = data.taskHolder.HTML.todoHolder;
const taskHeight = 38;
let pos = positionObj.getBoundingClientRect();
data.x = pos.left;
data.y = pos.top + taskHeight * data.index;
if (data.index === 0) data.y -= taskHeight - 10;
return data;
}
function getTaskHolderByDropTarget(_target) {
let taskHolder 								= lastDropTarget.parentNode.parentNode;
if (dropTargetIsHeader(_target)) taskHolder = _target.parentNode;
let taskHolderId = taskHolder.getAttribute("taskHolderId");
return MainContent.taskHolder.get(taskHolderId);
}
function getDropIndex(_item) {
if (dropTargetIsHeader(lastDropTarget)) return 0;
let index = false;	
let siblings = lastDropTarget.parentNode.children;
let dragItemI = Infinity;
for (let i = 0; i < siblings.length; i++)
{
if (siblings[i] == _item.html) dragItemI = i;
if (siblings[i] != lastDropTarget) continue;
index = i + 1 - (dragItemI < i) - getAboveStatus(_item, lastDropTarget);
}
return index;
}
function getAboveStatus(_item, _dropTarget) {
let dropTargetHeight 	= _dropTarget.offsetHeight;
let dropTargetY 		= _dropTarget.getBoundingClientRect().top;
return dropTargetY - _item.y > 0;
}
}
}
function _MainContent() {
let HTML = {
mainContent: $("#mainContent")[0],
mainContentHolder: $("#mainContentHolder")[0],
pages: $("#mainContent .mainContentPage"),
}
this.curProjectId = "";
this.header 			= new _MainContent_header();
this.taskHolder 		= new _MainContent_taskHolder();
this.optionMenu 		= new _MainContent_optionMenu();
this.searchOptionMenu 	= new _MainContent_searchOptionMenu();
this.userIndicatorMenu 	= new _MainContent_userIndicatorMenu();
this.taskPage 		= new MainContent_taskPage();
this.settingsPage 	= new MainContent_settingsPage();
this.curPage 		= this.taskPage;
this.startLoadingAnimation = function() {
HTML.mainContentHolder.classList.add("showLoadingAnimation");
}
this.stopLoadingAnimation = function() {
HTML.mainContentHolder.classList.remove("showLoadingAnimation");
}
this.leaveCurrentProject = async function() {
let project = Server.getProject(this.curProjectId);
if (!project) return false;
await project.leave();
MainContent.taskPage.weekTab.open();
App.update();
}
this.removeCurrentProject = async function() {
let project = Server.getProject(this.curProjectId);
if (!project) return false;
await project.remove();
MainContent.taskPage.weekTab.open();
App.update();
}
}
function _MainContent_userIndicatorMenu() {
const HTML = {
mainContentHolder: mainContentHolder
}
let Menu = OptionMenu.create(HTML.mainContentHolder);
this.close = Menu.close;
this.open = async function(_user, _item, _event) {
Menu.removeAllOptions();
setUser(_user);
return Menu.open(_item, {top: -40, left: -20}, _event);
}
function setUser(_user) {		
Menu.addOption(
_user.name,
function () {}, 
"images/icons/memberIcon.png"
);
}
}
function _MainContent_optionMenu() {
let HTML = {
mainContentHolder: mainContentHolder,
contentHolder: $("#mainContentHolder .mainContentPage")[0],
menu: $("#mainContentHolder .optionMenuHolder")[0]
}
let This = this;
let curDOMData;
let Menu = OptionMenu.create(HTML.mainContentHolder);
this.openState 	= Menu.openState;
this.close 		= Menu.close;
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
curDOMData.openEdit();
return true;
},
"images/icons/changeIconDark.png"
);
this.open = async function(_item, _event) {
curDOMData 	= DOMData.get(_item.parentNode.parentNode);
// let project = Server.getProject(curDOMData.task.projectId);
Menu.enableAllOptions();
return Menu.open(_item, {top: -20, left: 0}, _event);
}
}
function _MainContent_searchOptionMenu() {
let HTML = {
mainContentHolder: mainContentHolder,
scrollYHolder: $("#mainContentHolder .mainContentPage")[0]
}
let This = this;
let Menu = OptionMenu.create(HTML.mainContentHolder);
let inputField;
let keyTimeout = 0;
this.curProject = false;
this.openState = false;
this.openWithInputField = function(_inputField) {
if (!_inputField || _inputField.type != "text") return;
Menu.open(inputField);
this.openState = true;
inputField = _inputField;
keyTimeout = 0;
Menu.removeAllOptions();
inputField.onkeyup = function() {
if (keyTimeout > 0) return keyTimeout--;
addOptionItemsByValue(this.value, this.selectionStart);
moveToItem(this.selectionStart);
}
}
this.openWithList = function(_button, _list, _indicator) {
if (!_button) return;
this.openState = true;
Menu.removeAllOptions();
for (item of _list) 
{
addSearchItem(
{item: item}, 
_indicator
);
}
Menu.open(_button, {
left: _button.offsetWidth + 30,
top: -30
});
}
this.clickFirstOption = function () {Menu.clickFirstOption.apply(Menu);};
this.close = function() {
this.hide();
if (!inputField) return;
inputField.blur();
inputField.onkeyup = null;
inputField = null;
}
this.hide = function() {
this.openState = false;
keyTimeout = 5;
Menu.close();
if (!inputField) return;
inputField.focus();
}
this.getItemListByType = function(_type, _project) {
if (!_project) _project = this.curProject;
if (!_project) _project = Server.projectList[0];
switch (_type)
{
case "#": 	return _project.tags.list; 				break;
case ".": 	return Server.projectList; 				break;
default: 	return _project.users.getLocalList(); 	break;
}
}
function addOptionItemsByValue(_value, _cursorPosition) {
Menu.removeAllOptions();
if (addOptionItemsByValueAndType(_value, _cursorPosition, "#")) return;
if (addOptionItemsByValueAndType(_value, _cursorPosition, "@")) return;
if (addOptionItemsByValueAndType(_value, _cursorPosition, ".")) return;
This.hide();
}	
function addOptionItemsByValueAndType(_value, _cursorPosition, _type) {
let active = 0;
let items = This.getListByValue(_value, _type, _cursorPosition);
for (let i = 0; i < items.length; i++)
{
if (!items[i].active) continue;
addSearchItem(items[i], _type);
active++;
}
return active > 0;
}
function addSearchItem(_item, _type = "@") {
var clickHandler = function() {
if (!inputField) return;
let inValue 	= inputField.value;
let partA 		= inValue.substr(0, _item.startAt);
let partB 		= inValue.substr(_item.startAt + _item.length, inValue.length - _item.startAt - _item.length);
let newStr 		= partA + _type + result.title + partB;
inputField.value = newStr;
if (_type == ".") This.curProject = _item.item;
This.hide();
inputField.focus();
}
let result = createSearchItemIconByType(_type, _item);
Menu.addOption(result.title, clickHandler, result.src);
}
function createSearchItemIconByType(_type, _item) {
switch (_type)
{
case ".": 
return {
title: _item.item.title,
src: "images/icons/projectIconDark.svg"
}
break;
case "#": 
return {
title: _item.item.title,
src: "images/icons/projectIconDark.svg"
}
default:
return {
title: _item.item.name,
src: "images/icons/memberIcon.png"
}
break;
}
}
this.getListByValue = function(_value, _type, _cursorPosition) {
let found = [];
let itemList = this.getItemListByType(_type);
if (!itemList) itemList = [];
for (let i = 0; i < itemList.length; i++)
{
let item = _checkValueByItem(_value, itemList[i], _type);
if (!item) continue;
item.active = false;
if (item.startAt <= parseInt(_cursorPosition) && item.length + item.startAt >= parseInt(_cursorPosition)) item.active = true;
found.push(item);
}
return found.sort(function(a, b){
if (a.score < b.score) return 1;
if (a.score > b.score) return -1;
return 0;
});
}
function _checkValueByItem(_value, _item, _type = "#") {
let valueParts = _value.split(_type);
let scores = [];
let itemTitle = _item.title ? _item.title : _item.name;
for (let valI = 1; valI < valueParts.length; valI++)
{
let cValue = Object.assign([], valueParts).splice(valI, valueParts.length).join(_type);
let startIndex = Object.assign([], valueParts).splice(0, valI).join(_type).length;
for (let i = 0; i < cValue.length; i++)
{
let curSubString = cValue.substr(0, i + 1);
let item = {
startAt: startIndex,
length: i + 2,
str: curSubString,
score: similarity(curSubString, itemTitle),
item: _item
}
scores.push(item);
}
}
if (scores.length < 1) return false;
return scores.sort(function(a, b){
if (a.score < b.score) return 1;
if (a.score > b.score) return -1;
return 0;
})[0];
}
function moveToItem(_characterIndex = 0) {
Menu.open(inputField, {
left: _characterIndex * 6.2 - inputField.offsetWidth + 30,
top: -20
});
This.openState = Menu.openState;
}
}
const TaskSorter = new _TaskSorter();
function _TaskSorter() {
this.defaultSort = function(_tasks) {
_tasks = this.sortAlphabet(_tasks);
_tasks = this.sortAssignedToMe(_tasks);
return this.sortFinished(_tasks);
} 
this.sortAlphabet = function(_tasks = []) {
if (!_tasks) return [];
return _tasks.sort(function(a, b) {
if (a.title > b.title) return 1;
if (a.title < b.title) return -1;
});
}
this.sortFinished = function(_tasks = []) {
if (!_tasks) return [];
return _tasks.sort(function(a, b) {
if (a.finished) return 1;
if (b.finished) return -1;
});
}
this.sortAssignedToMe = function(_tasks = []) {
if (!_tasks) return [];
return _tasks.sort(function(a, b) {
let projectA = Server.getProject(a.projectId);
let projectB = Server.getProject(b.projectId);
if (!projectA || !projectA.users.Self.id) return 1;
if (!projectB || !projectB.users.Self.id) return -1;
if (a.assignedTo.includes(projectA.users.Self.id)) return -1;
if (b.assignedTo.includes(projectB.users.Self.id)) return 1;
});
}
}
function _SideBar() {
this.projectList = new _SideBar_projectList();
}
function _SideBar_projectList() {
let HTML = {
projectList: $("#sideBar .projectListHolder .projectList")[0],
projectsHolder: $("#sideBar .projectListHolder .projectList")[0].children[0],
dropDownIcon: $(".projectListHolder .header .dropDownButton")[0],
}
this.openState = true;
this.toggleOpenState = function() {
if (this.openState) return this.close();
this.open();
}
this.open = function() {
this.openState = true;
HTML.dropDownIcon.classList.remove("close");
HTML.projectList.classList.remove("hide");
}
this.close = function() {
this.openState = false;
HTML.dropDownIcon.classList.add("close");
HTML.projectList.classList.add("hide");
}
this.fillProjectHolder = function() {
HTML.projectsHolder.innerHTML = "";
for (project of Server.projectList) createProjectHTML(project);
}
function createProjectHTML(_project) {
if (!_project) return;
let html = document.createElement("div");
html.className = "header small clickable";
html.innerHTML = '<img src="images/icons/projectIcon.png" class="headerIcon">' +
'<div class="headerText userText"></div>';
setTextToElement(html.children[1], _project.title);
html.onclick = function() {MainContent.taskPage.projectTab.open(_project.id);}
HTML.projectsHolder.append(html);
}
}
const Encoder = new function() {
this.encodeString = function (_string) {
_string = _string.replace(/\+/g, "<plusSign>");
return encodeURIComponent(_string);
}
this.decodeString = function (_string) {
if (!_string) return false;
_string = _string.replace(/\+/g, " ");
try {
_string = decodeURIComponent(_string);
}
catch (e) {}
return _string.replace(/<plusSign>/g, "+");
}
this.objToString = function(_JSON) {
let jsonStr = JSON.stringify(_JSON);      
return this.encodeString(jsonStr);
}
this.decodeObj = function(_jsonObj) {
let newObj = JSON.parse(JSON.stringify(_jsonObj));
if (!newObj) return false;
let result = recursivelyDecodeObj(newObj);
this.list.push(result)
return result;
}
function recursivelyDecodeObj(_obj) {
let keys = Object.keys(_obj);
for (key of keys)
{
if (typeof _obj[key] == "object") _obj[key] = recursivelyDecodeObj(_obj[key]);
if (typeof _obj[key] != "string") continue;
_obj[key] = Encoder.decodeString(_obj[key]);
}
return _obj;
}
this.list = [];
};function _Server_globalProject(_project) {
let This    = this;
this.id     = String(_project.id);
this.tasks  = new function() {
let Type = "task";
this.get = async function(_id) {
let result = await REQUEST.send(
"database/project/" + Type + ".php", 
"method=get&parameters=" + _id +  
"&projectId=" + This.id
);
return Encoder.decodeObj(result);
}
this.getByDate = function(_date) {
return this.getByDateRange(_date, 1);
}
this.getByDateRange = async function(_date, _range = 1) {
let result = await REQUEST.send(
"database/project/" + Type + ".php", 
"method=getByDateRange&parameters=" + 
Encoder.objToString({
date: _date.toString(),
range: _range
}) + 
"&projectId=" + This.id
);
return Encoder.decodeObj(result);
}
this.getByGroup = async function(_groupType, _groupValue = "*") {
let result = await REQUEST.send(
"database/project/" + Type + ".php", 
"method=getByGroup&parameters=" + 
Encoder.objToString({
type: _groupType, 
value: _groupValue
}) + 
"&projectId=" + This.id
);
return Encoder.decodeObj(result);
}
this.remove = function(_id) {
return REQUEST.send(
"database/project/" + Type + ".php", 
"method=remove&parameters=" + _id + 
"&projectId=" + This.id
);
}
this.update = async function(_newTask) {
let result = await REQUEST.send(
"database/project/" + Type + ".php", 
"method=update&parameters=" + 
Encoder.objToString(_newTask) + 
"&projectId=" + This.id
);
return Encoder.decodeObj(result);
}
}
this.users  = new function() {
let Users = this;
let Type = "user";
let list = [];
if (_project.users) 
{
list = _project.users; 
setSelf(list);
};
this.Self;
let lastSync = new Date();
const dateRecensy = 60 * 1000; // miliseconds after which the data is considered out of date
this.get = async function(_id) {
let users = await this.getAll();
for (user of users)
{
if (user.id != _id) continue;
return user;
}
return false;
}
this.getAll = async function() {
let results = await REQUEST.send(
"database/project/" + Type + ".php", 
"method=getAll" + 
"&projectId=" + This.id
);
if (!Array.isArray(results)) return false;
results = Encoder.decodeObj(results);
setSelf(results);
list = results;
lastSync = new Date();
return results;
}
this.getLocalList = function() {
if (new Date() - lastSync > dateRecensy) this.getAll();
return list;
}
this.getLocal = function(_id) {
let users = this.getLocalList();
for (user of users)
{
if (user.id != _id) continue;
return user;
}
return false;
}
function setSelf(_userList) {
for (user of _userList) 
{
if (!user.Self) continue;
Users.Self = new _Server_project_userComponent_Self(user);
break;
}
}
this.update = async function(_newUser) {
let result = REQUEST.send(
"database/project/" + Type + ".php", 
"method=update&parameters=" + 
Encoder.objToString(_newUser) + 
"&projectId=" + This.id
);
return Encoder.decodeObj(result);
}
this.remove = function(_id) {
return REQUEST.send(
"database/project/" + Type + ".php", 
"method=remove&parameters=" + _id + 
"&projectId=" + This.id
);
}
this.inviteByEmail = function(_email) {
return REQUEST.send(
"database/project/" + Type + ".php", 
"method=inviteByEmail&parameters=" + Encoder.encodeString(_email) +
"&projectId=" + This.id
);
}
this.inviteByLink = function() {
return REQUEST.send(
"database/project/" + Type + ".php", 
"method=inviteByLink" + 
"&projectId=" + This.id
);
}
}
this.tags   = new function() {
}
}
function _Server_project(_project) {
_Server_globalProject.call(this, _project);
let This    = this;
this.title  = String(_project.title);
this.sync = function() {
return Promise.all([
this.users.getAll(),
]);    
}
this.leave = function() {
let users = this.users.getLocalList();
for (user of users)
{
if (!user.Self) continue;
App.update()
return this.users.remove(user.id);
}
}
this.rename = async function(_newTitle) {
if (!_newTitle) return false;
let result = await REQUEST.send(
"database/project/rename.php",
"projectId=" + This.id + "&newTitle=" + Encoder.encodeString(_newTitle)
);
this.title = _newTitle;
return result;
}
this.remove = async function() {
let result = await REQUEST.send(
"database/project/remove.php",
"projectId=" + This.id
);
return result;
}
}
function _Server_project_userComponent_Self(_user) {
this.id           = _user.id;
this.name         = _user.name;
let isOwner       = _user.isOwner;
let Permissions   = JSON.parse(_user.permissions);
this.taskActionAllowed = function(_action, _task) {
switch (String(_action).toLowerCase())
{
case "remove":
if (Permissions[1][1] >= 2)                                         return true;
if (Permissions[1][1] >= 1 && _task.creatorId == this.id)           return true;
break;
case "update": 
if (Permissions[1][1] >= 2)                                         return true;
if (Permissions[1][1] >= 1 && !_task)                               return true;
if (Permissions[1][1] >= 1 && _task.creatorId == this.id)           return true;
break;
case "finish": 
if (Permissions[1][0] >= 2) return true;
if (Permissions[1][0] >= 1 && _task.assignedT.includes(this.id))    return true;
if (Permissions[1][0] >= 0 && _task.creatorId == this.id)           return true;
break; //finish
default: 
console.error("Server.project.users.Self.taskActionAllowed: Action ", _action, " was not found.");
break;
}
return false;
}
this.userActionAllowed = function(_action, _user) {
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
console.error("Server.project.users.Self.userActionAllowed: Action ", _action, " was not found.");
break;
}
return false;
}
this.projectActionAllowed = function(_action) {
switch (String(_action).toLowerCase())
{
case "remove":
if (Permissions[3][0] >= 2) return true;
break;
case "rename": 
if (Permissions[3][0] >= 1) return true;
break;
default: 
console.error("Server.project.users.Self.projectActionAllowed: Action ", _action, " was not found.");
break;
}
return false;
}
}
const Server = new _Server;
function _Server() {
let This = this;
this.projectList = [];
this.getProject = function(_id) {
for (let i = 0; i < this.projectList.length; i++)
{
if (this.projectList[i].id != _id) continue;
return this.projectList[i];
}
return false;
}
this.global = new function() {
_Server_globalProject.call(this, {id: "*"})
delete this.users;
}
this.sync = async function(_) {
console.warn("Server.sync()");
return getProjects();
}
this.createProject = function(_title) {
return new Promise(async function (resolve, error) {
let result = await REQUEST.send("database/project/create.php", "title=" + Encoder.encodeString(_title));
if (!result) alert(result);
_importProject(result);
resolve(result);
});
}
async function getProjects() {
let results = await REQUEST.send("database/project/getProjectList.php");
if (!results) return false;
This.projectList = [];
for (let i = 0; i < results.length; i++)
{
_importProject(results[i]);
}
}
function _importProject(_project) {
if (!_project || typeof _project != "object") return;
_project = Encoder.decodeObj(_project);
let project = new _Server_project(_project);
This.projectList.push(project);
}
}
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
showAvailableMessages();
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
function showAvailableMessages() {
const curMessageIndex = 1;
let messageIndex = parseInt(localStorage.getItem("veratio_messageIndex"));
if (messageIndex >= curMessageIndex) return;
localStorage.setItem("veratio_messageIndex", curMessageIndex);
Popup.newVersionMenu.open();  
}
}
window.onload = async function() {
console.warn("Start loading..."); 
await App.setup();
console.warn("App loaded!");
}