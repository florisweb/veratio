


class MainContent_plannerPage {
	#dayHeightScrollMargin = 10; // 100 = height element

	HTML = {};
	constructor() {
		MainContent_page.call(this, {
			name: "planner",
			index: 2,
			onOpen: (_a, _b, _c) => this.onOpen(_a, _b, _c)
		});
		this.HTML.dayHolder = $('.mainContentPage.plannerPage .infiniteScrollHolder .dayHolder')[0];
		this.HTML.infiniteScrollHolder = $('.mainContentPage.plannerPage .infiniteScrollHolder')[0];
		this.HTML.infiniteScrollHolder.addEventListener('scroll', () => this.#onScroll());
	}

	onOpen() {
		MainContent.header.showItemsByPage("planner");
		MainContent.header.setTitleIcon('planner');
		MainContent.header.setTitle("Planner");
		MainContent.header.setMemberList([]);

		this.render();
		this.HTML.infiniteScrollHolder.scrollTop = this.#dayHeightScrollMargin * 100;
	}


	#UIDays = [];
	async render() {
		let date = new Date();
		let firstDateOfWeek = date.moveDay(-date.getDay() + 1 - 7 * (this.#dayHeightScrollMargin + 1)); // 0: sunday -> 1: monday

		this.#firstWeekDate = firstDateOfWeek;
		for (let i = 0; i < 10 + this.#dayHeightScrollMargin * 2; i++)
		{
			let curDate = firstDateOfWeek.copy().moveDay(i * 7);
			this.renderWeekAtEnd(curDate);
		}
		this.#onWeekChange();
	}



	#firstWeekDate = new Date(); // the monday of
	#lastWeekDate = new Date(); // the monday of
	async renderWeekAtStart(_firstDay) {
		this.#firstWeekDate = _firstDay;
		let UIDays = [];
		for (let i = 6; i >= 0; i--)
		{
			let curDate = _firstDay.copy().moveDay(i);
			UIDays[i] = new PlannerPage_UIDay({date: curDate, tasks: []});
			this.HTML.dayHolder.insertBefore(UIDays[i].HTML, this.HTML.dayHolder.children[0]);
		}

		let taskList = await Server.accessPoints.weekTab.getTasksByDateRange({date: _firstDay, range: 7}, true);
		let tasksByDate = splitTasksByDate(TaskSorter.defaultSort(taskList));
		for (let day of UIDays) day.setTasks(tasksByDate[day.date.toString()]);
	}

	removeWeekAtStart() {
		for (let i = 0; i < 7; i++) this.HTML.dayHolder.removeChild(this.HTML.dayHolder.children[0]);
		this.#firstWeekDate = this.#firstWeekDate.moveDay(7);
	}

	async renderWeekAtEnd(_firstDay) {
		this.#lastWeekDate = _firstDay;
		let UIDays = [];
		for (let i = 0; i < 7; i++)
		{
			let curDate = _firstDay.copy().moveDay(i);
			UIDays[i] = new PlannerPage_UIDay({date: curDate, tasks: []});
			this.HTML.dayHolder.append(UIDays[i].HTML);
		}

		let taskList = await Server.accessPoints.weekTab.getTasksByDateRange({date: _firstDay, range: 7}, true);
		let tasksByDate = splitTasksByDate(TaskSorter.defaultSort(taskList));
		for (let day of UIDays) day.setTasks(tasksByDate[day.date.toString()]);
	}
	
	removeWeekAtEnd() {
		for (let i = 0; i < 7; i++) 
		{
			this.HTML.dayHolder.removeChild(this.HTML.dayHolder.children[this.HTML.dayHolder.children.length - 7]);
		}
		this.#lastWeekDate = this.#lastWeekDate.moveDay(-7);
	}


	#onScroll() {
		let scrollY = this.HTML.infiniteScrollHolder.scrollTop;
		let scrollFromTop = scrollY - this.#dayHeightScrollMargin * 100;
		let scrollFromBottom = this.HTML.dayHolder.offsetHeight - scrollY - this.HTML.infiniteScrollHolder.offsetHeight - this.#dayHeightScrollMargin * 100;

		if (scrollFromTop < 0)
		{
			this.renderWeekAtStart(this.#firstWeekDate.copy().moveDay(-7));
			this.HTML.infiniteScrollHolder.scrollTop += 100;
			this.removeWeekAtEnd();
			this.#onWeekChange();
		} else if (scrollFromBottom < 0)
		{
			this.renderWeekAtEnd(this.#lastWeekDate.copy().moveDay(7));
			this.removeWeekAtStart();
			this.HTML.infiniteScrollHolder.scrollTop -= 100;
			this.#onWeekChange();
		}

		if (scrollY === 0) wait(0).then(() => {this.HTML.infiniteScrollHolder.scrollTop++; this.#onScroll()});
	}

	#onWeekChange() {
		let curWeek = this.#firstWeekDate.copy().moveDay(7 * 7);
		MainContent.header.setTitle("Planner - " + curWeek.getMonths()[curWeek.getMonth()].name + ' ' + curWeek.getFullYear());
	}

}







class PlannerPage_UIDay {
	#HTML = {}
	date;
	constructor({date, tasks = []}) {
		this.date = date;
		this.#HTML.self = createElement('div', 'UIDayElement');
		if (this.date.getDay() === 0 || this.date.getDay() === 6) this.#HTML.self.classList.add('weekend');
		if (this.date.getDateInDays(true) < new Date().getDateInDays(true)) this.#HTML.self.classList.add('inPast');
		this.#HTML.self.innerHTML = `
			<div class='text dateHolder'></div>
			<div class='text taskHolder'></div>
		`;

		this.#HTML.dateHolder = this.#HTML.self.children[0];
		this.#HTML.taskHolder = this.#HTML.self.children[1];
		

		if (this.date.getDate() === 1)
		{
			let monthLabel = createElement('div', 'text monthLabel');
			setTextToElement(monthLabel, this.date.getMonths()[this.date.getMonth()].name);
			this.#HTML.self.append(monthLabel);
		}

		setTextToElement(this.#HTML.dateHolder, this.date.getDate());
	}

	get HTML() {
		return this.#HTML.self;
	}


	setTasks(_tasks = []) {
		this.#HTML.taskHolder.innerHTML = '';
		for (let i = 0; i < Math.min(_tasks.length, 4); i++)
		{
			let curTask = _tasks[i];
			let taskHolder = createElement('div', 'taskPreview text');
			setTextToElement(taskHolder, curTask.title);
			if (curTask.tagId && curTask.project) 
			{
				let tag = curTask.project.tags.get(curTask.tagId);
				if (tag) taskHolder.style.color = tag.colour.toHex();
			}
			this.#HTML.taskHolder.append(taskHolder);
		}
	}
}




