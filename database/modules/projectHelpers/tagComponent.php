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


		public function getAll() {
			$tasks = $this->DTTemplate->getAllData();
			//do some permission stuff 
			
			return $tasks;
		}





		public function get($_id) {
			$todo = $this->DTTemplate->get($_id);
			//do some permission stuff
			return $todo;
		}



		public function update($_newTag) {
			//do some permission stuff


			$_newTag["creatorId"] = $GLOBALS["App"]->userId;

			return $this->DTTemplate->update($_newTag);
		}


		public function remove($_id) {
			//do some permission stuff
			return $this->DTTemplate->remove($_id);
		}
	
	}
?>