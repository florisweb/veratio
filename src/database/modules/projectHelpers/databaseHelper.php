<?php
	require_once __DIR__ . "/../../getRoot.php";
	include_once($GLOBALS["Root"] . "/PHP/PacketManager.php");

	$GLOBALS["PM"]->includePacket("DB", "1.0");
	$GLOBALS["PM"]->includePacket("SESSION", "1.0");

	global $DBHelper;
	$DBHelper = new _databaseHelper;

	class _databaseHelper {
		private $DBName = "eelekweb_veratio";

		private $DB;
		public $orderManager;
		public function __construct() {
			$this->DB = $GLOBALS["DB"]->connect($this->DBName);
			if (!$this->DB) die("databaseHelper.php: DB doesn't exist");
			$this->orderManager = new _databaseHelper_orderManager($this->DB);
		}

		public function getDBInstance($_projectId) {
			return new _databaseHelper_DBInstance($this->DB, $_projectId);
		}

		public function getUserId() {
			$userId = $GLOBALS["SESSION"]->get("userId");
			if (!$userId) return false;
			return $userId;
		}
	}

	class _databaseHelper_orderManager {
		private $DBTableName = "orderManager";
		private $DB;


		public function __construct($_DB) {
			$this->DB = $_DB;
		}

		public function getProjectOrder($_userId) {
			$data = $this->DB->execute("SELECT projectOrder FROM $this->DBTableName WHERE userId=? LIMIT 1", array($_userId));
			$order = $data[0]['projectOrder'];
			if (!$order || !isset($order)) return [];
			return json_decode($order, true);
		}
		public function setProjectOrder($_orderArr, $_userId) {
			$orderStr = json_encode($_orderArr);
			if ($this->dataExists($_userId))
			{
				return $this->DB->execute("UPDATE $this->DBTableName SET projectOrder=? WHERE userId=?", array($orderStr, $_userId));
			}
			return $this->DB->execute("INSERT INTO $this->DBTableName (userId, projectOrder) VALUES (?, ?)", array($_userId, $orderStr));
		}
		
		public function getTaskOrder($_userId) {
			$data = $this->DB->execute("SELECT taskOrder FROM $this->DBTableName WHERE userId=? LIMIT 1", array($_userId));
			$order = $data[0]['taskOrder'];
			if (!$order || !isset($order)) return [];
			return json_decode($order, true);
		}

		public function setTaskOrder($_orderArr, $_userId) {
			$orderStr = json_encode($_orderArr);
			if ($this->dataExists($_userId))
			{
				return $this->DB->execute("UPDATE $this->DBTableName SET taskOrder=? WHERE userId=?", array($orderStr, $_userId));
			}
			return $this->DB->execute("INSERT INTO $this->DBTableName (userId, taskOrder) VALUES (?, ?)", array($_userId, $orderStr));
		}
		private function dataExists($_userId) {
			$data = $this->DB->execute("SELECT * FROM $this->DBTableName WHERE userId=? LIMIT 1", array($_userId));
			return sizeof($data) != 0;
		}
	}



	class _databaseHelper_DBInstance {
		private $DBTableName = "projectList";

		private $DB;
		private $projectId;


		public function __construct($_DB, $_projectId) {
			$this->DB 			= $_DB;
			$this->projectId 	= (string)$_projectId;
		}




		public function createProject($_ownerId) {
			$this->projectId 	= $this->createId();

			$userId = $GLOBALS["DBHelper"]->getUserId();
			$user 	= $GLOBALS["USER"]->getById($userId);
			if (!$user) return "E_userNotFound";

			$projectOwner 		= json_encode(array(
				"id" 			=> $_ownerId,
				"name"			=> $user["name"],
				"permissions"	=> 3,
				"type"			=> "member"
			));

			$DBResult = $this->DB->execute(
				"INSERT INTO projectList (id, users) VALUES (?, ?)", 
				array($this->projectId, "[" . $projectOwner . "]")
			);

			if (!$DBResult) return false;
			return $this->projectId;
		}

		public function getAllProjectIds() {
			$foundIds = $this->DB->execute("SELECT id FROM $this->DBTableName", array());
			for ($i = 0; $i < sizeof($foundIds); $i++)
			{
				$foundIds[$i] = $foundIds[$i]["id"];
			}
			return $foundIds;
		}

		public function getTitle() {
			$data = $this->DB->execute("SELECT title FROM $this->DBTableName WHERE id=? LIMIT 1", array($this->projectId));
			if (!isset($data[0])) return;
			return $data[0]["title"];
		}

		public function getUserData() {
			$rawData = $this->DB->execute("SELECT users FROM $this->DBTableName WHERE id=? LIMIT 1", array($this->projectId));
			if (!isset($rawData[0])) return false;
			$data = json_decode($rawData[0]["users"], true);
			if ($data == NULL) return array();
			return $data;
		}
		
		public function getTagData() {
			$rawData = $this->DB->execute("SELECT tags FROM $this->DBTableName WHERE id=? LIMIT 1", array($this->projectId));
			if (!isset($rawData[0])) return false;
			$data = json_decode($rawData[0]["tags"], true);
			if ($data == NULL) return array();
			return $data;
		}

		public function getTaskData() {
			$rawData = $this->DB->execute("SELECT tasks FROM $this->DBTableName WHERE id=? LIMIT 1", array($this->projectId));
			if (!isset($rawData[0])) return false;
			$data = json_decode($rawData[0]["tasks"], true);
			if ($data == NULL) return array();
			return $data;
		}


		public function writeProjectData($_column, $_data) {
			$columns = $this->DB->getColumnNames($this->DBTableName);
			$targetColumn = (string)$_column;
			if (!in_array($targetColumn, $columns) || !$columns || !$targetColumn) return false;

			return $this->DB->execute(
				"UPDATE $this->DBTableName SET $targetColumn=? WHERE id=?", 
				array((string)$_data, $this->projectId)
			);
		}


		public function createId() {
			return 	sha1(uniqid(mt_rand(), true)) . 
					sha1(uniqid(mt_rand(), true)) . 
					sha1(uniqid(mt_rand(), true));
		}


		public function removeProject() {
			return $this->DB->execute(
				"DELETE FROM $this->DBTableName WHERE id=? LIMIT 1", 
				array($this->projectId)
			);
		}
	}

?>