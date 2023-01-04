<?php
	class User extends Struct {
		protected $requiredProperties = ['id', 'permissions', 'type'];
		protected $optionalProperties = ['name', 'self'];

		public string $id;
		public string $name;

		public int $permissions;
		public string $type;
		public bool $self = false;

		public string $creatorId = '';
		public function __construct($_item) {
			parent::__construct($_item);
			if ($this->Error) return false;
			$this->permissions = max(0, min($this->permissions, 3));
		}
	}


	class Tag extends Struct {
		protected $requiredProperties = ['id', 'title', 'colour'];
		protected $optionalProperties = ['creatorId'];

		public string $id;
		public string $title;
		public string $colour;

		public string $creatorId = '';
		public function __construct($_item) {
			parent::__construct($_item);
			if ($this->Error) return false;
			$this->colour = $this->filterColor($this->colour);
			if (!$this->colour) $this->Error = 'Invalid Colour';
		}

		private function filterColor($_colour) { // TODO -> crashable due to preg_replace jit....-error			
			$str = preg_replace("/[^A-Fa-f0-9 ]/", '', $_colour);
			if (strlen($str) != 6) return false;
			return '#' . $str;
		}
	}



	class Task extends Struct {
		public static $GroupTypes = ["date", "default", "overdue", "toPlan"];
		protected $requiredProperties = ['id', 'title'];
		protected $optionalProperties = ['finished', 'groupType', 'groupValue', 'deadLine', 'tagId', 'assignedTo', 'creatorId', 'projectId'];

		public string $id;
		public string $title;
		public bool $finished = false;

		public string $groupType = 'default';
		public string $groupValue = '';

		public string $deadLine;
		public string $tagId = '';

		public Array $assignedTo = [];
		public string $creatorId = '';
		public string $projectId = '';


		public function __construct($_item) {
			parent::__construct($_item);
			if ($this->Error) return;
			if (!in_array($this->groupType, Task::$GroupTypes)) $this->Error = 'Invalid GroupType';

			switch ($this->groupType)
			{
				case "date":
				case "overdue":
					$this->groupValue = filterDate($this->groupValue);
					if ($this->groupType === false) $this->Error = 'Invalid GroupValue';
				break;
				default:
					$this->groupValue = '';
				break;
			}
		}
	}



	class Struct {
		protected $requiredProperties = [];
		protected $optionalProperties = [];
		public $Error = false;

		public function __construct($_item) {
			$this->setRequiredProperties($_item);
			if ($this->Error) return;
			$this->setOptionalProperties($_item);
		}

		private function setRequiredProperties($_item) {
			foreach ($this->requiredProperties as $key)
			{
				if (!isset($_item->{$key})) return $this->Error = "Missing required property with key `" . $key . "`";
				$this->{$key} = $_item->{$key};
			}
		}
		protected function setOptionalProperties($_item) {
			foreach ($this->optionalProperties as $key)
			{
				if (!isset($_item->{$key})) continue;
				$this->{$key} = $_item->{$key};
			}
		}
		public function toArray() {
			$arr = array();
			foreach ($this->requiredProperties as $key)
			{
				if (!isset($this->{$key})) continue;
				$arr[$key] = $this->{$key};
			}
			foreach ($this->optionalProperties as $key)
			{
				if (!isset($this->{$key})) continue;
				$arr[$key] = $this->{$key};
			}
			return $arr;
		}
	}


	function arrayToObject($_arr) {
		$obj = new stdClass();
		foreach ($_arr as $key => $value)
		{
			$obj->{$key} = $value;
		}
		return $obj;
	}

	function filterDate($_dateStr) {
		$dateParts = explode("-", $_dateStr);
		if (sizeof($dateParts) != 3) return false;

		return (int)substr($dateParts[0], 0, 2) . "-" . (int)substr($dateParts[1], 0, 2) . "-" . (int)substr($dateParts[2], 0, 4);
	}
?>