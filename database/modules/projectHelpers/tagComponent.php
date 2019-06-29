<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/projectHelpers/dataTypeTemplate.php";


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
			$todos = $this->DTTemplate->getAllData();
			//do some permission stuff 
			
			return $todos;
		}





		public function get($_id) {
			$todo = $this->DTTemplate->get($_id);
			//do some permission stuff
			return $todo;
		}



		public function update($_newTodo) {
			//do some permission stuff


			$_newTodo["creatorId"] = $GLOBALS["App"]->userId;

			return $this->DTTemplate->update($_newTodo);
		}


		public function remove($_id) {
			//do some permission stuff
			return $this->DTTemplate->remove($_id);
		}
	
	}
?>