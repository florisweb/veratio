<?php
	require_once __DIR__ . '/Error.php';
	require_once __DIR__ . '/types.php';
	require_once __DIR__ . '/typeComponent.php';


	class TagComponent extends TypeComponent {
		protected $Type = 'tags';


		public function remove($_id) {
			if (!$this->Project->curUser) return E_ACTION_NOT_ALLOWED;
			$permissions = $this->Project->curUser->permissions;
			if ($permissions < 1) return E_ACTION_NOT_ALLOWED;
			return parent::remove($_id);
		}

	
		public function update($_newTag) {
			if (!$this->Project->curUser) return E_ACTION_NOT_ALLOWED;
			$permissions = $this->Project->curUser->permissions;
			if ($permissions < 1) return E_ACTION_NOT_ALLOWED;

			$newTag = new Tag(arrayToObject($_newTag));
			if (!$newTag || $newTag->Error) return E_INVALID_PARAMETERS;
			return parent::update($newTag);
		}
		
	}
?>