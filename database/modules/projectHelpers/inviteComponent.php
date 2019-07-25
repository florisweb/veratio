<?php
	class _project_user_inviteComponent {
		private $Parent;
		private $Project;

	
		public function __construct($_parent, $_project) {
			$this->Parent = $_parent;
			$this->Project = $_project;
		}

		public function inviteByEmail($_emailAdress) {
			$inviteId = sha1(uniqid(mt_rand(), true));
			$emailAdress = $this->filterEmailAdress($_emailAdress);
			if (!$emailAdress) return $emailAdress;

			$user = array(
				"id" 			=> $inviteId,
				"name"			=> $emailAdress,
				"permissions" 	=> "", // will be autoset to the minimum
				"type"			=> "invite"
			);

			$newUser = $this->Parent->update($user);
			if (is_string($newUser)) return $newUser;

 			$mailSuccessfullySend = $this->sendMail($emailAdress, $inviteId);
 			var_dump($mailSuccessfullySend);
		}

		private function filterEmailAdress($_emailAdress) {
			// filter the email TODO
			return $_emailAdress;
		}

		private function sendMail($_emailAdress, $_inviteId) {
			$senderName = $this->Parent->get(
				$GLOBALS["App"]->userId
			)["name"];
			if (!$senderName) return false;


		    $html = "Blablabla here's your <a href='https://localhost/git/todo/invite?id=" . $_inviteId . "'>link</a>.";
		
			$headers =  "From: veratio@localhost" . "\r\n" . 
           				"MIME-Version: 1.0" . "\r\n" . 
			           	"Content-type: text/html; charset=UTF-8" . "\r\n";
			mail($_emailAdress, "You've been invited to " . $this->Project->title . " by " . $senderName, $_html, $headers);
			return true;
		}
	}
	
?>