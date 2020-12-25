

const TextFormater = new function() {

	this.memberListToString = function(_members, _maxLength = 25) {
	  if (!_members || !_members.length) return "";

	  let memberText = _members.map(function (_member) {return _member.name}).join(", ");
	  return memberText.substr(0, _maxLength) + (memberText.length > _maxLength ? "..." : "");
	}
}