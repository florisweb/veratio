
function _OptionMenu() {
	this.create = function(_parent) {
		let html = document.createElement("div");
		html.className = "optionMenuHolder hide";
		_parent.append(html);

		let Menu = new _OptionMenu_menu(html);


		document.body.addEventListener("click", function(_e) {
			if (inArray(_e.target.classList, "clickable")) return;
			if (isDescendant(html, _e.target)) return;
			Menu.close();
	    });

		return Menu;
	}
}


function _OptionMenu_menu(_self) {
	let HTML = {
		Self: _self,
		parent: _self.parentNode
	}

	let This = this;
	this.options = [];


	this.openState = false;
	this.open = function(_item, _relativePosition, _event) {
		if (!this.options.length) return;
		
		this.openState = true;
		moveToItem(_item, _relativePosition, _event);
		HTML.Self.classList.remove("hide");
	}


	this.close = function() {
		this.openState = false;
		HTML.Self.classList.add("hide");
	}

	this.enableAllOptions = function() {
		for (option of this.options) option.enable();
	}

	this.removeAllOptions = function() {
		this.options = [];
		HTML.Self.innerHTML = "";
	}

	this.clickFirstOption = function() {
		let option = this.options[0];
		if (!option) return;
		option.html.click();
		This.close();
	}



	function removeOption(_option) {
		for (let i = 0; i < This.options.length; i++)
		{
			if (_option != This.options[i]) continue;
			This.options.splice(i, 1);
			return true;
		}
		return false;
	}


	this.addOption = function(_title = "", _onclick, _icon = "") {
		let option = document.createElement("div");
		option.className = "optionItem clickable";
		option.innerHTML = 	"<img class='optionIcon' src='images/icons/removeIcon.png'>" + 
							"<div class='optionText'>Remove task</div>";
		option.children[0].setAttribute("src", _icon);
		setTextToElement(option.children[1], _title);

		HTML.Self.append(option);
		option.onclick = function () {
			let close;
			try {
				close = _onclick();
			}
			catch (e) {return};
			if (close) This.close();
		}

		this.options.push(new function() {
			this.title = _title;
			this.html = option;

			this.remove = function() {
				removeOption(this);
				this.html.parentNode.removeChild(this.html);
			}

			this.disable = function() {
				this.html.classList.add("disabled");
			}

			this.enable = function() {
				this.html.classList.remove("disabled");
			}

			this.hide = function() {
				this.html.style.display = "none";
			}

			this.show = function() {
				this.html.style.display = "block";
			}
		});
	}

	const popupMargin = 15;
	function moveToItem(_item, _relativePosition = {left: 0, top: 0}, _event) {
		if (!_item) return false;

		let top = _item.getBoundingClientRect().top + HTML.parent.scrollTop + _relativePosition.top;
		let left = _event ? _event.clientX - 325 :  $("#mainContentHolder")[0].offsetWidth - 180;
		
		left += _relativePosition.left;

		let maxLeft = $("#mainContent")[0].offsetWidth - HTML.Self.offsetWidth - popupMargin;
		if (left > maxLeft) left = maxLeft;

		let ownHeight = HTML.Self.offsetHeight;
		if (top + _item.offsetHeight + ownHeight + popupMargin > window.innerHeight) 
		{
			top -= ownHeight + _item.offsetHeight;
		}


		HTML.Self.style.left = left + "px";
		HTML.Self.style.top	 = top + "px";
	}
}