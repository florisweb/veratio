



function MainContent_taskPage() {
	let This = this;
	MainContent_page.call(this, {
		name: "task",
		index: 0,
		onOpen: function() {This.reopenCurTab()}
	});

	const HTML = {
		todoHolder: $("#mainContentHolder .todoListHolder")[0],
	}
	this.rendering		= false;

	this.renderer 		= new _TaskRenderer(HTML.todoHolder);
	

	this.curTab;
	this.todayTab 	= new taskPage_tab_today();
	this.weekTab	= new taskPage_tab_week();
	this.projectTab = new taskPage_tab_project();


	
	this.reopenCurTab = function() {
		if (!this.curTab) return this.todayTab.open();
		this.curTab.open(MainContent.curProject);
	}
}









function taskPage_tab(_settings) {
	const This = this;
	this.name = _settings.name;
	let onOpen = _settings.onOpen;
	let onSilentRender = _settings.onSilentRender;

	const HTML = {
		loadMoreButton: $("#mainContentHolder .loadMoreButton")[0],
	}
	

	this.open = async function(_project = false) {
		if (MainContent.taskPage.rendering) return;
		MainContent.taskPage.rendering = true;
		setTimeout(function() {MainContent.taskPage.rendering = false}, 5000);

		MainContent.startLoadingAnimation();
		HTML.loadMoreButton.classList.add("hide");
		

		MainContent.taskPage.curTab	= this;
		MainContent.curProject = _project;

		if (!MainContent.taskPage.isOpen()) MainContent.taskPage.open();
		resetPage();
		await this.addOverdue(true);

		MainContent.header.setTitleIcon(MainContent.taskPage.curTab.name);
		await onOpen(_project);

		MainContent.stopLoadingAnimation();
		await SideBar.updateTabIndicator();

		applySettings(_settings);
		MainContent.taskPage.rendering = false;

		this.silentRender(false);
	}

	let silentRenderPromise;
	this.silentRender = async function(_fromCache = true) {
		while (silentRenderPromise) await silentRenderPromise;

		MainContent.header.setTitleIcon('loading');		
		silentRenderPromise = new Promise(async function(resolve) {
			setTimeout(() => {resolve();}, 10 * 1000); // If there is an error this will prevent the application for stalling forever.

			let overdueTaskList = await getOverdueTasks(_fromCache);
			
			let firstTaskHolder = MainContent.taskHolder.list[0];
			if (firstTaskHolder && firstTaskHolder.type == 'overdue')
			{
				if (overdueTaskList.length) 
				{
					await firstTaskHolder.task.setTaskList(overdueTaskList);
				} 
				else firstTaskHolder.remove();
			} else if (overdueTaskList.length) await This.addOverdue(_fromCache);

			await onSilentRender(_fromCache);
			resolve();
		});
		
		await silentRenderPromise;
		
		silentRenderPromise = false;
		MainContent.header.setTitleIcon('finishedLoading');
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


	this.addOverdue = async function(_fromCache = true) {
		let taskList = await getOverdueTasks(_fromCache);
		if (!taskList) return false;

		let taskHolder = MainContent.taskHolder.add(
			"overdue", 
			{
				displayProjectTitle: !MainContent.curProjectId
			},
			null,
			0,
		);

		await taskHolder.task.addTaskList(taskList);
	}

	async function getOverdueTasks(_fromCache = true) {
		// False defaults to Server.global
		let tasks = await Server.accessPoints.generalTab.getOverdueTasks(MainContent.curProject ? MainContent.curProject.id : false, _fromCache);
		if (isError(tasks)) return false;
		tasks = TaskSorter.defaultSort(tasks);
		return tasks;
	}
}



function taskPage_tab_today() {
	taskPage_tab.call(this, {
		name: "today",
		onOpen: onOpen,
		onSilentRender: onSilentRender
	});
	let This = this;


	async function onOpen() {
		let date = new Date();

		MainContent.header.showItemsByPage("taskpage - " + This.name);
		MainContent.header.setTitle("Today - " + date.getDate() + " " + date.getMonths()[date.getMonth()].name);
		MainContent.header.setMemberList([]);

		let taskHolder = MainContent.taskHolder.add(
			"date",
			{
				displayProjectTitle: true, 
				displayDate: false
			}, 
			[date]
		);

		let taskList = await getTodayTaskList(true); 
		await taskHolder.task.addTaskList(taskList, true);
	};

	async function onSilentRender(_fromCache = true) {
		for (let taskHolder of MainContent.taskHolder.list)
		{
			switch (taskHolder.type) 
			{
				case "overdue": break; // is being handled by the general tab-class
				case "date": 
					let taskList = await getTodayTaskList(_fromCache); 
					await taskHolder.task.setTaskList(taskList);
				break;
			}
		}
	}

	async function getTodayTaskList(_fromCache = true) {
		let taskList = await Server.accessPoints.todayTab.getTasks();
		if (!taskList || isError(taskList)) return [];

		let finalList = [];
		let promises = [];
		for (let task of taskList)
		{
			promises.push(shouldRenderTask(task, _fromCache).then(function (_result) {
				if (!_result) return;
				finalList.push(task);
			}));
		}
		await Promise.all(promises);
		return TaskSorter.defaultSort(finalList);
	}



	async function shouldRenderTask(_task, _fromCache) {
		if (_task.finished) return false;
		return await This.taskIsMine(_task, _fromCache);
	}


	this.taskIsMine = async function(_task, _fromCache) {
		return 	_task.assignedTo.length <= 0 || 
				_task.assignedTo.includes(_task.project.users.self.id)
	}
}





function taskPage_tab_week() {
	let This = this;
	let HTML = {
		loadMoreButton: $('.titleHolder.userText.smallText')[0],
		page: ('.mainContentPage')[0],
	}
	
	taskPage_tab.call(this, {
		name: "week",
		onOpen: onOpen,
		showLoadMoreButton: true,
		onSilentRender: onSilentRender
	});

	registerInfiniteScroller();

	



	let startDate = new Date();
	let daysLoaded = 7;
	async function onOpen() {
		MainContent.header.showItemsByPage("taskPage - week");
		MainContent.header.setTitle("This week");
		MainContent.header.setMemberList([]);

		startDate = new Date();
		daysLoaded = 0;
		This.loadMoreDays(7, new Date());
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
		taskHolder.task.addTaskList(_taskList);
	}

	async function onSilentRender(_fromCache) {
		let splitTasks = await getTaskListByDateRange({date: startDate, range: daysLoaded}, _fromCache);
		for (let taskHolder of MainContent.taskHolder.list)
		{
			if (taskHolder.type !== 'date') continue;
			let taskList = splitTasks[taskHolder.date.toString()];
			if (!taskList) continue;
			await taskHolder.task.setTaskList(taskList);
		}
	}

	async function getTaskListByDateRange(_info = {date: startDate, range: daysLoaded}, _fromCache) {
		let taskList = await Server.accessPoints.weekTab.getTasksByDateRange(_info, _fromCache);
		if (isError(taskList)) return [];
		return splitTasksByDate(TaskSorter.defaultSort(taskList));
	}


	let loadingMoreDays = false;
	this.loadMoreDays = async function(_days = 1) {
		if (loadingMoreDays) return false;
		loadingMoreDays = true;

		let daysAlreadyLoaded = daysLoaded;
		daysLoaded += _days;
		let splitTasks = getTaskListByDateRange({date: startDate.copy().moveDay(daysAlreadyLoaded), range: daysLoaded}, true);

		let promises = [];
		let taskHolderDataList = [];
		for (let i = daysAlreadyLoaded; i < daysLoaded; i++)
		{
			let curDate = startDate.copy().moveDay(i);
			let taskList = splitTasks[curDate.toString()];
			if (!taskList) taskList = [];
			addTaskHolder(curDate, taskList);
		}

		loadingMoreDays = false;
		This.silentRender(false);
	}

	function getNewDate() {
		let lastTaskHolder = MainContent.taskHolder.list[MainContent.taskHolder.list.length - 1];
		if (lastTaskHolder.type != "date") return false;
		return lastTaskHolder.date.copy().moveDay(1);
	}


	function registerInfiniteScroller() {
		function callback(_e) {
			let entry = _e[0];
			if (!entry.isIntersecting) return;
			This.loadMoreDays(7);
		}

		let options = {
		  root: HTML.page.parentElement,
		  rootMargin: '0px',
		  threshold: 1.0
		}

		let observer = new IntersectionObserver(callback, options);
		observer.observe(HTML.loadMoreButton)
	}
}



function taskPage_tab_project() {
	let This = this;
	taskPage_tab.call(this, {
		name: "project",
		onOpen: onOpen,
		onSilentRender: onSilentRender,
	});

	let project;
	async function onOpen(_project) {
		project = _project;
		if (!project) return;
		
		MainContent.header.showItemsByPage("project");
		MainContent.header.setTitle(project.title);
		MainContent.header.setMemberList(project.users.list.filter((_user) => !_user.self));

		await This.addNotPlannedTaskHolder(false, true);
		await This.addToBePlannedTaskHolder(true, true);
		await This.addPlannedTaskHolder(true, true);
	}


	async function onSilentRender(_fromCache) {
		let toBePlannedTasks = TaskSorter.defaultSort(await Server.accessPoints.projectTab.getToBePlannedTasks(project.id, _fromCache))
		let plannedTasks = TaskSorter.defaultSort(await Server.accessPoints.projectTab.getPlannedTasks(project.id, _fromCache))
		let plannedTaskHolderExists = false;
		let toBePlannedTaskHolderExists = false;

		for (let taskHolder of MainContent.taskHolder.list)
		{
			switch (taskHolder.type) 
			{
				case "overdue": break; // is being handled by the general tab-class
				case "toPlan": 
					toBePlannedTaskHolderExists = true;
					if (!toBePlannedTasks.length) 
					{
						taskHolder.remove();
						break;
					}
					await taskHolder.task.setTaskList(toBePlannedTasks);
				break;
				default: 
					if (taskHolder.config.title == 'Planned')
					{
						plannedTaskHolderExists = true;
						if (!plannedTasks.length)
						{
							taskHolder.remove();
							break;
						}
						await taskHolder.task.setTaskList(plannedTasks);
						break;
					}

					let taskList = TaskSorter.defaultSort(await Server.accessPoints.projectTab.getDefaultTasks(project.id, _fromCache))
					await taskHolder.task.setTaskList(taskList);
				break;
			}
		}

		if (toBePlannedTasks.length && !toBePlannedTaskHolderExists) await This.addToBePlannedTaskHolder(true, _fromCache);
		if (plannedTasks.length && !plannedTaskHolderExists) await This.addPlannedTaskHolder(true, _fromCache);
	}



	this.addNotPlannedTaskHolder = async function(_collapseTaskList = false, _fromCache) {
		let taskHolder = MainContent.taskHolder.add(
			"default",
			{
				displayProjectTitle: false, 
			}, 
			['']
		);

		let tasks = await Server.accessPoints.projectTab.getDefaultTasks(project.id, _fromCache)
		if (isError(tasks)) return;
		tasks = TaskSorter.defaultSort(tasks);
		if (_collapseTaskList && tasks.length != 0) taskHolder.collapseTaskList();
		taskHolder.task.addTaskList(tasks);
	}


	this.addPlannedTaskHolder = async function(_collapseTaskList = false, _fromCache = false) {
		let tasks = await Server.accessPoints.projectTab.getPlannedTasks(project.id, _fromCache)
		if (!tasks.length || isError(tasks)) return;
		tasks = TaskSorter.defaultSort(tasks);
		
		let taskHolder = MainContent.taskHolder.add(
			"default",
			{
				displayProjectTitle: false, 
			}, 
			["Planned"]
		);
		if (_collapseTaskList) taskHolder.collapseTaskList();
		taskHolder.task.addTaskList(tasks);
	}



	this.addToBePlannedTaskHolder = async function(_collapseTaskList = false, _fromCache = false) {
		let tasks = await Server.accessPoints.projectTab.getToBePlannedTasks(project.id, _fromCache)
		if (!tasks.length || isError(tasks)) return;
		tasks = TaskSorter.defaultSort(tasks);
		
		let taskHolder = MainContent.taskHolder.add(
			"toPlan",
			{
				displayProjectTitle: false, 
			}, 
			[]
		);

		if (_collapseTaskList && tasks.length != 0) taskHolder.collapseTaskList();
		taskHolder.task.addTaskList(tasks);
	}
}





