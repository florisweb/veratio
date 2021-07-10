<?php
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
					"permissions" 	=> "Int",
					"type"			=> "String",
				]
			));

			$this->InviteComponent 	= new _project_user_inviteComponent($this, $_parent);
			$this->Parent 			= $_parent;

			$this->Self = $this->get($this->Parent->App->userId);
		}

		public function inviteByEmail($_emailAdress) {
			$permissions = (int)$this->Self["permissions"];
			if ($permissions < 2) return "E_notAllowedToInvite";

			return $this->InviteComponent->inviteByEmail($_emailAdress);
		}

		public function inviteByLink() {
			$permissions = (int)$this->Self["permissions"];
			if ($permissions < 2) return "E_notAllowedToInvite";

			return $this->InviteComponent->inviteByLink();
		}



		public function getAll() {
			$users = $this->DTTemplate->getAllData();
			for ($i = 0; $i < sizeof($users); $i++)
			{
				$users[$i]["Self"] = false;
				if ($users[$i]["id"] != $this->Self["id"]) continue;
				$users[$i]["Self"] = true;
				break;
			}

			return $users;
		}

		public function get($_id) {
			$user = $this->DTTemplate->get($_id);
			if (!$user) return false;
			
			$user["Self"] = false;
			if ($user["id"] == $this->Self["id"]) $user["Self"] = true;

			return $user;
		}


		public function update($_newUser) {
			if (!is_array($_newUser)) return "E_invalidInput";

			
			$ownPermissions 	= (int)$this->Self["permissions"];
			$oldUser 			= $this->get($_newUser["id"]);
			$oldUserPermissions = 0;
			if ($oldUser) $oldUserPermissions = (int)$oldUser["permissions"];
			

			if ($ownPermissions < 2) 								return "E_actionNotAllowed";  // not allowed to change permissions anyway
			if ($ownPermissions < $oldUserPermissions) 				return "E_actionNotAllowed";  // don't downgrade someone a superior
			if ($ownPermissions < (int)$_newUser["permissions"]) 	$_newUser["permissions"] = $ownPermissions;

			$_newUser["type"] = "member";
			if ($oldUser) $_newUser["type"] = $oldUser["type"];
			
			$this->DTTemplate->update($_newUser);
			return $this->get($_newUser["id"]);
		}


		public function remove($_id) {
			// when the user wants to leave he can remove himself
			if ($this->Self["id"] === $_id) return $this->DTTemplate->remove($this->Self["id"]);

			$ownPermissions = (int)$this->Self["permissions"];
			if ($ownPermissions < 2) return "E_actionNotAllowed";

			$user = $this->get($_id);
			if (!$user) return false;
			if ($ownPermissions < (int)$user["permissions"]) return "E_actionNotAllowed";

			return $this->DTTemplate->remove($_id);
		}

	}	
?>