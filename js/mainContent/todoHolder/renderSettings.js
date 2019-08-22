
// renderer.settings.filter(_taskList, {
// 	finished: false,
// 	others: false,
// 	assignedToOthers: false,
// })


// renderer.settings.sort(_taskList, [
// 	"alpha",
// 	"tag",
// 	"finished",
// 	"assignment",
// ])




function _TaskRenderer_settings() {
	let HTML = {
		mainContentHolder: mainContentHolder,
	}
	const sortOptions = [ // already sorted on priority (higher is more important)
		"finished",
		"assignment",
		"ownership",
		"alpha"
	];

	return {
		sort: function(_taskList, _settings = []) {
			let settings = createSortPriorityList(_settings);

			for (let s = settings.length - 1; s >= 0; s--)
			{
				_taskList = sortByType(_taskList, settings[s]);
			}

			return _taskList;
		},


		filter: function(_list, _filter = {}) {  // removes all items that matches ALL criteria
			for (let i = _list.length - 1; i >= 0; i--)
			{
				let item = _list[i];
				let project = Server.getProject(item.projectId);
				let userId = project.users.Self.id;
				
				if (item.finished 						!= _filter.finished 	&& _filter.finished 	!= undefined) continue;
				if (item.assignedTo.includes(userId)	!= _filter.assignedTo 	&& _filter.assignedTo 	!= undefined) continue;
				if ((item.creatorId == userId)			!= _filter.ownTask		&& _filter.ownTask 		!= undefined) continue;
				
				_list.splice(i, 1);
			}
			return _list;
		}
	}





	function createSortPriorityList(_settings) {
		let newSettings = Object.assign([], sortOptions);
		newSettings = newSettings.filter(
			function(el) {
		  		return !_settings.includes(el);
			}
		);

		return _settings.concat(newSettings);
	}




	function sortByType(_list, _type = "alpha") {
		switch (_type)
		{
			case "alpha": 		return _sortByProperty(_list, "title"); 	break;
			case "finished": 	return _sortByProperty(_list, "finished"); 	break;
			case "project": 	return _sortByProject(_list); 				break;
			case "tag": 		return _sortByTag(_list); 					break;
			case "assignment": 	return _sortByAssignment(_list);			break;
			case "ownership": 	return _sortByOwnership(_list);				break;
			default: console.error("renderSettings.js: Sorttype " +  _type + " doesn't exist."); break;
		}
	}
		function _sortByProperty(_list, _property) {
			return _list.sort(function(a, b){
		     	if (a[_property] < b[_property]) return -1;
		    	if (a[_property] > b[_property]) return 1;
		    	return 0;
		    });
		}

		function _sortByProject(_list) {
			return _list.sort(function(a, b) {
				let projectTitleA = Server.getProject(a.projectId).title;
				let projectTitleB = Server.getProject(b.projectId).title;
				if (projectTitleA < projectTitleB) return -1;
				if (projectTitleA > projectTitleB) return 1;
				return 0;
		    });
		}

		function _sortByTag(_list) {
			return _list.sort(function(a, b) {
				let projectA = Server.getProject(a.projectId);
				let projectB = Server.getProject(b.projectId);
				
				let tagTitleA = projectA.tags.get(a.tagId, false) ? projectA.tags.get(a.tagId, false).title : "ZZZZZ";
				let tagTitleB = projectB.tags.get(b.tagId, false) ? projectB.tags.get(b.tagId, false).title : "ZZZZZ";
				
				if (tagTitleA < tagTitleB) return -1;
				if (tagTitleA > tagTitleB) return 1;
				return 0;
		    });
		}

		function _sortByAssignment(_list) {
			return _list.sort(function(a, b) {
				let projectA = Server.getProject(a.projectId);
				let projectB = Server.getProject(b.projectId);

				let assignedA = a.assignedTo.includes(projectA.users.Self.id);
				let assignedB = b.assignedTo.includes(projectB.users.Self.id);

				if (assignedA) return -1;
				if (assignedB) return 1;
				return 0;
		    });
		}


		function _sortByOwnership(_list) {
			return _list.sort(function(a, b) {
				let projectA = Server.getProject(a.projectId);
				let projectB = Server.getProject(b.projectId);

				let ownershipA = a.creatorId == projectA.users.Self.id;
				let ownershipB = b.creatorId == projectB.users.Self.id;

				if (ownershipA) return 1;
				if (ownershipB) return -1;
				return 0;
		    });
		}
}

