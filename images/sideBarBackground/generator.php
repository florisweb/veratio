<!DOCTYPE html>
<html>
	<head>
		<title></title>
		<style>
			canvas {
				float: left;
				padding: 0;
				margin: 0;
				/*width: 100vw;*/
				height: auto.
			}
			body {
				padding: 0;
				margin: 0;
				/*background: black;*/
			}
		</style>
	</head>
	<body>
		
		<a id="dl" download="Canvas.png" href="#">Download Canvas</a>
		<script>


			//				"rgba(64, 96, 159, 0.5)",
			// let Colors = [
			// 	"rgba(200, 110, 250, 0.5)",
			// 	"rgba(100, 110, 247, 0.5)",
			// 	"rgba(10, 174, 200, 0.5)"
			// ];
			// "rgba(64, 96, 159, 0.2)"
			let Colors = [
				"rgba(225, 166, 255, 1)",
				"rgba(180, 175, 255, 1)",
				"rgba(128, 204, 228, 1)"
			];

			let canvas = createCanvasBackground(Colors, 1400, 800, 15);
			document.body.append(canvas);



			function downloadCanvas() {
			  var dt = canvas.toDataURL('image/png');
			  /* Change MIME type to trick the browser to downlaod the file instead of displaying it */
			  dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');

			  /* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
			  dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');

			  this.href = dt;
			};
			document.getElementById("dl").addEventListener('click', downloadCanvas, false);










			function createCanvasBackground(colors, width, height, _totalPoints, _minPointY = 0) {
				let canvas = document.createElement("canvas");
				let ctx = canvas.getContext("2d");

				canvas.width = width;
				canvas.height = height;
				
				// drawBackgroundGradient(colors);

				for (let i = 0; i < 5; i++)
				{
					let scaleFactor = canvas.height / 220;
					let cSharp = i * 5 + 10;
					let cStart = 190 - i * 10;

					let colour = colors[Math.floor(Math.random() * colors.length)];
					colour = stringToColour(colour);
					colour = colourToString(mergeColours(colour, {r: 64, g: 96, b: 159}, 0.4));

					drawHorizontaleLine(cSharp * scaleFactor, cStart * scaleFactor , colour, _totalPoints);
				}
				

				function drawHorizontaleLine(_sharpness, _startAt, _color, _totalPoints) {
					ctx.globalAlpha = 0.2;
					ctx.strokeStyle = _color;
					ctx.fillStyle = _color;


					let points = [];
					let maxYDifference = _sharpness;//10%
					ctx.beginPath();
					ctx.moveTo(0, 100);
					for (let i = 0; i < _totalPoints; i++)
					{
						let x = canvas.width / (_totalPoints - 1) * i;
						let prevY = _startAt;
						if (points[i - 1]) prevY = points[i - 1].y;
						let y = (maxYDifference * 2 * Math.random() - maxYDifference) + prevY;
						if (y < _minPointY) y = _minPointY;


						points.push({x: x, y: y});
						ctx.lineTo(x, y);
					}

					ctx.lineTo(canvas.width, canvas.height);
					ctx.lineTo(0, canvas.height);

					ctx.closePath();
					ctx.stroke();
					ctx.fill();
				}

				function drawBackgroundGradient(_colors) {
					let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
					for (let i = 0; i < _colors.length; i++)
					{
						gradient.addColorStop(i / (_colors.length - 1), _colors[i]);
					}
					ctx.fillStyle = gradient;
					ctx.fillRect(0, 0, canvas.width, canvas.height);
				}


				return canvas;
			}
			







			function mergeColours(_colourA, _colourB, _colourAPerc = 0.5) {
			  colorBPerc = 1 - _colourAPerc;
			  if (Object.keys(_colourA).length < 3 && Object.keys(_colourB).length < 3) return {r: 255, g: 255, b: 255};
			  if (Object.keys(_colourA).length < 3) return _colourB;
			  if (Object.keys(_colourB).length < 3) return _colourA;
			  
			  let obj = {
			    r: _colourA.r * _colourAPerc + _colourB.r * colorBPerc,
			    g: _colourA.g * _colourAPerc + _colourB.g * colorBPerc,
			    b: _colourA.b * _colourAPerc + _colourB.b * colorBPerc
			  }
			  if (_colourA.a && _colourB.a) obj.a = _colourA.a * _colourAPerc + _colourB.a * colorBPerc;
			  return obj;
			}

			function colourToString(_colour) {
			  if (!_colour || typeof _colour.r !== "number" || typeof _colour.g !== "number" || typeof _colour.b !== "number") return false;
			  let color = "rgb(" + parseInt(_colour.r) + ", " + parseInt(_colour.g) + ", " + parseInt(_colour.b) + ")";
			  if (_colour.a) color = "rgba(" + parseInt(_colour.r) + ", " + parseInt(_colour.g) + ", " + parseInt(_colour.b) + ", " + _colour.a + ")";
			  return color;
			}

			function stringToColour(_str) {
			  if (!_str || typeof _str !== "string") return false;
			  if (_str.substr(0, 1) == "#") return hexToRgb(_str)
			 
			  let prefix = _str.split("rgba(");
			  if (prefix.length < 2) prefix = _str.split("rgb(");
			  let colors = prefix[1].substr(0, prefix[1].length - 1).split(",");

			  return {
			    r: parseFloat(colors[0]),
			    g: parseFloat(colors[1]),
			    b: parseFloat(colors[2]),
			    a: colors[3] ? parseFloat(colors[3]) : 1
			  }
			}











		</script>

	</body>
</html>