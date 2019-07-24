<?php
	class _project_user_inviteComponent {
		private $Parent;

	
		public function __construct($_parent) {
			$this->Parent = $_parent;

		}

		public function inviteByEmail($_emailAdress) {
			$inviteId = sha1(uniqid(mt_rand(), true));
			$emailAdress = $this->filterEmailAdress($_emailAdress);
			if (!$emailAdress) return $emailAdress;

			$user = array(
				"id" 			=> $inviteId,
				"name"			=> $emailAdress;
				"permissions" 	=> "", // will be autoset to the minimum
				"type"			=> "invite"
			);

			$newUser = $this->parent->update($user);
			if (is_string($newUser)) return $newUser;

 			
		}

		private function filterEmailAdress($_emailAdress) {
			// filter the email TODO
			return $_emailAdress;
		}
	}
	
?>