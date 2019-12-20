<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/app.php";



	class _garbageCollector {
		public function __construct() {
			$projects = $GLOBALS["App"]->getAllProjects();
			foreach ($projects as $project) $this->setTasksToOverdue($project);
		}

		private function setTasksToOverdue($_project) {
			$dateTasks = $_project->todos->getByGroup([
				"type" => "date",
				"value" => "*"
			]);

			$curDate 		= new DateTime();
			$curDate 		= strtotime($curDate->format('d-m-Y'));

			foreach ($dateTasks as $task)
			{
				if (!$task["groupValue"]) continue;
				$taskDate = strtotime($task["groupValue"]);
				if ($taskDate >= $curDate || $task["finished"]) continue;

				var_dump($task["title"]);
				echo "<br>";

				$task["groupType"] = "overdue";
				$_project->todos->update($task);
			}
		}
	}



	global $GarbageCollector;
	$GarbageCollector = new _garbageCollector();

?>