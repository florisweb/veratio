<?php
	require_once  __DIR__ . "/dataTypeTemplate.php";
	require_once  __DIR__ . "/../orderManager.php";


	class _project_taskComponent {
		private $Parent;

		private $DTTemplate;
		private $projectId;
		
		private function groupTypeExists($_groupType) {
			return in_array($_groupType, ["date", "default", "overdue", "toPlan"]);
		}

		
		public function __construct($_parent, $_projectId) {
			$this->projectId = (string)$_projectId;
			$this->Parent = $_parent;

			$this->DTTemplate = new _project_dataTypeTemplate(
				$_projectId, 
				array("tasks" => [
					"id" 			=> "String",
					"title" 		=> "String",
					"groupType" 	=> "String",
					"groupValue"	=> "String",
					"tagId" 		=> "String",
					"finished" 		=> "Boolean",
					"assignedTo"	=> "Array",
					"creatorId" 	=> "String"
				]
			));
		}

		public function getAll($_addPersonalIndices = true) {
			$tasks = $this->DTTemplate->getAllData();
			return $GLOBALS['OrderManager']->addTaskIndicesToTaskList($tasks, $_addPersonalIndices, $this->Parent->App->userId);
		}


		public function get($_id) {
			$task 				= $this->DTTemplate->get($_id);
			if (!$task) 		return false;
			
			$task["projectId"] 	= $this->projectId;
			return $task;
		}

		private function getIndex($_id) {
			$tasks = $this->getAll(false);
			for ($i = 0; $i < sizeof($tasks); $i++)
			{
				if ($tasks[$i]['id'] != $_id) continue;
				return $i;
			}
			return false;
		}

		public function getByGroup($_info) {
			$groupValue 		= $this->filterGroupInfo($_info["type"], $_info["value"]);
			if ($groupValue === false) return false;
			$tasks 				= $this->getAll((string)$_info['type'] == 'date');

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



		public function getByDateRange($_info) {
			if (!$_info || (!$_info["range"] && !is_int($_info["range"])) || !$_info["date"]) return false;
			
			$_date 		= $this->filterDate($_info["date"]);
			if (!$_date) return false; 
			$date 		= new DateTime($_date);
			$startTime	= strtotime($date->format('d-m-Y'));
			$_range		= (int)$_info["range"];
			$tasks 		= $this->getAll(true);

			$foundTasks = array();
			foreach ($tasks as $task) 
			{
				if ($task["groupType"] != "date") continue;
				$curDate = $task["groupValue"];
				$curTime = new DateTime($curDate);
				$curTime = strtotime($curTime->format('d-m-Y'));
				
				$deltaSeconds = $curTime - $startTime;
				if ($deltaSeconds < 0 || $deltaSeconds > 86400 * $_range) continue;

				$task["projectId"] = $this->projectId;
				array_push($foundTasks, $task);
			}

			return $foundTasks;
		}





		public function update($_newTask) {
			if (!is_array($_newTask)) return false;
			$user 					= $this->Parent->users->Self;
			$permissions 			= (int)$user["permissions"];
			$oldTask 				= $this->get($_newTask["id"]);
			
			if (!$_newTask) return false;

			// Check if the action is allowed
			if ($permissions < 1)
			{
				$difference = $this->getDifferenceBetweenTasks($_newTask, $oldTask, []);
				foreach ($difference as $key)
				{
					if ($key == "finished") continue;
					$_newTask[$key] = $oldTask[$key];
				}
				
				if (!in_array($user["id"], $oldTask["assignedTo"])) return "E_actionNotAllowed";
			}


			// Content checks
			if (!$this->groupTypeExists($_newTask["groupType"])) return "E_groupTypeDoesNotExist";

			if ($_newTask["groupType"] == "overdue" && $_newTask["finished"]) $_newTask["groupType"] = "date";
			$_newTask["creatorId"] = $user["id"];

			if ($_newTask["groupType"] == "date") 
			{
				$curDate 		= new DateTime();
				$curTime 		= strtotime($curDate->format('d-m-Y'));

				$date 			= $this->filterDate($_newTask["groupValue"]);
				if (!$date) 	return false;

				$_newTask["groupValue"] = $date;


				$time = strtotime((new DateTime($date))->format('d-m-Y'));
				if ($time < $curTime && !$_newTask["finished"]) $_newTask["groupType"] = "overdue";
			}
			

			$this->DTTemplate->update($_newTask);
			return $this->get($_newTask["id"]);
		}


		public function remove($_id) {
			$task 					= $this->get($_id);
			$permissions			= (int)$this->Parent->users->Self["permissions"];
			
			if (!$task) 			return false;
			if ($permissions < 1) 	return "E_actionNotAllowed";

			return $this->DTTemplate->remove($_id);
		}


		public function moveInFrontOf($_data) {
			if ($_data['isPersonal'])
			{
				return $GLOBALS['OrderManager']->moveTaskInFrontOf($_data, $this->Parent->App->userId);
			}

			if (!isset($_data['id']) || !isset($_data['inFrontOfId'])) return 'E_invalidParameters';

			$ownIndex = $this->getIndex($_data['id']);
			if ($ownIndex === false) return 'E_taskNotFound';

			$user 			= $this->Parent->users->Self;
			$permissions 	= (int)$user["permissions"];
			if ($permissions < 1) return 'E_actionNotAllowed';

			$tasks = $this->getAll(false);
			$task = array_splice($tasks, $ownIndex, 1)[0];

			$inFrontOfIndex = $this->getIndex($_data['inFrontOfId']);
			if ($inFrontOfIndex !== false && $inFrontOfIndex > $ownIndex) $inFrontOfIndex--;
			if ($inFrontOfIndex === false) $inFrontOfIndex = sizeof($tasks); // Push it if the inFrontOfIndex isn't given.
			array_splice($tasks, $inFrontOfIndex, 0, [$task]);

			return $this->DTTemplate->writeData(json_encode($tasks));
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
		

		private function filterGroupInfo($_groupType, $_groupValue) {
			if (!$this->groupTypeExists($_groupType)) return false;
			if ($_groupValue == "*") return $_groupValue;

			switch ($_groupType) 
			{
				case "date":		return $this->filterDate($_groupValue); break;
				case "default": 	return (String)$_groupValue; break;
			}
		}

		private function filterDate($_dateStr) {
			$dateParts = explode("-", $_dateStr);
			if (sizeof($dateParts) != 3) return false;

			return (int)substr($dateParts[0], 0, 2) . "-" . (int)substr($dateParts[1], 0, 2) . "-" . (int)substr($dateParts[2], 0, 4);
		}
	}
?>