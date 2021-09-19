<?php
	require_once __DIR__ . "/../getRoot.php";
	include_once($GLOBALS["Root"] . "/PHP/PacketManager.php");
	$PM->includePacket("SESSION", "1.0");

	require_once __DIR__ . "/projectHelpers/databaseHelper.php";
	
	global $OrderManager;
	$OrderManager = new _OrderManager;

	class _OrderManager {
		public function __construct() {}

		public function addTaskIndicesToTaskList($_taskList, $_addPersonalIndices = true, $_userId) {
			$curTime 			= strtotime((new DateTime())->format('d-m-Y'));
			$taskOrder 			= [];
			$taskOrderUpdated 	= false;

			if ($_addPersonalIndices)
			{
				$taskOrder = $GLOBALS['DBHelper']->orderManager->getTaskOrder($_userId);
			}

			for ($i = 0; $i < sizeof($_taskList); $i++)
			{
				$_taskList[$i]['indexInProject'] = $i;
				$_taskList[$i]['personalIndex'] = 1000000000;
				if (!$_addPersonalIndices) continue;
				
				$foundPersonalIndex = false;
				for ($x = 0; $x < sizeof($taskOrder); $x++) 
				{
					if ($taskOrder[$x] != $_taskList[$i]['id']) continue;
					$_taskList[$i]['personalIndex'] = $x;
					$foundPersonalIndex = true;
					break;
				}

				if (
					$foundPersonalIndex || (
						$_taskList[$i]['groupType'] != 'date' &&
						($_taskList[$i]['groupType'] != 'overdue' || $_taskList[$i]['finished'])
					)
				) continue;

				$date = $_taskList[$i]['groupValue'];
				if (!$date) continue;

				$time = strtotime((new DateTime($date))->format('d-m-Y'));
				if ($time < $curTime && $_taskList[$i]['groupType'] != 'overdue') continue; // We are not interested in tasks in the past

				array_push($taskOrder, $_taskList[$i]['id']);
				$taskOrderUpdated = true;
			}

			if ($taskOrderUpdated) $GLOBALS['DBHelper']->orderManager->setTaskOrder($taskOrder, $_userId);
			return $_taskList;
		}

		public function moveTaskInFrontOf($_data, $_userId) {
			// Validate the tasks existence TODO


			$orderList = $GLOBALS['DBHelper']->orderManager->getTaskOrder($_userId);
			$taskId = (string)$_data['id'];

			$ownIndex = $this->getTaskIndex($taskId, $_userId);
			if ($ownIndex === false) $ownIndex = sizeof($orderList);

			array_splice($orderList, $ownIndex, 1)[0];

			$inFrontOfIndex = $this->getTaskIndex($_data['inFrontOfId'], $_userId);
			if ($inFrontOfIndex !== false && $inFrontOfIndex > $ownIndex) $inFrontOfIndex--;
			if ($inFrontOfIndex === false) $inFrontOfIndex = sizeof($orderList); // Push it if the inFrontOfIndex isn't given.
			array_splice($orderList, $inFrontOfIndex, 0, [$taskId]);

			return $GLOBALS['DBHelper']->orderManager->setTaskOrder($orderList, $_userId);
		}

		private function getTaskIndex($_id, $_userId) {
			$orderList = $GLOBALS['DBHelper']->orderManager->getTaskOrder($_userId);
			for ($i = 0; $i < sizeof($orderList); $i++)
			{
				if ($orderList[$i] != $_id) continue;
				return $i;
			}
			return false;
		}




		public function sortProjectList($_projectList, $_userId) {
			$orderList = $GLOBALS['DBHelper']->orderManager->getProjectOrder($_userId);
			$orderListUpdated = false;

			$newList = [];
			for ($i = 0; $i < sizeof($orderList); $i++)
			{
				$foundProject = false;
				for ($p = 0; $p < sizeof($_projectList); $p++)
				{	
					if ($_projectList[$p]->checked) continue;			
					if ($orderList[$i] != $_projectList[$p]->id) continue;
					array_push($newList, $_projectList[$p]);
					$_projectList[$p]->checked = true;
					$foundProject = true;
					break;
				}

				if ($foundProject) continue;
				$orderListUpdated = true;
				array_splice($orderList, $i, 1);
				$i--;
			}

			for ($p = 0; $p < sizeof($_projectList); $p++)
			{
				if (!isset($_projectList[$p]->checked))
				{
					array_push($newList, $_projectList[$p]);
					array_push($orderList, $_projectList[$p]->id);
					$orderListUpdated = true;
				} 
				unset($_projectList[$p]->checked);
			}

			if ($orderListUpdated) $GLOBALS['DBHelper']->orderManager->setProjectOrder($orderList, $_userId);
			return $newList;
		}

		public function moveProjectToIndex($_projectId, $_index, $_userId) {
			$index = (int)$_index;
			if ($index < 0) return false;
			$orderList = $GLOBALS['DBHelper']->orderManager->getProjectOrder($_userId);

			for ($i = 0; $i < sizeof($orderList); $i++)
			{
				if ($orderList[$i] != $_projectId) continue;
				array_splice($orderList, $i, 1);
				break;
			}

			array_splice($orderList, $index, 0, $_projectId);
			return $GLOBALS['DBHelper']->orderManager->setProjectOrder($orderList, $_userId);
		}
	}

?>