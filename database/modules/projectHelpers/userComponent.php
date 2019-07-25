<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once "$root/git/todo/database/modules/projectHelpers/dataTypeTemplate.php";
	require_once "$root/git/todo/database/modules/projectHelpers/inviteComponent.php";


	class _project_userComponent {
		private $Parent;

		private $DTTemplate;
		public $InviteComponent;
		
		public function __construct($_parent, $_projectId) {
			$this->DTTemplate = new _project_dataTypeTemplate(
				(string)$_projectId, 
				array("users" => [
					"id" 			=> "String",
					"name" 			=> "String",
					"permissions" 	=> "String",
					"isOwner" 		=> "Boolean",
					"type"			=> "String",
				]
			));

			$this->InviteComponent 	= new _project_user_inviteComponent($this, $_parent);
			$this->Parent 			= $_parent;
		}

		public function inviteByEmail($_emailAdress) { // permissions will be checked in the inviteComponent
			$ownPermissions 	= $this->getPermissions("users");
			if ($ownPermissions[0] < 1) return "E_notAllowedToInvite";
			return $this->InviteComponent->inviteByEmail($_emailAdress);
		}



		public function getAll() {
			$users = $this->DTTemplate->getAllData();
			for ($i = 0; $i < sizeof($users); $i++)
			{
				$users[$i]["Self"] = false;
				if ($users[$i]["id"] != $GLOBALS["App"]->userId) continue;
				$users[$i]["Self"] = true;
				break;
			}

			return $users;
		}

		public function get($_id) {
			$user = $this->DTTemplate->get($_id);
			if (!$user) return false;
			
			$user["Self"] = false;
			if ($user["id"] == $GLOBALS["App"]->userId) $user["Self"] = true;
			return $user;
		}


		public function update($_newUser) {
			$oldUser 				= $this->get($_newUser["id"]);
			$ownPermissions 		= $this->getPermissions();
			$ownPermissions_users 	= $this->getPermissions("users");


			$newUserPermissions 	= json_decode($_newUser["permissions"], true);
			
			if (!$oldUser && $ownPermissions_users[0] < 1) 	return "E_actionNotAllowed_notAllowedToInvite";
			if ($ownPermissions_users[1] < 1)				return "E_actionNotAllowed_notAllowedToChangeUserPermissions";
			$_newUser["isOwner"] 	= $oldUser && $oldUser["isOwner"];
			$_newUser["type"] 		= $this->filterUserType($_newUser["type"]);


			for ($pt = 0; $pt < sizeof($ownPermissions); $pt++)
			{
				$curPermission = str_split($ownPermissions[$pt]);
				for ($cp = 0; $cp < sizeof($curPermission); $cp++)
				{
					if ($newUserPermissions[$pt][$cp] <= $curPermission[$cp]) continue;
					
					if ($oldUser &&
						$newUserPermissions[$pt][$cp] == json_decode($oldUser["permissions"], true)[$pt][$cp]
					) continue;

					$newUserPermissions[$pt][$cp] = $curPermission[$cp];
				}
			}


			$_newUser["type"] = $this->filterUserType($_newUser["type"]);
			$_newUser["permissions"] = json_encode($newUserPermissions);
			if ($_newUser["isOwner"]) $_newUser["permissions"] = json_encode($GLOBALS["App"]->ownerPermissions);

			$successfullyUpdated = $this->DTTemplate->update($_newUser);
			if (!$successfullyUpdated) return "E_unexpectedError";
			return $this->get($_newUser["id"]);
		}

		private function filterUserType($_type) {
			switch ((string)$_type)
			{
				case "member": return "member"; break;
				default: return "invite"; break;
			}
		}




		public function remove($_id) {
			$permissions = $this->getPermissions("users");
			$user = $this->get($_id);
			if (!$user) return "E_userDoesnotExist";

			if (!$user["Self"]) // if the user wants to leave, he should be able to remove himself
			{
				if ($permissions[0] < 2 ||
					$user["isOwner"]
				) return "E_actionNotAllowed";
			}

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
				case "tags":	$permArr = str_split($permissions[0]); break;
				case "tasks":	$permArr = str_split($permissions[1]); break;
				case "users": 	$permArr = str_split($permissions[2]); break;
				case "project": $permArr = str_split($permissions[3]); break;
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