const input = document.getElementById('input');

//define canvas variables 
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = ctx.canvas.width;
var height = ctx.canvas.height;
var interval = null;
var counter = 0;
var x;
var y;
var reset = false;
var freq = 0;
var timepernote = 0;
var length = 0;


const waveform_selector = document.getElementById('waveform');

//create web audio api elements
const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();

//create oscillator mode 
const oscillator = audioCtx.createOscillator();
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = "sine";

oscillator.start();
gainNode.gain.value = 0;

const notes = new Map();
notes.set("C", 261.6);
notes.set("D",293.7);
notes.set("E",329.6);
notes.set("F",349.2);
notes.set("G", 392.0);
notes.set("A", 440);
notes.set("B", 493.9);

const vol_slider = document.getElementById('vol_slider');

function frequency(pitch) {
    freq = pitch / 10000;

        const newOsc = audioCtx.createOscillator();
    const waveformType = waveform_selector.value;
    newOsc.type = waveformType;
    newOsc.frequency.setValueAtTime(pitch, audioCtx.currentTime);

    const newGain = audioCtx.createGain();
    newGain.gain.setValueAtTime(vol_slider.value, audioCtx.currentTime);

    newOsc.connect(newGain);
    newGain.connect(audioCtx.destination);

    newOsc.start();
    setTimeout(() => {
        newGain.gain.setValueAtTime(0, audioCtx.currentTime);
        newOsc.stop();
    }, ((timepernote)-10));
}

function handle() {
    reset = true;
    audioCtx.resume();
    gainNode.gain.value = 0;

    var usernotes = String(input.value);
    var noteslist = [];

    length = usernotes.length;
    timepernote = (6000 / length);

    for (var i = 0; i < usernotes.length; i++) {
        noteslist.push(notes.get(usernotes.charAt(i)));
    }

    
    let j = 0

    if (noteslist.length > 0) {
        frequency((noteslist[j]));
        drawWave();
        j++;
    }

    let repeat = setInterval(() => {
        if (j <noteslist.length) {
            frequency((noteslist[j]));
            drawWave();
            j++;
        }
        else {
            clearInterval(repeat)
        }
    }, timepernote)
}

function drawWave() {
    clearInterval(interval);
    if (reset) {
        ctx.clearRect(0, 0, width, height);
        x = 0;
        y = height/2;
        ctx.moveTo(x, y); 
        ctx.beginPath()
    }
    counter = 0;
    interval = setInterval(line, 20);
    reset = false;
}

const color1 = document.getElementById('color1');
const color2 = document.getElementById('color2');

function line() {
    y = height/2 + (vol_slider.value * Math.sin(x*2*Math.PI*freq*(length*0.5)));

    const startColor = color1.value;
    const endColor = color2.value;
    const gradient = ctx.createLinearGradient(0, 0, width, 0); 

    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);

    ctx.strokeStyle = gradient;
    ctx.lineTo(x,y);
    ctx.stroke();
    x = x + 1;
    counter++;

    if (counter > (timepernote/20)) {
        clearInterval(interval);
    }
}

var blob, recorder = null;
var chunks = [];

function startRecording(){
    const canvasStream = canvas.captureStream(20);
    const audioDestination = audioCtx.createMediaStreamDestination();
    gainNode.connect(audioDestination);
    const combinedStream = new MediaStream();

    canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
    audioDestination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

    recorder = new MediaRecorder(combinedStream, {mimeType: 'video/webm' });

    recorder.ondataavailable = e => {
        if (e.data.size > 0) {
        chunks.push(e.data);
        }
    };


    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recording.webm';
        a.click();
        URL.revokeObjectURL(url);
    };

    recorder.start();
}

const recording_toggle = document.getElementById("record");
var is_recording = false;
function toggle(){
    is_recording = !is_recording;
    if(is_recording) {
        recording_toggle.innerHTML = "Stop Recording";
        startRecording();
    }
    else {
        recording_toggle.innerHTML = "Start Recording";
        recorder.stop();
    }
}