<?php
	require_once __DIR__ . "/../app.php";



	class _garbageCollector {
		public function __construct() {
			$projects = $GLOBALS["App"]->getAllProjects();
			if ($projects == "E_noAuth") return;
			
			$overdueTasks = 0;
			foreach ($projects as $project) $overdueTasks += $this->setTasksToOverdue($project);
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
	}



	global $GarbageCollector;
	$GarbageCollector = new _garbageCollector();
?>