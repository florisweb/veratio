<?php
	$GLOBALS["PM"]->includePacket("SESSION", "1.0");

	// backwards compatability
	$sessionName = session_name("user");
	session_set_cookie_params(60 * 60 * 24 * 365.25, '/', '.florisweb.tk', TRUE, FALSE);
	session_start();


	class _project_user_inviteComponent {
		private $Parent;
		private $Project;
		private $DTTemplate;


	
		public function __construct($_parent, $_project) {
			$this->Parent = $_parent;
			$this->Project = $_project;
			$this->DTTemplate = new _project_dataTypeTemplate(
				(string)$_project->id, 
				array("users" => [
					"id" 			=> "String",
					"name" 			=> "String",
					"permissions" 	=> "String",
					"isOwner" 		=> "Boolean",
					"type"			=> "String",
				]
			));
		}

		public function inviteByEmail($_emailAdress) {
			$inviteId = sha1(uniqid(mt_rand(), true));
			$emailAdress = $this->filterEmailAdress($_emailAdress);
			$emailExists = $this->checkIfEmailAdressAlreadyExists($emailAdress);
			if ($emailExists) 	return "E_emailAlreadyInvited";
			if (!$emailAdress) 	return "E_invalidEmail";

			$user = array(
				"id" 			=> $inviteId,
				"name"			=> $emailAdress,
				"permissions" 	=> "", // will be autoset to the minimum
				"type"			=> "invite"
			);

			$messageSend = $this->sendMail($emailAdress, $inviteId);
			if (!$messageSend) return false;

			$newUser = $this->Parent->update($user);
			if (is_string($newUser)) return $newUser;

			return true; 			
		}

		public function joinAsLink($_inviteId, $_inviteUserObj) {
			$userName 	= "LINK: " . $_inviteUserObj["name"];
			$linkId 	= $this->createLinkId($_inviteId);
			$newUser 	= array(
				"id" 			=> $linkId,
				"name" 			=> $userName,
				"permissions" 	=> $_inviteUserObj["permissions"],
				"type" 			=> "link"
			);

			$this->joinByInviteId($_inviteId, $newUser);
		}

		public function joinAsMember($_inviteId, $_inviteUserObj) {
			$userName 	= $_inviteUserObj["name"];
			$userId 	= $this->getUserId($_inviteId);
			$newUser 	= array(
				"id" 			=> sha1($userId),
				"name" 			=> $userName,
				"permissions" 	=> $_inviteUserObj["permissions"],
				"type" 			=> "member"
			);

			$this->joinByInviteId($_inviteId, $newUser);
			
		}


		private function joinByInviteId($_inviteId, $_newUser) {
			$success = $this->DTTemplate->remove($_inviteId);
			if (!$success) return false;

			$userAlreadyExists = $this->DTTemplate->get($_newUser["id"]);
			if ($userAlreadyExists) return true;
			
			$success = $this->DTTemplate->update($_newUser);
			return $success;
		}



		private function checkIfEmailAdressAlreadyExists($_emailAdress) {
			$users = $this->Parent->getAll();
			foreach ($users as $user)
			{
				if ($user["type"] != "invite") continue;
				if ($user["Self"]) continue;
				if ($user["name"] !== $_emailAdress) continue;
				return true;
			}
			return false;
		}

		private function filterEmailAdress($_emailAdress) {
			$parts = explode("@", $_emailAdress);
			if (sizeof($parts) < 2) 					return false;
			if (sizeof(explode(".", $parts[1])) < 2) 	return false;

			return preg_replace("/[^0-9,^a-z,^A-Z,.,@,,]/", "", $_emailAdress);;
		}

		private function sendMail($_emailAdress, $_inviteId) {
			$senderName = $this->Parent->get(
				$GLOBALS["App"]->userId
			)["name"];
			if (!is_string($senderName)) return false;

			$inviteLink = "https://florisweb.tk/git/todo/invite?id=" . $_inviteId;
		    $html = "<html><head></head><body style='background-color: #eee; text-align: center'>Hey there $inviteLink</body></html>";
		
			$headers =  "From: veratio@florisweb.tk" . "\r\n" . 
           				"MIME-Version: 1.0" . "\r\n" . 
			           	"Content-type: text/html; charset=UTF-8" . "\r\n";
			mail($_emailAdress, "You've been invited to " . $this->Project->title . " by " . $senderName, $html, $headers);
			return true;
		}



		private function getUserId($_inviteLink) {
			$userId = $GLOBALS["SESSION"]->get("userId");
			if (!$userId)
			{
				$userId = $_SESSION["userId"];
			}

			if (!$userId) 
			{
				$redirectLink = urlencode("/git/todo/invite/join.php?type=signedIn&link=" . $_inviteLink);
				header("Location: /user/login.php?redirect=" . $redirectLink);
				die("User not signed in");
			}

			return $userId;
		}

		private function createLinkId($_inviteLink) {
			return "LINKUSER_" . sha1($_inviteLink);;
		}
	}
	
?>