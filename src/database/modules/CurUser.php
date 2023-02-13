<?php
	require_once __DIR__ . '/Error.php';
	require_once __DIR__ . "/Project.php";
	$GLOBALS["PM"]->includePacket("SESSION", "1.0");

	global $CurUser;
	$CurUser = new _CurUser();


	class _CurUser {
		public $id;
		public $isLinkUser 			= false;
		public $linkUserVerified 	= false;
		public $isSignedIn 			= false;
		public $name 				= '---';

		public function __construct() {
			if ($this->validateLinkUser()) return;
			$id = (string)$GLOBALS["SESSION"]->get("userId");
			if (!$id || is_null($id)) return;
			$this->id 			= sha1($id);
			$this->isSignedIn 	= true;
			$this->name = (string)$GLOBALS["SESSION"]->get("userName");
		}

		private function validateLinkUser() {
			$link = false;
			if (isset($_POST['linkId'])) 
			{
				$link = (string)$_POST['linkId'];
			} else if (isset($_GET['link'])) $link = (string)$_GET['link'];
			if (!$link || strlen($link) > 100) return false;

			$this->isLinkUser 	= true;
			$this->id 			= sha1($link);
			$this->signedIn 	= true;
			return true;
		}

		public function getProjectList() {
			if (!$this->isSignedIn) return E_NO_AUTH;

			$projectInfo = $GLOBALS['DBHelper']->getProjectInfoList();
			$projects = [];
			for ($i = 0; $i < sizeof($projectInfo); $i++)
			{
				$project = new Project($projectInfo[$i]['id'], $projectInfo[$i]);
				if (!$project->userInProject($this)) continue;
				$project->setCurUser($this);
				array_push($projects, $project);
			}
			return $projects;
		}

		public function getProject($_id) {
			$project = new Project($_id);
			if (!$project->projectExists()) return E_PROJECT_NOT_FOUND;
			if (!$project->userInProject($this)) return E_USER_NOT_IN_PROJECT;
			$project->setCurUser($this);
			return $project;
		}

		public function createProject($_title) {
			if (!$_title || strlen($_title) < 2) return E_INVALID_PARAMETERS;
			$projectId = $GLOBALS['DBHelper']->createProject($this);
			if (!$projectId) return E_PROJECT_NOT_CREATED;
		
			$project = $this->getProject($projectId);
			if (!$project || isError($project)) return E_PROJECT_NOT_CREATED;
			$titleChanged = $project->rename($_title);
			if (!$titleChanged) return E_PROJECT_NOT_CREATED;
			if (isError($titleChanged)) return $titleChanged;
			return $project;
		}
	}

?>