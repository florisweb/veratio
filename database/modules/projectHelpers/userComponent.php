<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/projectHelpers/dataTypeTemplate.php";


	class _project_userComponent {
		private $Parent;

		private $DTTemplate;
		private $projectId;
		
		public function __construct($_parent, $_projectId) {
			$this->projectId = (string)$_projectId;
			$this->Parent = $_parent;

			$this->DTTemplate = new _project_dataTypeTemplate(
				$_projectId, 
				array("users" => [
					"id" 			=> "String",
					"name" 			=> "String",
					"permissions" 	=> "String"
				]
			));
		}


		public function getAll() {
			return $this->DTTemplate->getAllData();
		}

		public function get($_id) {
			return $this->DTTemplate->get($_id);
		}


		public function update($_updatedUser) {
			$ownPermissions_user	= $this->getPermissions("users");
			$ownPermissions 		= $this->getPermissions();

			$originalUser 			= $this->get($_updatedUser["id"]);
			$originalUserPerm 		= json_decode($originalUser["permissions"], true);

			if (!$originalUser && $ownPermissions_user[0] < 2) return "E_actionNotAllowed"; // invite / new user
			if ($ownPermissions_user[0] < 1) return "E_actionNotAllowed"; // not allowed to change permissions

			
			$_updatedUser["permissions"] = json_decode($_updatedUser["permissions"], true);
			if (!$_updatedUser["permissions"]) $_updatedUser["permissions"] = [];

			


			for ($i = 0; $i < sizeof($ownPermissions); $i++)
			{
				if (!$_updatedUser["permissions"][$i]) $_updatedUser["permissions"][$i] = "";

				if ($originalUser) // update user
				{
					if ($_updatedUser["permissions"][$i] === $originalUserPerm[$i]) continue;
				}

				$permSubItems_own = str_split($ownPermissions[$i]);
				for ($s = 0; $s < sizeof($permSubItems_own); $s++)
				{
					$userPermItem = (int)$_updatedUser["permissions"][$i][$s];
					if (!$userPermItem) $_updatedUser["permissions"][$i][$s] = 0;

					if ($userPermItem <= (int)$permSubItems_own[$s]) continue;
					$_updatedUser["permissions"][$i][$s] = (int)$permSubItems_own[$s];
				}
			}

			$_updatedUser["permissions"] = json_encode($_updatedUser["permissions"]);
			return $this->DTTemplate->update($_updatedUser);
		}


		public function remove($_id) {
			$permissions = $this->getPermissions("users");
			if ($permissions[0] < 2 && 
				$GLOBALS["App"]->userId != (string)$_id // if the user wants to leave, he should be able to remove himself
			) return "E_actionNotAllowed";

			return $this->DTTemplate->remove($_id);
		}



		public function getPermissions($_type = false) {// gets the current users permissions
			return $this->getPermissionsByUser($GLOBALS["App"]->userId, $_type);
		}

		public function getPermissionsByUser($_userId, $_type = false) {
			$user = $this->get($_userId);
			if (!$user) return false;
			$permissions = json_decode($user["permissions"], true);
			if (!$permissions) return false;
			
			$permArr = [];
			switch ($_type) 
			{
				case "project": $permArr = str_split($permissions[0]); break;
				case "users": 	$permArr = str_split($permissions[1]); break;
				case "tasks":	$permArr = str_split($permissions[2]); break;
				case "tags":	$permArr = str_split($permissions[3]); break;
				default: return $permissions; break;
			}

			for ($i = 0; $i < sizeof($permArr); $i++)
			{
				$permArr[$i] = (int)$permArr[$i];
			}
			
			return $permArr;
		}
	}
	
?>