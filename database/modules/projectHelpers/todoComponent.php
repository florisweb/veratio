<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/projectHelpers/dataTypeTemplate.php";


	class _project_todoComponent {
		private $Parent;

		private $DTTemplate;
		private $projectId;
		
		public function __construct($_parent, $_projectId) {
			$this->projectId = (string)$_projectId;
			$this->Parent = $_parent;

			$this->DTTemplate = new _project_dataTypeTemplate(
				$_projectId, 
				array("todos" => [
					"id" 		=> "String",
					"title" 	=> "String",
					"groupType" => "String",
					"groupValue"=> "String",
					"tagId" 	=> "String",
					"finished" 	=> "Boolean",
					"assignedTo"=> "Array",
					"creatorId" => "String"
				]
			));
		}


		private function getAll() {
			return $this->DTTemplate->getAllData();
		}


		public function get($_id) {
			$task 				= $this->DTTemplate->get($_id);
			if (!$task) 		return false;
			
			$task["projectId"] 	= $this->projectId;
			return $task;
		}

		public function getByGroup($_info) {
			$groupValue 		= $this->filterGroupInfo($_info["type"], $_info["value"]);
			if ($groupValue === false) return false;
			$tasks 				= $this->getAll();

			$foundTasks = array();
			for ($i = 0; $i < sizeof($tasks); $i++)
			{
				$curTask = $tasks[$i];
				if ($curTask["groupType"] != (String)$_info["type"]) continue;
				if ($curTask["groupValue"] != (String)$groupValue && (String)$groupValue != "*") continue;
				
				$curTask["projectId"] = $this->projectId;
				array_push($foundTasks, $curTask);
			}
			return $foundTasks;
		}


		public function getByDate($_date) {
			return $this->getByGroup(["type" => "date", "value" => $_date]);
		}


		public function getByDateRange($_info) {
			if (!$_info || !$_info["range"] || !$_info["date"]) return false;
			
			$_date 		= $this->_filterDate($_info["date"]);
			if (!$_date) return false; 
			$startDate 	= strtotime($_date);

			$_range		= (int)$_info["range"];
			$endDate 	= new DateTime($_date . " + $_range day");
			$endDate 	= strtotime($endDate->format('d-m-Y'));


			$tasks 				= $this->getAll();

			$foundTasks = array();
			foreach ($tasks as $task) 
			{
				if ($task["groupType"] != "date") continue;
				$curDate = $task["groupValue"];
				$curTime = new DateTime($curDate);
				$curTime = strtotime($curTime->format('d-m-Y'));

				if ($startDate > $curTime || $curTime > $endDate) continue;

				if (!$foundTasks[$curDate]) $foundTasks[$curDate] = [];
				array_push($foundTasks[$curDate], $task);
			}

			return $foundTasks;
		}





		public function update($_newTask) {
			$userId = $GLOBALS["App"]->userId;

			$oldTask 				= $this->get($_newTask["id"]);
			$difference 			= $this->getDifferenceBetweenTasks($_newTask, $oldTask, ["creatorId"]);
		
			$permissions 			= $this->Parent->users->getPermissions("tasks");
			if (!$permissions || !$_newTask) return false;

			// only the finished-state is changed
			if ($difference[0] == "finished" && sizeof($difference) == 1)
			{
				$allowed = false;
				if ($permissions[1] >= 0 && $oldTask["creatorId"] === $userId) 			$allowed = true;
				if ($permissions[1] >= 1 && in_array($userId, $oldTask["assignedTo"])) 	$allowed = true;
				if ($permissions[1] >= 2)												$allowed = true;

				if ($allowed == false) return "E_actionNotAllowed";
			} else {
				$allowed = false;
				if ($permissions[0] >= 1 && $oldTask["creatorId"] === $userId) 			$allowed = true;
				if ($permissions[0] >= 1 && !$oldTask) 									$allowed = true;
				if ($permissions[0] >= 2)												$allowed = true;
				
				if ($allowed == false) return "E_actionNotAllowed";	

				$_newTask["creatorId"]	= $userId;
			}

			if (!$this->groupTypeExists($_newTask["groupType"])) return "E_groupTypeDoesNotExist";

			if ($_newTask["groupType"] == "overdue" && $_newTask["finished"]) 
			{
				$_newTask["groupType"] = "date";
			}

			if ($_newTask["groupType"] == "date") 
			{
				$curDate 		= new DateTime();
				$curTime 		= strtotime($curDate->format('d-m-Y'));

				$date 			= $this->_filterDate($_newTask["groupValue"]);

				if (!$date) return false;
				$_newTask["groupValue"] = $date;

				$time = strtotime((new DateTime($date))->format('d-m-Y'));
				if ($time < $curTime && !$_newTask["finished"]) $_newTask["groupType"] = "overdue";
			}

			$this->DTTemplate->update($_newTask);
			return $this->get($_newTask["id"]);
		}


		public function remove($_id) {
			$task 			= $this->get($_id);
			$userId 		= $GLOBALS["App"]->userId;
			$permissions 	= $this->Parent->users->getPermissions("tasks");
			if (!$task || !$userId || !$permissions) return false;

			$allowed = false;
			if ($permissions[1] >= 1 && $task["creatorId"] === $userId) 			$allowed = true;
			if ($permissions[1] >= 2)												$allowed = true;

			if ($allowed == false) return false;


			return $this->DTTemplate->remove($_id);
		}







		private function getDifferenceBetweenTasks($_newTask, $_oldTask, $_ignoreKeys = []) {
			if (!$_newTask || !$_oldTask) return false;

			$keys = array_keys($_oldTask);
			$difference = [];
			for ($i = 0; $i < sizeof($keys); $i++)
			{
				$curKey = $keys[$i];
				if ($_newTask[$curKey] === $_oldTask[$curKey]) 	continue;
				if (in_array($curKey, $_ignoreKeys))			continue;

				array_push($difference, $curKey);
			}

			return $difference;
		}
		


		private function groupTypeExists($_groupType) {
			return in_array($_groupType, ["date", "default", "overdue"]);
		}

		private function filterGroupInfo($_groupType, $_groupValue) {
			if (!$this->groupTypeExists($_groupType)) return false;
			if ($_groupValue == "*") return $_groupValue;

			switch ($_groupType) 
			{
				case "date":		return $this->_filterDate($_groupValue); break;
				case "default": 	return (String)$_groupValue; break;
			}
		}

			private function _filterDate($_dateStr) {
				$dateParts = explode("-", $_dateStr);
				if (sizeof($dateParts) != 3) return false;

				return (int)substr($dateParts[0], 0, 2) . "-" . (int)substr($dateParts[1], 0, 2) . "-" . (int)substr($dateParts[2], 0, 4);
			}
	
	}
?>