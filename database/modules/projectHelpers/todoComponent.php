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


		public function getAll() {
			$todos = $this->DTTemplate->getAllData();
			//do some permission stuff ?
			return $todos;
		}


		public function getByGroup($_groupType, $_groupValue) {
			$groupValue = $this->filterGroupInfo($_groupType, $_groupValue);
			if (!$groupValue) return false;
			$tasks = $this->getAll();

			$foundTasks = array();
			for ($i = 0; $i < sizeof($tasks); $i++)
			{
				$curTask = $tasks[$i];
				if ($curTask["groupType"] != (String)$_groupType) continue;
				if ($curTask["groupValue"] != (String)$groupValue) continue;
				
				array_push($foundTasks, $curTask);
			}
			return $foundTasks;
		}

		public function getByDate($_date) {
			return $this->getByGroup("date", $_date);
		}

		public function getByDateRange($_info) {
			$_range	= (int)$_info["range"];
			$_date 	= $this->_filterDate($_info["date"]);
			if (!$_date || $_range < 0 || $_range > 1000) return false;

			$foundTodos = array();
			for ($i = 0; $i < $_range; $i++) 
			{
				$curDate 		= new DateTime($_info["date"] . " + $i day");
				$curDate 		= $curDate->format('d-m-Y');
				$curDatesTodos 	= $this->getByDate($curDate);
				$foundTodos 	= array_merge($foundTodos, $curDatesTodos);
			}

			return $foundTodos;
		}





		public function get($_id) {
			$todo = $this->DTTemplate->get($_id);
			//do some permission stuff
			return $todo;
		}



		public function update($_newTask) {
			$userId = $GLOBALS["App"]->userId;
			$_newTask["creatorId"]	= $userId;

			$oldTask 				= $this->get($_newTask["id"]);
			$difference 			= $this->getDifferenceBetweenTasks($_newTask, $oldTask, ["creatorId"]);
		
			$permissions 			= $this->Parent->users->getPermissions("tasks");
			if (!$permissions || !$_newTask) return false;

			// only the finished-state is changed
			var_dump("finish:", $difference[0] == "finished" && sizeof($difference) == 1);
			if ($difference[0] == "finished" && sizeof($difference) == 1)
			{
				$allowed = false;
				if ($permissions[1] >= 0 && in_array($userId, $oldTask["assignedTo"])) 	$allowed = true;
				if ($permissions[1] >= 1 && $oldTask["creatorId"] === $userId) 			$allowed = true;
				if ($permissions[1] >= 2)												$allowed = true;

				if ($allowed == false) return false;
			} else {
				$allowed = false;
				if ($permissions[0] >= 1 && $oldTask["creatorId"] === $userId) 			$allowed = true;
				if ($permissions[0] >= 1 && !$oldTask) 									$allowed = true;
				if ($permissions[0] >= 2)												$allowed = true;
				
				if ($allowed == false) return false;	
			}


			if ($_newTask["groupType"] != "date") return $this->DTTemplate->update($_newTask);
			
			$date = $this->_filterDate($_newTask["groupValue"]);
			if (!$date) return false;
			$_newTask["groupValue"] = $date;

			return $this->DTTemplate->update($_newTask);
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
			

		public function remove($_id) {
			$task 			= $this->get($_id);
			$userId 		= $GLOBALS["App"]->userId;
			$permissions 	= $this->Parent->users->getPermissions("tasks");
			if (!$task || !$userId || !$permissions) return false;


			$allowed = false;
			if ($permissions[0] >= 1 && $oldTask["creatorId"] === $userId) 			$allowed = true;
			if ($permissions[1] >= 2)												$allowed = true;

			if ($allowed == false) return false;


			return $this->DTTemplate->remove($_id);
		}





		private function filterGroupInfo($_groupType, $_groupValue) {
			switch ($_groupType) 
			{
				case "date": return $this->_filterDate($_groupValue); break;
				default: return false; break;
			}
		}

			private function _filterDate($_dateStr) {
				$dateParts = explode("-", $_dateStr);
				if (sizeof($dateParts) != 3) return false;

				return (int)substr($dateParts[0], 0, 2) . "-" . (int)substr($dateParts[1], 0, 2) . "-" . (int)substr($dateParts[2], 0, 4);
			}





	
	}
?>