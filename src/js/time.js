
// formats:
// str: "dd-mm-yyyy hh:mm"
// number:
// date: dayNumber (years included)
// time: minuteNumber 


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
	let dateParts = dateTime[0].split("-");
	let date = new Date(parseInt(dateParts[1]) + "/" + parseInt(dateParts[0]) + "/" + parseInt(dateParts[2]));
	// this.setMonth(parseInt(dateParts[1]) - 1);

	if (!dateTime[1]) return date;
	let timeParts = dateTime[1].split(":");
	date.setHours(timeParts[0]);
	date.setMinutes(timeParts[1]);
	
	return date;
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
	for (let i = 1970; i < this.getFullYear(); i++) 
	{
		let newDate = new Date();
		newDate.setYear(i);
		totalDays += 365 + (newDate.isLeapYear() ? 1 : 0);
	}

	return totalDays;
}

Date.prototype.getYearLength = function() {
	let monthList = this.getMonths();
	let totalDays = 0;

	for (let i = 0; i < monthList.length; i++)
	{
		totalDays += monthList[i].length;
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

Date.prototype.getFirstDayDate = function(_dayIndex) {// 0 = Sunday
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
      {name: "Yesterday",   	getDate: function () {return new Date().moveDay(-1)}},
      {name: "Today",       	getDate: function () {return new Date()}},
      {name: "Tomorrow",    	getDate: function () {return new Date().moveDay(1)}},
      {name: "Next week",   	getDate: function () {return new Date().moveDay(7)}},
      {name: "In two weeks",   	getDate: function () {return new Date().moveDay(14)}},
      {name: "In three weeks",  getDate: function () {return new Date().moveDay(21)}},
      {name: "Next month",  	getDate: function () {return new Date().moveMonth(1)}},

      {name: "Sunday",  		getDate: function () {return new Date().getFirstDayDate(0)}},
      {name: "Monday",  		getDate: function () {return new Date().getFirstDayDate(1)}},
      {name: "Tuesday",  		getDate: function () {return new Date().getFirstDayDate(2)}},
      {name: "Wednesday",  		getDate: function () {return new Date().getFirstDayDate(3)}},
      {name: "Thursday",  		getDate: function () {return new Date().getFirstDayDate(4)}},
      {name: "Friday",  		getDate: function () {return new Date().getFirstDayDate(5)}},
      {name: "Saturday",  		getDate: function () {return new Date().getFirstDayDate(6)}}
    ];

    return {
    	dateNames: dateNames,
     	toString: toString,
     	toDate: strToDate,
    }

    function getDateStrFromDateNames(_date) {
    	if (!_date) return "";
    	for (let obj of dateNames)
      	{
        	if (!obj.getDate().compareDate(_date)) continue;
        	return obj.name;
      	}
      	return "";
    }

    function toString(_date, _compact = false, _customDates = true) {
     	let dateName = getDateStrFromDateNames(_date);
     	if (dateName && _customDates) return dateName;

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
		// short date: 15-08-2019
		let date = new Date().setFromStr(_str);
		if (!isNaN(date)) return date;

		// relative date: Today, Tomorrow
		date = relativeStrToDate(_str)
		if (date) return date.getDate();

		// spelled date: 15 august 2019
		date = spelledStrToDate(_str)
		if (date) return date;

		return false;
	}








	function relativeStrToDate(_str) {
		let options = []; 
		for (let dateObj of dateNames)
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

		if (!parts[1])
		{
			if (new Date().getDate() > day) date.moveMonth(1);
			return date;
		}

		let month = getMonthFromStr(parts[1].replace(/[^a-z^A-Z]+/g, ''));
		if (typeof month == "number") date.setMonth(month);

		if (!parts[2]) 
		{
			if (new Date().getDateInDays(true) > date.getDateInDays(true)) date.moveMonth(12);
			return date;
		}
		
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



