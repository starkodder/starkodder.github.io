var player = document.getElementById("audioPlayer");
var inputFile = document.getElementById("inputFile");
var progress = document.getElementById("progressBar");
progress.style.display = "none";

var pts = [];

var analyser;
var audioCtx = new (window.AudioContext || window.webkitAudioContext);

analyser = audioCtx.createAnalyser();
analyser.fftSize = 256 * 64;
analyser.smoothingTimeConstant = 0.1;

var source = audioCtx.createMediaElementSource(player);

source.connect(analyser);
// analyser.connect(audioCtx.destination);

streamData = new Uint8Array(128 * 64);

var shakeThreshold = 7000;
var shakeDelay = 1000;
var lastShakeTime = new Date().getTime();

var totalVol;

var startTime;

var lastCalledTime = new Date().getTime();

var iterations = 0;

function sampleAudioStream() {
	if (player.paused) {
		generateProject();
		return;
	}

	var val = player.currentTime * 100 / player.duration;
	if(isFinite(val)) progress.value = val;

	var timeNow = new Date().getTime();
	var delta = timeNow - lastCalledTime;
	lastCalledTime = timeNow;

	analyser.getByteFrequencyData(streamData);
	totalVol = 0;
	for (var i = 0; i < 80; i++) {
		totalVol += Math.pow(streamData[i], 2.72) / 20000;
	}

	var frame = Math.floor((timeNow - startTime) / 100); // 10 fps

	for (var i = 0; i < 80; i++) {
		var data = Math.pow(streamData[i], 2.72) / 20000;
		if (data < 100)
			data = 100;

		data = data * (180) / 250;
		pts[frame * 80 + i] = data;
	}
	iterations++;
	setTimeout(sampleAudioStream, 10);
};
function download(filename, text){
  var element = document.createElement('a');
  element.style.display = "none";
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function startGen() {
	document.getElementById("status").innerText = "Getting data...";
	pts = [];
	player.play();
	progress.style.display = "block";
	inputFile.style.display = "none";
	iterations = 0;
	startTime = new Date().getTime();
	sampleAudioStream();
}

var _debug;
function generateProject() {
	progress.style.display = "none";
	inputFile.style.display = "block";
	document.getElementById("status").innerText = "Downloading template...";
  download('audiO.txt', pts.join('\n'));
}

inputFile.onchange = function() {
	var files = this.files;
	var file = URL.createObjectURL(files[0]);
	player.src = file;
	startGen();
};
