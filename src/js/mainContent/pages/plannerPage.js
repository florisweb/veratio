


class MainContent_plannerPage {
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
	}


	#UIDays = [];
	async render() {
		let date = new Date();
		let firstDateOfWeek = date.moveDay(-date.getDay() + 1 - 7); // 0: sunday -> 1: monday

		this.#firstWeekDate = firstDateOfWeek;
		for (let i = 0; i < 20; i++)
		{
			let curDate = firstDateOfWeek.copy().moveDay(i * 7);
			this.renderWeekAtEnd(curDate);
		}
	}



	#firstWeekDate = new Date(); // the monday of
	#lastWeekDate = new Date(); // the monday of
	renderWeekAtStart(_firstDay) {
		this.#firstWeekDate = _firstDay;
		for (let i = 6; i >= 0; i--)
		{
			let curDate = _firstDay.copy().moveDay(i);
			let UIDay = new PlannerPage_UIDay({date: curDate, tasks: []});
			this.HTML.dayHolder.insertBefore(UIDay.HTML, this.HTML.dayHolder.children[0]);
		}
	}

	removeWeekAtStart() {
		for (let i = 0; i < 7; i++) this.HTML.dayHolder.removeChild(this.HTML.dayHolder.children[0]);
	}

	renderWeekAtEnd(_firstDay) {
		this.#lastWeekDate = _firstDay;
		for (let i = 0; i < 7; i++)
		{
			let curDate = _firstDay.copy().moveDay(i);
			let UIDay = new PlannerPage_UIDay({date: curDate, tasks: []});
			this.HTML.dayHolder.append(UIDay.HTML);
		}
	}
	
	removeWeekAtEnd() {
		for (let i = 0; i < 7; i++) 
		{
			this.HTML.dayHolder.removeChild(this.HTML.dayHolder.children[this.HTML.dayHolder.children.length - 7]);
		}
	}


	#onScroll() {
		const dayHeightScrollMargin = 5 * 100; // 100 = height element
		let scrollY = this.HTML.infiniteScrollHolder.scrollTop;
		let scrollFromTop = scrollY - dayHeightScrollMargin;
		let scrollFromBottom = this.HTML.dayHolder.offsetHeight - scrollY - this.HTML.infiniteScrollHolder.offsetHeight - dayHeightScrollMargin;

		if (scrollFromTop < 0)
		{
			this.renderWeekAtStart(this.#firstWeekDate.copy().moveDay(-7));
			this.removeWeekAtEnd();
		} else if (scrollFromBottom < 0)
		{
			this.renderWeekAtEnd(this.#lastWeekDate.copy().moveDay(7));
			this.removeWeekAtStart();
		}

		if (scrollY === 0) wait(0).then(() => {this.HTML.infiniteScrollHolder.scrollTop++; this.#onScroll()});

		console.log('scroll', scrollFromTop, scrollFromBottom);
	}

}







class PlannerPage_UIDay {
	#HTML = {}
	date;
	constructor({date, tasks = []}) {
		this.date = date;
		this.#HTML.self = createElement('div', 'UIDayElement');
		if (this.date.getDay() === 0 || this.date.getDay() === 6) this.#HTML.self.classList.add('weekend');

		this.#HTML.self.innerHTML = `
			<div class='text dateHolder'></div>
		`;

		this.#HTML.dateHolder = this.#HTML.self.children[0];

		setTextToElement(this.#HTML.dateHolder, this.date.toString() + ' (' + tasks.length + ')');
	}

	get HTML() {
		return this.#HTML.self;
	}
}