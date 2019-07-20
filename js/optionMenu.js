

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

		this.openState = false;
		this.open = function(_item, _event) {
			this.openState = true;
			moveToItem(_item, _event);		
			HTML.Self.classList.remove("hide");
		}


		this.close = function() {
			this.openState = false;
			HTML.Self.classList.add("hide");
			setTimeout(function (_item) {_item.style.top = "-50px"}, 300, HTML.Self);
		}


		this.addOption = function(_title = "", _onclick, _icon = "") {
			let option = document.createElement("div");
			option.className = "optionItem clickable";
			option.innerHTML = 	"<img class='optionIcon' src='images/icons/removeIcon.png'>" + 
								"<div class='optionText'>Remove task</div>";
			option.children[0].setAttribute("src", _icon);
			setTextToElement(option.children[1], _title);

			HTML.Self.append(option);
			option.addEventListener("click", This.close)
			option.onclick = _onclick;
		}


		function moveToItem(_item, _event) {
			if (!_item) return false;
			let top = _item.getBoundingClientRect().top + HTML.parent.scrollTop + 30;
			let left = _event ? _event.clientX - 325 :  $("#mainContentHolder")[0].offsetWidth - 180;

			let maxLeft = $("#mainContent")[0].offsetWidth - HTML.Self.offsetWidth - 15;
			if (left > maxLeft) left = maxLeft;
			
			HTML.Self.style.left = left + "px";
			HTML.Self.style.top	 = top + "px";
		}
	}




