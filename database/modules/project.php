<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/PHPV2/PacketManager.php";
	$PM->includePacket("SESSION", "1.0");

	require_once __DIR__ . "/projectHelpers/userComponent.php";
	require_once __DIR__ . "/projectHelpers/todoComponent.php";
	require_once __DIR__ . "/projectHelpers/tagComponent.php";
	

	class _Project {
		public $title = "";
		public $id = "";
		
		public $users;
		public $tasks;

		private $DB;

		public $errorOnCreation = true;


		public function __construct($_projectId) {
			$this->id = (string)$_projectId;

			$this->users = new _project_userComponent($this, $this->id);
			$this->tasks = new _project_taskComponent($this, $this->id);
			$this->tags  = new _project_tagComponent($this, $this->id);

			$this->DB 	 = $GLOBALS["DBHelper"]->getDBInstance($this->id);

			$projectData = $this->DB->getProjectData();
			if (!$projectData) return $this->errorOnCreation = "E_projectNotFound";

			if (!$this->users->Self) return $this->errorOnCreation = "E_userNotInProject";

			$this->title = $projectData["title"];
			$this->errorOnCreation = false;
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
	}


?>