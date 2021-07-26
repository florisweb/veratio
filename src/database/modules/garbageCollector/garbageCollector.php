<?php
	require_once __DIR__ . "/../app.php";



	class _garbageCollector {
		private $projects;
		public function __construct() {
			$this->projects = $GLOBALS["App"]->getAllProjects();
			if ($this->projects == "E_noAuth") return;
			
			$overdueTasks = 0;
			foreach ($this->projects as $project) $overdueTasks += $this->setTasksToOverdue($project);

			$removedTaskOrders = $this->cleanOrderManager();
			// echo '<div style="display: none">Overdue: ' . $overdueTasks . ' TaskOrder: ' . $removedTaskOrders . "</div>";
		}

		private function setTasksToOverdue($_project) {
			$dateTasks = $_project->tasks->getByGroup([
				"type" => "date",
				"value" => "*"
			]);

			$curDate 		= new DateTime();
			$curDate 		= strtotime($curDate->format('d-m-Y'));

			$overdueTasks = 0;

			foreach ($dateTasks as $task)
			{
				if (!$task["groupValue"]) continue;
				$taskDate = strtotime($task["groupValue"]);
				if ($taskDate >= $curDate || $task["finished"]) continue;

				$overdueTasks++;

				$task["groupType"] = "overdue";
				$_project->tasks->update($task);
			}
			return $overdueTasks;
		}



		private function cleanOrderManager() {
			$taskOrder 		= $GLOBALS['DBHelper']->orderManager->getTaskOrder($GLOBALS['App']->userId);
			$newTaskOrder 	= array();
			$curTime 		= strtotime((new DateTime())->format('d-m-Y'));

			for ($i = 0; $i < sizeof($taskOrder); $i++)
			{
				$curTask = $this->getTaskById($taskOrder[$i]);
				if (!$curTask) continue;
				if (
					$curTask['groupType'] != 'date' &&
					($curTask['groupType'] != 'overdue' || $curTask['finished'])
				) continue;

				$date = $curTask['groupValue'];
				if (!$date) continue;

				$time = strtotime((new DateTime($date))->format('d-m-Y'));
				if ($time < $curTime && $curTask['groupType'] != 'overdue') continue; // We are not intrested in tasks in the past

				array_push($newTaskOrder, $taskOrder[$i]);
			}
		

			$delta = sizeof($taskOrder) - sizeof($newTaskOrder); 
			
			if ($delta != 0) $GLOBALS['DBHelper']->orderManager->setTaskOrder($newTaskOrder, $GLOBALS['App']->userId);
			return $delta;
		}

		private function getTaskById($_id) {
			foreach ($this->projects as $project) 
			{
				$task = $project->tasks->get($_id);
				if (!$task) continue;
				return $task;
			}
			return false;
		}
	}



	global $GarbageCollector;
	$GarbageCollector = new _garbageCollector();
?>