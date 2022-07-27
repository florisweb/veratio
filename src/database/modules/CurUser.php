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

		public function __construct() {
			if ($this->validateLinkUser()) return;
			$id = (string)$GLOBALS["SESSION"]->get("userId");
			if (!$id || is_null($id)) return;
			$this->id 			= sha1($id);
			$this->isSignedIn 	= true;
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
	}
	
?>