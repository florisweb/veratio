













DayItems:
- type
	- dayItem 		[day]
	- overdue 		[overdue]
	- listItem 		[list]
- OnCreation:
	preferences: {
		title: "customTitle",
		class: "customClass",
		customAttributes: [{key: "click", value: function}]
	}







Tasks:
* title
* groupType
	- 'default' 	- A projects item without date
	- 'date'
* groupValue


- assignedTo
- tagId
- finished
- creatorId
- id