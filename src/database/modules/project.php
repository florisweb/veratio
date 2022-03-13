<?php
	require_once __DIR__ . "/../getRoot.php";
	include_once($GLOBALS["Root"] . "/PHP/PacketManager.php");
	$PM->includePacket("SESSION", "1.0");

	require_once __DIR__ . "/orderManager.php";
	require_once __DIR__ . "/projectHelpers/userComponent.php";
	require_once __DIR__ . "/projectHelpers/taskComponent.php";
	require_once __DIR__ . "/projectHelpers/tagComponent.php";
	

	class _Project {
		public $title = "";
		public $id = "";
		
		public $users;
		public $tasks;

		private $DB;

		public $errorOnCreation = true;
		public $App;


		public function __construct($_projectId, $_App) {
			$this->id = (string)$_projectId;
			$this->App = $_App;
	
			$this->DB 	 = $GLOBALS["DBHelper"]->getDBInstance($this->id);			
			$this->users = new _project_userComponent($this, $this->id, $this->DB);
			$this->tasks = new _project_taskComponent($this, $this->id, $this->DB);
			$this->tags  = new _project_tagComponent($this, $this->id, $this->DB);

			$this->title = $this->DB->getTitle();
			if (!is_string($this->title)) return $this->errorOnCreation = "E_projectNotFound";
			if (!$this->users->Self) return $this->errorOnCreation = "E_userNotInProject";

			$this->errorOnCreation = false;
		}


		public function moveToIndex($_index) {
			return $GLOBALS['OrderManager']->moveProjectToIndex($this->id, $_index, $GLOBALS['App']->userId);
		}

		public function rename($_newTitle = "Titleless") {
			$user = $this->users->Self;
			if (!$user) return "E_userNotInProject";

			if ((int)$user["permissions"] < 2) return "E_actionNotAllowed";

			return $this->DB->writeProjectData("title", (string)$_newTitle);
		}



		public function remove() {
			$user = $this->users->Self;
			if (!$user) return "E_userNotInProject";

			if ((int)$user["permissions"] < 3) return "E_actionNotAllowed";

			return $this->DB->removeProject();
		}

		public function export() {
			return array(
				"id" 	=> $this->id,
				"title" => urlencode($this->title),
				"importData" => [
					"users"	=> $this->users->getAll(),
					"tags"	=> $this->tags->getAll()
				]
			);
		}
	}


?>