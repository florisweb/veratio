<?php
	require_once __DIR__ . '/Error.php';
	require_once __DIR__ . '/types.php';
	require_once __DIR__ . '/typeComponent.php';




	class TaskComponent extends TypeComponent {
		protected $Type = 'tasks';


		// public function update($_newTask) {
		// 	$newTask = new Task(arrayToObject($_newTask));
		// 	if (!$newTask) return E_INVALID_PARAMETERS;

		// 	if (!$this->Project->curUser) return E_ACTION_NOT_ALLOWED;
		// 	$oldTask = $this->get($_newTask['id']);
		// 	$permissions = $this->Project->curUser->permissions;
			
			// Check if the action is allowed






			// switch ($permissions)
			// {
			// 	case 1:

			// 	break;
			// 	case 2: 

			// 	break;

			// 	default:
			// 		if (!$oldTask) return E_ACTION_NOT_ALLOWED;
			// 		if (!in_array($Project->CurUser->id, $oldTask["assignedTo"])) return E_ACTION_NOT_ALLOWED;

			// 		$difference = $this->getDifferenceBetweenTasks($newTask, $oldTask, []);
			// 		foreach ($difference as $key)
			// 		{
			// 			if ($key == "finished") continue;
			// 			$newTask[$key] = $oldTask[$key];
			// 		}
			// 	break;
			// }

	
			// $deadLine = $this->filterDate($_newTask["deadLine"]);
			// $_newTask["deadLine"] = $deadLine ? $deadLine : "";

			// // Group-specific checks
			// if (!$this->groupTypeExists($_newTask["groupType"])) return "E_groupTypeDoesNotExist";
			// switch ($_newTask["groupType"])
			// {
			// 	case "overdue":
			// 		if ($_newTask["finished"]) $_newTask["groupType"] = "date";
			// 	break;
			// 	case "date":
			// 		$curDate 		= new DateTime();
			// 		$curTime 		= strtotime($curDate->format('d-m-Y'));

			// 		$date = $this->filterDate($_newTask["groupValue"]);
			// 		if (!$date) return false;
			// 		$_newTask["groupValue"] = $date;

			// 		$time = strtotime((new DateTime($date))->format('d-m-Y'));
			// 		if ($time < $curTime && !$_newTask["finished"]) $_newTask["groupType"] = "overdue";
			// 	break;
			// }
			

			// $this->DTTemplate->update($_newTask);
			// return $this->get($_newTask["id"]);


		// }

		
	}
?>