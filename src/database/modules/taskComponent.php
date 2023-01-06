<?php
	require_once __DIR__ . '/Error.php';
	require_once __DIR__ . '/types.php';
	require_once __DIR__ . '/typeComponent.php';




	class TaskComponent extends TypeComponent {
		protected $Type = 'tasks';


		public function getByGroup(String $_groupType, String $_groupValue = '*') {
			$groupValue 		= $this->filterGroupInfo($_groupType, $_groupValue);
			if ($groupValue === false) return E_INVALID_PARAMETERS;
			$tasks 				= $this->getAll();
			$foundTasks = array();
			foreach ($tasks as $task) 
			{
				if ($task->groupType != $_groupType) continue;
				if ($task->groupValue != $groupValue && $groupValue != "*") continue;
				array_push($foundTasks, $task);
			}
			return $foundTasks;
		}

		// range is defined as the date + the range, ea, range zero is the actual date only
		public function getByDateRange(String $_date, int $_range = 0) { 
			$_date 		= filterDate($_date);
			if (!$_date) return E_INVALID_PARAMETERS; 
			$date 		= new DateTime($_date);
			$startTime	= strtotime($date->format('d-m-Y'));
			$tasks 		= $this->getAll();

			$foundTasks = array();
			foreach ($tasks as $task) 
			{
				if ($task->groupType != "date") continue;
				$curDate = $task->groupValue;
				$curTime = new DateTime($curDate);
				$curTime = strtotime($curTime->format('d-m-Y'));
				
				$deltaSeconds = $curTime - $startTime;
				if ($deltaSeconds < 0 || $deltaSeconds > 86400 * $_range) continue;
				array_push($foundTasks, $task);
			}

			return $foundTasks;
		}





		public function update($_newTask) {
			if (!$_newTask || $_newTask->Error) return E_INVALID_PARAMETERS;
			if (!$this->Project->curUser) return E_ACTION_NOT_ALLOWED;
			$oldTask = $this->get($_newTask->id);
			$permissions = $this->Project->curUser->permissions;

			if ($permissions < 1) // Read only permissions
			{
				if (!$oldTask) return E_ACTION_NOT_ALLOWED;

				if (!in_array($this->Project->curUser->id, $oldTask->assignedTo)) return E_ACTION_NOT_ALLOWED;
				// Only allowed to change the finish-state
				$finished = $_newTask->finished;
				$_newTask = $oldTask;
				$_newTask->finished = $finished;
			}


			// Filter the deadline
			$deadLine = filterDate($_newTask->deadLine);
			$_newTask->deadLine = $deadLine ? $deadLine : "";



			// Group-specific checks
			switch ($_newTask->groupType)
			{
				case "overdue":
					if ($_newTask->finished) $_newTask->groupType = "date";
				break;
				case "date":
					$curDate = new DateTime();
					$curTime = strtotime($curDate->format('d-m-Y'));

					$time = strtotime((new DateTime($_newTask->groupValue))->format('d-m-Y'));
					if ($time < $curTime && !$_newTask->finished) $_newTask->groupType = "overdue";
				break;
			}

			return parent::update($_newTask);
		}



		public function remove($_id) {
			if (!$this->Project->curUser) return E_ACTION_NOT_ALLOWED;
			$permissions = $this->Project->curUser->permissions;
			if ($permissions < 1) return E_ACTION_NOT_ALLOWED;
			return parent::remove($_id);
		}






		private function filterGroupInfo($_groupType, $_groupValue) {
			if (!in_array($_groupType, Task::$GroupTypes)) return false;

			if ($_groupValue == "*") return $_groupValue;
			switch ($_groupType) 
			{
				case "date":		
					return filterDate($_groupValue); 
				break;
				case "default": 	
					return (String)$_groupValue; 
				break;
				default: 
					return '*'; // The groupValue is irrelevant, so just accept all tasks
				break;
			}
		}
		
	}
?>