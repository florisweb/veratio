<?php
	$root = realpath($_SERVER["DOCUMENT_ROOT"]);
	require_once __DIR__ . "/dataTypeTemplate.php";
	require_once __DIR__ . "/inviteComponent.php";


	class _project_userComponent {
		private $Parent;

		private $DTTemplate;
		public $InviteComponent;

		public $Self;
		
		public function __construct($_parent, $_projectId) {
			$this->DTTemplate = new _project_dataTypeTemplate(
				(string)$_projectId, 
				array("users" => [
					"id" 			=> "String",
					"name" 			=> "String",
					"permissions" 	=> "String",
					"type"			=> "String",
				]
			));

			$this->InviteComponent 	= new _project_user_inviteComponent($this, $_parent);
			$this->Parent 			= $_parent;

			$this->Self = $this->get($GLOBALS["App"]->userId);
		}

		public function inviteByEmail($_emailAdress) {
			$ownPermissions 	= $this->getPermissions("users");
			if ($ownPermissions[0] < 1) return "E_notAllowedToInvite";
			return $this->InviteComponent->inviteByEmail($_emailAdress);
		}

		public function inviteByLink() {
			$ownPermissions 	= $this->getPermissions("users");
			if ($ownPermissions[0] < 1) return "E_notAllowedToInvite";
			return $this->InviteComponent->inviteByLink();
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
			if (!is_array($_newUser)) return "E_invalidInput";
			
			$oldUser 				= $this->get($_newUser["id"]);
			$ownPermissions 		= $this->getPermissions();
			$ownPermissions_users 	= $this->getPermissions("users");


			$newUserPermissions 	= json_decode($_newUser["permissions"], true);
			if (!$newUserPermissions) $newUserPermissions = array();
			
			if (!$oldUser && $ownPermissions_users[0] < 1) 	return "E_actionNotAllowed_notAllowedToInvite";
			if ($ownPermissions_users[1] < 1)				return "E_actionNotAllowed_notAllowedToChangeUserPermissions";
			$_newUser["isOwner"] 	= $oldUser && $oldUser["isOwner"];
			$_newUser["type"] = "testType";
			if ($oldUser) $_newUser["type"] = $oldUser["type"];


			for ($pt = 0; $pt < sizeof($ownPermissions); $pt++)
			{
				$curPermission = str_split($ownPermissions[$pt]);
				if (!$newUserPermissions[$pt]) $newUserPermissions[$pt] = "0";

				for ($cp = 0; $cp < sizeof($curPermission); $cp++)
				{
					if (!$newUserPermissions[$pt][$cp]) $newUserPermissions[$pt][$cp] = "0";
					if ($newUserPermissions[$pt][$cp] <= $curPermission[$cp]) continue;
					
					if ($oldUser &&
						$newUserPermissions[$pt][$cp] == json_decode($oldUser["permissions"], true)[$pt][$cp]
					) continue;

					$newUserPermissions[$pt][$cp] = $curPermission[$cp];
				}
			}

			$_newUser["permissions"] 	= json_encode($newUserPermissions);
			if ($_newUser["isOwner"]) $_newUser["permissions"] = json_encode($GLOBALS["App"]->ownerPermissions);

			$successfullyUpdated = $this->DTTemplate->update($_newUser);
			if (!$successfullyUpdated) return "E_unexpectedError";
			return $this->get($_newUser["id"]);
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

	}	
?>