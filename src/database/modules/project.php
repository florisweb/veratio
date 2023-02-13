<?php
	require_once __DIR__ . "/databaseHelper.php";
	require_once __DIR__ . "/Error.php";


	// A project is cached, so if a property changes the project will have to be reinitiated

	class Project {
		public $id;
		public $title;
		public $curUser;

		private $_projectInfo;


		public function __construct($_projectId, $_projectInfo = null) {
			$this->id = (string)$_projectId;
			$this->_projectInfo = $_projectInfo;
			if (isset($_projectInfo)) $this->title = $_projectInfo['title'];
		}

		public function setCurUser($_user) {
			if (!$_user || !isset($_user->id)) return false;
			$user = $this->getUserById($_user->id);
			if (!$user) return E_USER_NOT_IN_PROJECT;
			$_user->permissions = $user['permissions'];
			$_user->type 		= $user['type'];
			$_user->name 		= $user['name'];
			$this->curUser 		= $_user;
			return true;
		}

		public function projectExists() {
			return !!$this->getProjectInfo();
		}


		public function userInProject($_user) {
			if (!$_user || !isset($_user->id)) return false;
			return !!$this->getUserById($_user->id);
		}

		public function rename($_newTitle) {
			if (!$this->curUser) return E_NO_AUTH;
			if ($this->curUser->permissions < 2) return E_ACTION_NOT_ALLOWED;
			$result = $GLOBALS['DBHelper']->writeProjectTitle($this->id, $_newTitle);
			if ($result) {$this->title = $_newTitle; $this->_projectInfo['title'] = $_newTitle;}
			return $result;
		}

		public function remove() {
			
		}


		private function getUserById($_userId) {
			$projectInfo = $this->getProjectInfo();
			if (!$projectInfo) return false;
			for ($i = 0; $i < sizeof($projectInfo['users']); $i++)
			{
				if ($projectInfo['users'][$i]['id'] == $_userId) return $projectInfo['users'][$i];
			}
			return false;
		}


		private function getProjectInfo() {
			if (!is_null($this->_projectInfo)) return $this->_projectInfo;
			$this->_projectInfo = $GLOBALS['DBHelper']->getProjectInfo($this->id);
			if ($this->_projectInfo) $this->title = $this->_projectInfo["title"];
			return $this->_projectInfo;
		}

		public function export() {
			$info = $this->getProjectInfo();
			if (!$this->curUser) return $info;
			for ($i = 0; $i < sizeof($info['users']); $i++)
			{
				if ($info['users'][$i]['id'] != $this->curUser->id) continue;
				$info['users'][$i]['self'] = true;
				return $info;
			}
			return $info;
		}
	}
?>