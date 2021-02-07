<?php
	require_once  __DIR__ . "/dataTypeTemplate.php";

	class _project_tagComponent {
		private $Parent;

		private $DTTemplate;
		private $projectId;
		
		public function __construct($_parent, $_projectId) {
			$this->projectId = (string)$_projectId;
			$this->Parent = $_parent;

			$this->DTTemplate = new _project_dataTypeTemplate(
				$_projectId, 
				array("tags" => [
					"id" 		=> "String",
					"title" 	=> "String",
					"colour" 	=> "String",
					"creatorId" => "String"
				]
			));
		}


		public function getAll() {return $this->DTTemplate->getAllData();}
		public function get($_id) {return $this->DTTemplate->get($_id);}


		public function update($_newTag) {
			$user = $this->Parent->users->Self;
			if ((int)$user["permissions"] < 1) 	return "E_actionNotAllowed";

			$_newTag["creatorId"] 				= $user["id"];
			$_newTag["colour"] 					= $this->filterColor($_newTag["colour"]);
			if (!$_newTag["colour"])			return "E_invalidColor";

			$this->DTTemplate->update($_newTag);
			return $this->DTTemplate->get($_newTag["id"]);
		}

		private function filterColor($_color) {
			$str = preg_replace("/[^A-Fa-f0-9 ]/", '', $_color);
			if (strlen($str) != 6) return false;
			return '#' . $str;
		}


		public function remove($_id) {
			$user = $this->Parent->users->Self;
			if ((int)$user["permissions"] < 1) return "E_actionNotAllowed";

			return $this->DTTemplate->remove($_id);
		}
	}
?>