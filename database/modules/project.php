<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/PHPV2/PacketManager.php";
	$PM->includePacket("SESSION", "1.0");

	require_once "$root/git/todo/database/modules/projectHelpers/userComponent.php";
	require_once "$root/git/todo/database/modules/projectHelpers/todoComponent.php";
	require_once "$root/git/todo/database/modules/projectHelpers/tagComponent.php";
	

	class _Project {
		public $title = "";
		public $id = "";
		
		public $users;
		public $todos;

		private $DB;

		public $errorOnCreation = true;


		public function __construct($_projectId) {
			$this->id = (string)$_projectId;

			$this->users = new _project_userComponent($this, $this->id);
			$this->todos = new _project_todoComponent($this, $this->id);
			$this->tags  = new _project_tagComponent($this, $this->id);

			$this->DB 	 = new _databaseHelper($this->id);

			$projectData = $this->DB->getProjectData();
			if (!$projectData) return $this->errorOnCreation = "E_projectNotFound";


			$user = $this->users->get($GLOBALS["App"]->userId);
			if (!$user || $user["id"] != $GLOBALS["App"]->userId) return $this->errorOnCreation = "E_userNotInProject";

			$this->title = $projectData["title"];
			$this->errorOnCreation = false;
		}


		public function changeTitle($_newTitle) {
			// do some permission checks
			$DBResult = $this->DB->writeProjectData("title", (string)$_newTitle);
			return $DBResult;
		}
	}


?>