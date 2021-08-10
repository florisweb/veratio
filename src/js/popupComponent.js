

function PopupComponent({title, content, onOpen, onClose}) {
	let titleComponent;
	this.HTML 		= createHTML();
	this.content 	= content;
	this.openState 	= false;
	

	function createHTML() {
		let HTML = {}
		HTML.popupHolder = document.createElement("div");
		HTML.popupHolder.className = 'popupHolder hide';

		HTML.popup = document.createElement("div");
		HTML.popup.className = "popup";

		titleComponent = new Title({title: title});
		let newContent = [titleComponent].concat(content);
		for (let item of newContent) 
		{
			let html = item.createHTML();
			if (!html) continue;

			HTML.popup.append(html);
		}


		HTML.popupHolder.append(HTML.popup);
		document.body.append(HTML.popupHolder);
		return HTML;
	}

	let openResolver;
	this.open = function() {
		this.openState = true;
		this.HTML.popupHolder.classList.remove("hide");
		let openPromise = new Promise(function (resolve) {openResolver = resolve});

		try {
			onOpen(openResolver, ...arguments);
		} catch (e) {};

		return openPromise;
	};

	this.close = function() {
		this.openState = false;
		this.HTML.popupHolder.classList.add("hide");
		try {
			onClose(openResolver, ...arguments);
		} catch (e) {};

		if (openResolver) openResolver(false);
	}
	
	this.remove = function() {
		this.HTML.popupHolder.parentNode.removeChild(this.HTML.popupHolder);
	}
	this.setTitle = function(_newTitle) {
		titleComponent.setTitle(_newTitle);
	}
}



function Title({title}) {
	let HTML;
	this.createHTML = function() {
		HTML 				= document.createElement("div");
		HTML.className 		= "title text";
		this.setTitle(title);
		return HTML;
	};
	this.setTitle = function(_newTitle) {
		setTextToElement(HTML, _newTitle);
	}
}


function Text({text, isHeader = false, isHighlighted = false}) {
	let HTML;
	this.createHTML = function() {
		HTML 				= document.createElement("a");
		HTML.className 		= "text";
		if (isHeader) 		HTML.classList.add("header");
		if (isHighlighted) 	HTML.classList.add("highlighted");
		
		// if (text.substr(0, 1) == " ")					HTML.style.marginLeft = "2px";
		// if (text.substr(text.length - 1, 1) == " ") 	HTML.style.marginRight = "2px";

		this.setText(text);
		return HTML;
	}

	this.setText = function(_text) {
		setTextToElement(HTML, _text);
	}
}

function Button({title = '', onclick, filled = false, color, floatLeft = false}) {
	let HTML;
	this.createHTML = function() {
		HTML = document.createElement("div");
		HTML.className = "button text bBoxy";
		if (filled)		HTML.classList.add("bDefault");
		if (color)		HTML.style.background = color;
		if (floatLeft)	HTML.classList.add("floatLeft");

		HTML.addEventListener("click", onclick);
		this.setTitle(title);

		return HTML;
	};
	this.setTitle = function(_newTitle) {
		setTextToElement(HTML, _newTitle);
	}
	
	this.enable = function() {
		HTML.classList.remove("disabled");
	};
	this.disable = function() {
		HTML.classList.add("disabled");
	};
}


function InputField({placeHolder, maxLength = 32, readonly = false}) {
	this.HTML;
	this.createHTML = function() {
		this.HTML = document.createElement('input');
		this.HTML.className = 'text inputField';
		if (placeHolder) 	this.HTML.setAttribute('placeHolder', String(placeHolder));
		if (readonly) 		this.HTML.setAttribute('readonly', true);
		if (maxLength) 		this.HTML.setAttribute('maxLength', maxLength)

		return this.HTML;
	}
	
	this.setPlaceHolder = function(_text) {
		this.HTML.setAttribute('placeholder', _text);
	}
	this.focus = function () {this.HTML.focus()};
	this.setValue = function(_newValue) {this.HTML.value = _newValue};
	this.getValue = function() {return this.HTML.value};
}



function OptionSelector({onValueChange} = {}) {
	let This 				= this;
	let Menu 				= OptionMenu.create(1001);

	this.getOpenState 		= function() {return Menu.openState};
	this.removeAllOptions 	= Menu.removeAllOptions;
	this.value 				= false;
	this.HTML 				= {};
	this.options 			= [];


	this.createHTML = function() {
		this.HTML.button = document.createElement("div");
		this.HTML.button.className = "UI selectBox";
		this.HTML.button.innerHTML = "<a class='button floatLeft bBoxy bDefault text clickable'>" +
								"<img src='images/icons/dropDownIcon.png' class='dropDownIcon'>" + 
								"<span></span>" + 
							"</a>";
		this.HTML.buttonText = this.HTML.button.children[0].children[1];

		this.HTML.button.addEventListener("click", function () {This.openPopup();});
	
		return this.HTML.button;
	}

	this.openPopup = function() {
		Menu.open(this.HTML.button.children[0], {left: 0, top: 0});
	}

	this.closePopup = function() {
		Menu.close();
	}

	this.addOption = function ({title, value, icon}) {
		let option = Menu.addOption(title, function() {
			This.value = value;
			setTextToElement(This.HTML.buttonText, title);
			Menu.close();
			try {
				onValueChange(This.value);
			} catch (e) {};
		}, icon);
		option.value = value;

		this.options = Menu.options;
		if (this.options.length == 1) option.select();

		return option;
	}
}



function VerticalSpace({height = 30}) {
	this.HTML;
	this.createHTML = function() {
		this.HTML = document.createElement('div');
		this.HTML.className = 'verticalSpace';
		if (height) this.HTML.style.height = parseInt(height) + "px";

		return this.HTML;
	}
}

function LineBreak() {
	VerticalSpace.call(this, {height: 0})
}






function ItemList() {
	let This = this;
	this.HTML;
	this.items = [];

	this.removeAllItems = function() {
		this.HTML.innerHTML = "";
		this.items = [];
	}

	this.createHTML = function() {
		this.HTML = document.createElement("div");
		this.HTML.className = "itemListHolder";

		return this.HTML;
	}

	this.addItem = function() {
		let item = new Item(...arguments);
		this.items.push(item);
		return item;
	}





	function Item({title, icon, value, onclick = false}) {
		let Self = this;
		this.HTML = createHTML();
		this.title = title;
		this.value = value;

		function createHTML() {
			let HTML = {};
			HTML.item = document.createElement("div");
			HTML.item.className = "UI listItem clickable";

			setImageSource(icon, HTML.item);
			HTML.item.innerHTML += 	"<div class='text'></div>" + 
								"<div class='rightHand clickable'>" + 
								"</div>";
			HTML.titleHolder = HTML.item.children[1];
			setTextToElement(HTML.titleHolder, title);

	
			if (onclick)
			{
				HTML.optionIcon = document.createElement("img");
				HTML.optionIcon.setAttribute("src", "images/icons/optionIcon.png");
				HTML.optionIcon.className = 'item optionIcon clickable';

				HTML.item.children[2].append(HTML.optionIcon);

				DoubleClick.register(HTML.item, function (e) {
					onclick(Self, e, true);
				});

				HTML.item.children[2].onclick = function(e) {
					onclick(Self, e, false);
				}
			}

			This.HTML.append(HTML.item);
			return HTML;
		}
	}
}


















