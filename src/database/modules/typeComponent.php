<?php
	require_once __DIR__ . '/databaseHelper.php';


	class TypeComponent {
		protected $Project;
		public function __construct($_project) {
			$this->Project = $_project;
		}


		private function createTypeObject($_params) {
			switch ($this->Type)
			{
				case "tasks": 	return new Task($_params);
				case "tags": 	return new Tag($_params);
				case "users": 	return new User($_params);
			}
			return false;
		}

		public function getAll() {
			$data = $this->readData();
			$actualData = [];
			foreach ($data as $dataPoint)
			{
				$obj = $this->createTypeObject(arrayToObject($dataPoint));
				if ($obj->Error)
				{
					var_dump("An error accured, while typeSetting in " . $this->Type . ': ', $obj->Error, $obj);
					continue;
				}
				array_push($actualData, $obj);
			}
			return $actualData;
		}


		private function writeData(array $_data) { // Data in raw (non typed) way
			if (!$this->Project) return false;
			return $GLOBALS['DBHelper']->writeProjectDataToColumn(
				$this->Project->id,
				$this->Type, 
				(string)json_encode($_data)
			);
		}
		private function readData() { // returns array in raw (non typed) way
			if (!$this->Project) return false;
			return $GLOBALS['DBHelper']->readProjectDataToColumn(
				$this->Project->id,
				$this->Type, 
			);
		}







		public function get(string $_id) {
			$data = $this->getAll();

			for ($i = 0; $i < sizeof($data); $i++)
			{
				$curItem = $data[$i];
				if ($curItem->id != $_id) continue;
				return $curItem;
			}
			return false;
		}



		public function remove(string $_id) {
			$rawData = $this->readData();

			for ($i = 0; $i < sizeof($rawData); $i++)
			{
				if ($rawData[$i]['id'] != $_id) continue;
				array_splice($rawData, $i, 1);
				return $this->writeData($rawData);
			}

			return false;
		}



		public function update($_newItem) {
			$oldItem = $this->get($_newItem->id);

			if ($oldItem) return $this->_updateDataItem($_newItem);
			return $this->_createDataItem($_newItem);
		}

			public function _updateDataItem($_newItem) {
				$rawData = $this->readData();
				for ($i = 0; $i < sizeof($rawData); $i++)
				{
					if ($rawData[$i]['id'] != $_newItem->id) continue;
					$rawData[$i] = $_newItem->toArray();
					$result = $this->writeData($rawData);
					if (!$result) return E_INTERNAL;
					return $_newItem;
				}
				return false;
			}

			public function _createDataItem($_newItem) {
				$rawData = $this->readData();			
				array_push($rawData, $_newItem->toArray());
				$result = $this->writeData($rawData);
				if (!$result) return E_INTERNAL;
				return $_newItem;
			}

	}
?>