<?php
	$GLOBALS["PM"]->includePacket("SESSION", "1.0");


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
					"permissions" 	=> "Int",
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
				"permissions" 	=> 0,
				"type"			=> "invite"
			);

			$messageSend = $this->sendMail($emailAdress, $inviteId);
			if (!$messageSend) return "E_unknownError";

			$newUser = $this->DTTemplate->update($user);
			if (is_string($newUser)) return $newUser;

			return true; 			
		}


		public function inviteByLink() {
			$inviteId 			= sha1(uniqid(mt_rand(), true));

			$user = array(
				"id" 			=> sha1($inviteId),
				"name"			=> "Link " . substr(sha1($inviteId), 0, 4),
				"permissions" 	=> 0,
				"type"			=> "link"
			);

			$newUser = $this->DTTemplate->update($user);
			if (is_string($newUser)) return "E_unknownError";
			return array("id" => $inviteId); 
		}

		public function joinAsMember($_originalInviteId, $_inviteUserObj) {
			$userName 	= $_inviteUserObj["name"];

			$userId 	= $this->getUserId();
			$user 		= $GLOBALS["USER"]->getById($userId);
			if (!$user) return "E_userNotFound";

			$newUser 	= array(
				"id" 			=> sha1($userId),
				"name" 			=> $user["name"],
				"permissions" 	=> $_inviteUserObj["permissions"],
				"type" 			=> "member"
			);

			$this->joinByInviteId(sha1($_originalInviteId), $newUser);
		}

		private function joinByInviteId($_inviteUser_placeholderId, $_newUser) {
			$success = $this->DTTemplate->remove($_inviteUser_placeholderId);
			if (!$success) return false;

			$userAlreadyExists = $this->DTTemplate->get($_newUser["id"]);
			if ($userAlreadyExists) return true;
			
			$success = $this->DTTemplate->update($_newUser);
			return $success;
		}

		public function bindAccount($_originalInviteId, $_inviteUserObj) {
			$this->joinAsMember($_originalInviteId, $_inviteUserObj);
			$oldId 		= $_inviteUserObj["id"];
			$newId 		= $this->getUserId();
			if (!$newId) return;
			$newId = sha1($newId);
			
			// Transfer ownership of all tasks and tags

			$this->Project->users->Self['permissions']	= 4; // Raise permissions temporarily to change the ids
			$this->Project->users->Self['id'] 			= $newId;


			$tags = $this->Project->tags->getAll();
			foreach ($tags as $tag)
			{
				if ($tag["creatorId"] != $oldId) continue;
				$tag["creatorId"] = $newId;
				$this->Project->tags->update($tag);
			}


			$tasks = $this->Project->tasks->getAll();
			foreach ($tasks as $task)
			{
				if ($task["creatorId"] != $oldId) continue;
				$task["creatorId"] = $newId;
				$this->Project->tasks->update($task);
			}

			foreach ($tasks as $task)
			{
				if (!in_array($oldId, $task["assignedTo"])) continue;
				for ($i = 0; $i < sizeof($task["assignedTo"]); $i++)
				{
					if ($task["assignedTo"][$i] != $oldId) continue;
					$task["assignedTo"][$i] = $newId;
					break;
				}

				$this->Project->tasks->update($task);
			}
		}






		private function checkIfEmailAdressAlreadyExists($_emailAdress) {
			$users = $this->Parent->getAll();
			foreach ($users as $user)
			{
				if ($user["type"] != "invite")			continue;
				if ($user["Self"]) 						continue;
				if ($user["name"] !== $_emailAdress) 	continue;
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


			$inviteLink = "https://veratio.florisweb.tk/invite?id=" . $_inviteId;
			$html = '<!DOCTYPE html><html><head><meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" name="viewport"/><link rel="shortcut icon" href="https://florisweb.tk/git/veratio/images/favicon.ico"><style>body {margin: 0;padding: 0;height: 100vh;overflow: hidden;background: linear-gradient(to bottom right, rgb(221, 157, 255), rgb(154, 191, 240));}#backgroundImage {position: fixed;left: 0;top: 0;width: 100vw;height: auto;}@media (max-aspect-ratio: 7/4) {#backgroundImage {width: auto;height: 100vh;}}#menuHolder {position: relative;margin: auto;width: calc(90vw);max-width: 480px;height: 100vh;}.inviteMenu {position: absolute;top: calc(50vh - 150px);width: calc(100% - 40px * 2);padding: 40px;background: #fff;border-radius: 3px;box-shadow: 5px 5px 15px 15px rgba(0, 0, 0, 0.01);transition: top 0.3s;}#menu_linkFound {top: calc(50vh - 200px);padding-bottom: 20px;}.text {font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif;color: #999;font-size: 15px;line-height: 25px;}.text.tHeaderLarge {font-size: 20px;color: #888;}.text.highlight {font-weight: bold;}.button {position: relative;width: auto;padding: 7px 15px;border-radius: 4px;font-size: 13px;cursor: pointer;background: rgb(140, 153, 247);color: #fff;text-align: center;}#logo { position: relative;top: 40px;left: calc(50vw - 90px / 2);width: 90px;opacity: 0.8;}</style></head><body><img src="https://florisweb.tk/git/veratio/images/sideBarBackground/backgrounds/fullScreen.jpg" id="backgroundImage"><img src="https://florisweb.tk/git/veratio/images/pressSet/banner.png" id="logo"><div id="menuHolder"><div class="inviteMenu" id="menu_linkFound"><div class="text tHeaderLarge">' . $projectTitle . '</div><br><br><div class="text">' . $senderName . ' has invited you to join <a class="text highlight">' . $projectTitle . '</a>.</div><br><br><br><div class="text" style="opacity: 0.7">By using <a class="text highlight">veratio</a> you agree to our  <a class="text highlight">terms of service</a>.</div><br><a style="text-decoration: none" href="' . $inviteLink . '"><div class="button text">Join</div></a></div></div></body></html>';
		
			$headers =  "From: veratio@florisweb.tk" . "\r\n" . 
           				"MIME-Version: 1.0" . "\r\n" . 
			           	"Content-type: text/html; charset=UTF-8" . "\r\n";
			mail($_emailAdress, "You've been invited to " . $projectTitle . " by " . $senderName . " - Veratio", $html, $headers);
			return true;
		}



		private function getUserId() {
			$userId = $GLOBALS["SESSION"]->get("userId");
			if (!$userId) die("User not signed in");

			return $userId;
		}
	}
	
?>