<?php
	require_once __DIR__ . "/../getRoot.php";
	require_once __DIR__ . "/Error.php";
	include_once($GLOBALS["Root"] . "/PHP/PacketManager.php");

	$GLOBALS["PM"]->includePacket("DB", "1.0");

	global $DBHelper;
	$DBHelper = new _databaseHelper;

	class _databaseHelper {
		private $DBName = "eelekweb_veratio";
		private $DBTableName = "projectList";

		private $DB;
		public function __construct() {
			$this->DB = $GLOBALS["DB"]->connect($this->DBName);
			if (!$this->DB) die(createErrorResponse(E_INTERNAL));
		}


		public function getProjectInfo($_projectId) {
			$rawData = $this->DB->execute("SELECT title, users FROM $this->DBTableName WHERE id=? LIMIT 1", array($_projectId));
			if (!isset($rawData[0])) return false;
			return array(
				"id" => $_projectId,
				"title" => $rawData[0]["title"],
				"users" => decodeJSON($rawData[0]["users"], []),
			);
		}

		public function getProjectInfoList() {
			$rawData = $this->DB->execute("SELECT id, title, users FROM $this->DBTableName");
			$projects = [];
			for ($i = 0; $i < sizeof($rawData); $i++)
			{
				$project = array(
					"id" => $rawData[$i]["id"],
					"title" => $rawData[$i]["title"],
					"users" => decodeJSON($rawData[$i]["users"], []),
				);
				array_push($projects, $project);
			}

			return $projects;
		}

	
		public function writeProjectDataToColumn(string $_projectId, string $_type, string $_data) {
			if (!in_array($_type, ['tasks', 'tags', 'users', 'title'])) return E_INVALID_PARAMETERS;
			return $this->DB->execute(
				"UPDATE $this->DBTableName SET $_type=? WHERE id=? LIMIT 1", 
				array($_data, $_projectId)
			);
		}
		public function readProjectDataToColumn(string $_projectId, string $_type) {
			if (!in_array($_type, ['tasks', 'tags', 'users', 'title'])) return E_INVALID_PARAMETERS;
			$data = $this->DB->execute(
				"SELECT $_type FROM $this->DBTableName WHERE id=? LIMIT 1", 
				array($_projectId)
			);
			if (!$data) return E_PROJECT_NOT_FOUND;
			return decodeJSON($data[0][$_type], []);
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
			if (!isset($data[0]) || is_null($data[0]["title"])) return "";
			return $data[0]["title"];
		}

		public function getUserData() {
			$rawData = $this->DB->execute("SELECT users FROM $this->DBTableName WHERE id=? LIMIT 1", array($this->projectId));
			if (!isset($rawData[0]) || is_null($rawData[0]["users"])) return [];
			return decodeJSON($rawData[0]["users"], []);
		}
		
		public function getTagData() {
			$rawData = $this->DB->execute("SELECT tags FROM $this->DBTableName WHERE id=? LIMIT 1", array($this->projectId));
			if (!isset($rawData[0]) || is_null($rawData[0]["tags"])) return [];
			return decodeJSON($rawData[0]["tags"], []);
		}

		public function getTaskData() {
			$rawData = $this->DB->execute("SELECT tasks FROM $this->DBTableName WHERE id=? LIMIT 1", array($this->projectId));
			if (!isset($rawData[0]) || is_null($rawData[0]["tasks"])) return [];
			return decodeJSON($rawData[0]["tasks"], []);
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


	function decodeJSON(string $_string, $_fallbackValue) {
		try {
			return json_decode($_string, true);
		} 
		catch (Exception $e) {
			return $_fallbackValue;
		}
	}

?>