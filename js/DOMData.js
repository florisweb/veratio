


const DOMData = new function () {
	let Data = [];

	return {
		get: function(_element) {
			for (e of Data) 
			{
				if (e.element !== _element) continue;
				return e.data;
			}
			return false;
		},

		set: function(_element, _data) {
			for (let i = 0; i < Data.length; i++) 
			{
				if (Data[i].element !== _element) continue;
				Data[i].data = _data;
				return true;
			}

			let dataHolder = {
				element: _element,
				data: _data,
			}
			Data.push(dataHolder);

			return true;
		},
	}
}