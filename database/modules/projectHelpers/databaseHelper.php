<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/PHPV2/PacketManager.php";
	$PM->includePacket("DB", "1.0");


	class _databaseHelper {
		private $DBName = "eelekweb_todo";
		private $DBTableName = "projectList";

		private $DB;
		private $projectId;


		public function __construct($_projectId) {
			$this->DB = $GLOBALS["DB"]->connect($this->DBName);
			if (!$this->DB) die("databaseHelper.php: DB doesn't exist");

			$this->projectId = (string)$_projectId;
		}

		public function createProject($_ownerId) {
			$this->projectId 	= $this->createId();
			$projectOwner 		= '{"id": "' . (string)$_ownerId . '", "permissions": "' . $GLOBALS["App"]->ownerPermissions . '", "isOwner": true}';

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



		private function getAllProjectData() {
			return $this->DB->execute("SELECT * FROM $this->DBTableName WHERE id=?", array($this->projectId));
		}

		public function getProjectData() {
			$data = $this->getAllProjectData();
			if (!$data[0]) return false;
			
			$project = $data[0];
			$project["users"] 	= json_decode($project["users"], true);
			$project["todos"] 	= json_decode($project["todos"], true);
			$project["tags"] 	= json_decode($project["tags"], true);

			if ($project["users"] == NULL) 	$project["users"] = array();
			if ($project["todos"] == NULL) 	$project["todos"] = array();
			if ($project["tags"] == NULL) 	$project["tags"] = array();

			return $project;
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
	}

?>