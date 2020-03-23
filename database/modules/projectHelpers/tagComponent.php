<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
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
			if ((int)$user["permissions"] < 1) return "E_actionNotAllowed";

			$_newTag["creatorId"] = $user["id"];
			return $this->DTTemplate->update($_newTag);
		}


		public function remove($_id) {
			$user = $this->Parent->users->Self;
			if ((int)$user["permissions"] < 1) return "E_actionNotAllowed";

			return $this->DTTemplate->remove($_id);
		}
	}
?>