<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once __DIR__ . "/../app.php";



	class _garbageCollector {
		public function __construct() {
			$projects = $GLOBALS["App"]->getAllProjects();
			
			$overdueTasks = 0;
			foreach ($projects as $project) $overdueTasks += $this->setTasksToOverdue($project);
		}

		private function setTasksToOverdue($_project) {
			$dateTasks = $_project->todos->getByGroup([
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
				$_project->todos->update($task);
			}
			return $overdueTasks;
		}
	}



	global $GarbageCollector;
	$GarbageCollector = new _garbageCollector();
?>