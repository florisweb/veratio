

function _MainContent_todoHolder() {
	let HTML = {
		todoHolder: $("#mainContentHolder .todoListHolder")[0],
	}

		
	this.dayItem 		= new _MainContent_dayItem();
	this.renderSettings = new _MainContent_renderSettings();
	this.renderer 		= new _TodoRenderer(HTML.todoHolder);




	this.loadMoreDays = function(_extraDays = 1) {
		loadExtraDay().then(
			function () {
				if (_extraDays <= 1) return;
				MainContent.menu["Main"].todoHolder.loadMoreDays(_extraDays - 1)
			}
		);
	}

	function loadExtraDay() {
		return new Promise(function (resolve, error) {
			let date = _getNewDate();			
			let project = Server.getProject(MainContent.menu.Main.page.curProjectId);
			let mainPromise;

			
			if (project) 
			{
				mainPromise = project.todos.DTTemplate.DB.getByDate(date);
			} else mainPromise = _getAllTodosByDate(date);

			mainPromise.then(
				function () {
					_renderExtraDay(date);
					resolve();
				}, 
				function() {error()}
			);

		});





		function _getAllTodosByDate(_date) {
			return new Promise(function (resolve, error) {
				let promises = [];
				for (let i = 0; i < Server.projectList.length; i++) 
				{
					let project = Server.projectList[i];
					promises.push(project.todos.DTTemplate.DB.getByDate(_date));
				}


				Promise.all(promises).then(function() {
					resolve();
				}, function() {
					error();
				});
			});
		}


		function _getNewDate() {
			let dayItems = $("#mainContentHolder .dayItem");
			let date = dayItems[dayItems.length - 1].getAttribute("date");
			return new Date().setDateFromStr(date).moveDay(1);
		}

		function _renderExtraDay(_date) {
			let project = Server.getProject(MainContent.menu.Main.page.curProjectId);
			let todoList = [];
			
			if (project)
			{
				todoList = project.todos.getTodosByDate(_date);
			} else todoList = Server.todos.getByDate(_date);


			todoList = MainContent.menu.Main.todoHolder.renderSettings.applyFilter(todoList);
			let dayItem = MainContent.menu.Main.todoHolder.dayItem.add({date: _date}, {displayProjectTitle: !project});
			dayItem.todo.renderTodoList(todoList);
		}
	}
}	






















