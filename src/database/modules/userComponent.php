<?php
	require_once __DIR__ . '/Error.php';
	require_once __DIR__ . '/types.php';
	require_once __DIR__ . '/typeComponent.php';


	class UserComponent extends TypeComponent {
		protected $Type = 'users';
		
		public function getAll() {
			$users = parent::getAll();
			if (!is_array($users)) return $users;
			if (!$this->Project->curUser) return $users;

			for ($i = 0; $i < sizeof($users); $i++)
			{
				if ($users[$i]->id != $this->Project->curUser->id) continue;
				$users[$i]->self = true;
				break; // There's only one self anyway, so might as well optimise it a bit
			}
			return $users;
		}


		public function remove($_id) {
			if (!$this->Project->curUser) return E_ACTION_NOT_ALLOWED;
			$permissions = $this->Project->curUser->permissions;
			if ($permissions < 2) return E_ACTION_NOT_ALLOWED;

			$user = $this->get($_id);
			if (!$user) return E_INVALID_PARAMETERS;
			if ($user->permissions > $permissions && $user->id !== $this->Project->curUser->id) return E_ACTION_NOT_ALLOWED;
			return parent::remove($_id);
		}
	


		public function update($_newUser) {
			$newUser = new User(arrayToObject($_newUser));
			if (!$newUser || $newUser->Error) return E_INVALID_PARAMETERS;
			$permissions = $this->Project->curUser->permissions;
			if ($permissions < 2) return E_ACTION_NOT_ALLOWED;  // not allowed to update users anyway
			
			$oldUser = $this->get($newUser->id);
			$oldUserPermissions = 0;
			if ($oldUser) $oldUserPermissions = $oldUser->permissions;

			if ($permissions < $oldUserPermissions) return E_ACTION_NOT_ALLOWED;  // don't downgrade someone superior
			if ($permissions < $newUser->permissions) $newUser->permissions = $permissions; // You can only give as much permissions as you have

			if ($oldUser) $newUser->type = $oldUser->type;
			return parent::update($newUser);
		}
	}
?>