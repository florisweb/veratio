<?php
	require_once __DIR__ . "/../getRoot.php";
	include_once($GLOBALS["Root"] . "/PHP/PacketManager.php");
	$PM->includePacket("SESSION", "1.0");

	require_once __DIR__ . "/projectHelpers/databaseHelper.php";
	
	global $OrderManager;
	$OrderManager = new _OrderManager;

	class _OrderManager {
		public function __construct() {
		
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
			$orderList = $GLOBALS['DBHelper']->orderManager->getProjectOrder($_userId);
			// do some checks to ensure all projects the user has access to are in the list, and there are no project the user doesn't have access to

			array_splice($orderList, (int)$_index, 0, $_projectId);
			return $GLOBALS['DBHelper']->orderManager->setProjectOrder($orderList, $_userId);
		}
	}

?>