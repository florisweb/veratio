
// formats:
// str: "dd-mm-yyyy hh:mm"
// number:
// date: dayNumber (years included)
// time: minuteNumber 


Date.prototype.copy = function() {return new Date().setDateFromStr(this.toString(true));}

Date.prototype.setDateFromStr = function(_str) {
	if (typeof _str != "string" || !_str) return _str;
	let dateTime = _str.split(" ");
	let date = new Date();
	
	let dateParts = dateTime[0].split("-");
	this.setDate(dateParts[0]);
	this.setMonth(parseInt(dateParts[1]) - 1);
	this.setYear(dateParts[2]);

	if (!dateTime[1]) return this;
	let timeParts = dateTime[1].split(":");
	this.setHours(timeParts[0]);
	this.setMinutes(timeParts[1]);
	
	return this;
}

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




