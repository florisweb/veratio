console.warn("mainContent/renderSettings.js: loaded");


function _MainContent_renderSettings() {
	let HTML = {
		mainContentHolder: mainContentHolder,
	}

	this.settings = {
		renderFinishedTodos: true,
		sortMethod: "Tag"
	};

	this.update = function(_newSettings) {
		switch (_newSettings.renderFinishedTodos) {
			case true: 	HTML.mainContentHolder.classList.add("renderFinishedTodos"); break;
			default: 	HTML.mainContentHolder.classList.remove("renderFinishedTodos"); break
		}

		this.settings = _newSettings;
	}	


	this.applyFilter = function(_todoList, _customRenderSettings) {
		let newTodoList = [];
		
		let startRenderSettings = Object.assign({}, this.settings);
		if (_customRenderSettings) this.settings = _customRenderSettings;

		for (let i = 0; i < _todoList.length; i++)
		{
			let curTodo = _todoList[i];
			if (curTodo.finished && !this.settings.renderFinishedTodos) continue;

			newTodoList.push(curTodo);
		}

		newTodoList = _sort(newTodoList, "Alpha"); // Always order by alphabeth first
		newTodoList = _sort(newTodoList, this.settings.sortMethod);
		newTodoList = _sort(newTodoList, "Finished");

		if (_customRenderSettings) this.settings = startRenderSettings;
		return newTodoList;
	}



	function _sort(_list, _type = "Alpha") {
		switch (_type)
		{
			case "Finished": 	return _sortByFinished(_list); 	break;
			case "Project": 	return _sortByProject(_list); 	break;
			case "Tag": 		return _sortByTag(_list); 		break;
			default: 			return _sortByAlphabet(_list); 	break;
		}
	}
		function _sortByAlphabet(_list) {
			_list.sort(function(a, b){
		     	if (a.title < b.title) return -1;
		    	if (a.title > b.title) return 1;
		    	return 0;
		    });
		    return _list;
		}
		function _sortByFinished(_list) {
			_list.sort(function(a, b){
		     	if (a.finished < b.finished) return -1;
		    	if (a.finished > b.finished) return 1;
		     	return 0;
		    });
		    return _list;
		}
		function _sortByProject(_list) {
			_list.sort(function(a, b) {
				let projectTitleA = Server.getProject(a.projectId).title;
				let projectTitleB = Server.getProject(b.projectId).title;
				if (projectTitleA < projectTitleB) return -1;
				if (projectTitleA > projectTitleB) return 1;
				return 0;
		    });
		    return _list;
		}
		function _sortByTag(_list) {
			_list.sort(function(a, b) {
				let projectA = Server.getProject(a.projectId);
				let projectB = Server.getProject(b.projectId);
				let tagTitleA = projectA.tags.get(a.tagId, false) ? projectA.tags.get(a.tagId, false).title : "ZZZZZ";
				let tagTitleB = projectB.tags.get(b.tagId, false) ? projectB.tags.get(b.tagId, false).title : "ZZZZZ";
				if (tagTitleA < tagTitleB) return -1;
				if (tagTitleA > tagTitleB) return 1;
				return 0;
		    });
		    return _list;
		}


	this.update(this.settings);
}


