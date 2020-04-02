/*

	BUTTON

	<a class='button'>
		<img src='src'>
		<span>buttonText</span>
	</a>


*/









const UI = new function() {
	let elements = [];








	this.createOptionMenu = function(_button, _menu) {
		let optionMenu = new _OptionMenu(_button, _menu);
		elements.push(optionMenu);
		return optionMenu;
	}







	function _Element(_element) {
		let HTML = {
			element: _element
		}
		this.id = newId();
		
		this.remove = function() {
			HTML.element.parentNode.removeChild(HTML.element);
			removeFromElementArray(this.id);
		}

		function removeFromElementArray(_id) {
			for (let i = 0; i < elements.length; i++)
			{
				if (elements[i].id != _id) continue;
				elements.splice(i, 1);
			}
		}
	}


	function _MenuOpener(_menu) {
		_Element.call(this);

		let HTML = {
			menu: _menu,
		}

		this.openState = false;

		this.open = function() {
			HTML.menu.classList.remove("hide");
			this.openState = true;
		}
		this.close = function() {
			HTML.menu.classList.add("hide");
			this.openState = false;
		}
		this.toggle = function() {
			if (this.openState) return this.close();
			this.open();
		}
	}


	function _OptionList(_menu) {
		_MenuOpener.call(this, _menu);
		let This = this;
		
		let HTML = {
			menu: _menu
		}

		this.options = [];
		this.removeAllOptions = function() {
			for (let i = this.options.length - 1; i >= 0; i--) this.options[i].remove();
		}

		this.addOption = function(_title, _iconSrc, _onclick) {
			let html = document.createElement("div");
			html.className = "UI listItem clickable";
			html.innerHTML = 
					"<img class='icon'>" + 
					"<a class='text'></a>";

			HTML.menu.appendChild(html);

			setTextToElement(html.children[1], _title);
			html.children[0].setAttribute("src", _iconSrc);
			html.onclick = function() {
				This.close();
				try {
					_onclick();
				} catch (e) {};
			}

			let option = new _OptionList_option(html, This);
			This.options.push(option);
			return option;
		}
	}

	function _OptionList_option(_html, _parent) {
		this.html = _html;
		this.id = newId();
		this.select = function() {_html.click();}

		this.remove = function() {
			this.html.parentNode.removeChild(this.html);

			for (let i = 0; i < _parent.options.length; i++)
			{
				if (_parent.options[i].id != this.id) continue;
				_parent.options.splice(i, 1);
			}
		}
	}






	function _OptionMenu(_button, _menu) {
		_OptionList.call(this, _menu);
		let This = this;
		let addOption_extender = this.addOption;
		
		let HTML = {
			button: _button,
			buttonText: _button.children[1],
		}
		HTML.button.addEventListener("click", function () {This.toggle()});

		this.value = false;

		this.addOption = function(_title, _iconSrc, _value) {
			return addOption_extender(_title, _iconSrc, function() {
				This.value = _value;
				setTextToElement(HTML.buttonText, _title);
				try {
					This.onOptionSelected(_value);
				} catch (e) {};
			});
		}

		this.onOptionSelected = function() {}
	}

}
