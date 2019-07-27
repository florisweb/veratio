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
			$inviteId 			= sha1(uniqid(mt_rand(), true));
			$emailAdress 		= $this->filterEmailAdress($_emailAdress);
			if (!$emailAdress) 	return "E_invalidEmail";
			$emailExists 		= $this->checkIfEmailAdressAlreadyExists($emailAdress);
			if ($emailExists) 	return "E_emailAlreadyInvited";

			$user = array(
				"id" 			=> sha1($inviteId),
				"name"			=> $emailAdress,
				"permissions" 	=> '["0", "00", "00", 0]',
				"type"			=> "invite"
			);

			$messageSend = $this->sendMail($emailAdress, $inviteId);
			if (!$messageSend) return false;

			$newUser = $this->DTTemplate->update($user);
			if (is_string($newUser)) return $newUser;

			return true; 			
		}

		public function joinAsLink($_inviteId, $_inviteUserObj) {
			$userName 	= $_inviteUserObj["name"];
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
			if (!$senderName) $senderName = "A nameless user";

			$projectTitle 	= htmlspecialchars($this->Project->title);
			$senderName 	= htmlspecialchars($senderName);


			$inviteLink = "https://florisweb.tk/git/todo/invite?id=" . $_inviteId;
		    $html = '<!DOCTYPE html><html><head><meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" name="viewport"/><style>body{margin:0;padding:0;height:100vh;overflow:hidden;background:linear-gradient(to bottom right, rgb(221, 157, 255), rgb(154, 191, 240))}#backgroundImage{position:fixed;left:0;top:0;width:100vw;height:auto;animation:backgroundImage_popIn 1s 1;animation-delay:0s;animation-fill-mode:forwards;animation:backgroundImage_passive 5s 10000}@media (max-aspect-ratio: 7/4){#backgroundImage{width:auto;height:100vh}}@keyframes backgroundImage_popIn{0%{opacity:0}100%{opacity:1;transform:scale(1.1)}}@keyframes backgroundImage_passive{0%{opacity:0.5}50%{opacity:1;transform:scale(1.05)}100%{opacity:0.5}}#menuHolder{position:relative;margin:auto;width:calc(90vw);max-width:480px;height:100vh}.inviteMenu{position:absolute;top:calc(50vh - 150px);width:calc(100% - 40px * 2);padding:40px;background:#fff;border-radius:3px;box-shadow:5px 5px 15px 15px rgba(0, 0, 0, 0.01);transition:top 0.3s;animation:inviteMenu_popIn 0.7s 1;animation-delay:0.1s;animation-fill-mode:forwards;transform:scale(0);opacity:0;margin-top:20vh}@keyframes inviteMenu_popIn{0%{transform:scale(0);opacity:0;margin-top:20vh}100%{margin-top:0;opacity:1;transform:scale(1)}}#menu_linkFound{top:calc(50vh - 200px);padding-bottom:20px}.text{font-family:"Lucida Sans Unicode", "Lucida Grande", sans-serif;color:#999;font-size:15px;line-height:25px}.text.tHeaderLarge{font-size:20px;color:#888}.text.highlight{font-weight:bold}.button{position:relative;width:auto;padding:7px 15px;border-radius:4px;font-size:13px;cursor:pointer;background:rgb(140, 153, 247);color:#fff;text-align:center}</style></head>	<body><img src="https://florisweb.tk/git/todo/images/sideBarBackground/backgrounds/fullScreen.jpg" id="backgroundImage"><div id="menuHolder"><div class="inviteMenu" id="menu_linkFound"><div class="text tHeaderLarge">' . $projectTitle . '</div><br><br><div class="text">' . $senderName . ' has invited you to join their veratio project <a class="text highlight">' . $projectTitle . '</a>.</div><br><br><br><a href="' . $inviteLink . '" style="text-decoration: none"><div class="button text">Join</div></a></div></div></body></html>';
		
			$headers =  "From: veratio@florisweb.tk" . "\r\n" . 
           				"MIME-Version: 1.0" . "\r\n" . 
			           	"Content-type: text/html; charset=UTF-8" . "\r\n";
			mail($_emailAdress, "You've been invited to " . $projectTitle . " by " . $senderName . " - veratio", $html, $headers);
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