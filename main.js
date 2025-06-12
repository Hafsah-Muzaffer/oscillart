const input = document.getElementById('input');

//define canvas variables 
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = ctx.canvas.width;
var height = ctx.canvas.height;
var amplitude = 40;
var interval = null;
var counter = 0;
var x;
var y;

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

notes = new Map();
notes.set("C", 261.6);
notes.set("D",293.7);
notes.set("E",329.6);
notes.set("F",349.2);
notes.set("G", 392.0);
notes.set("A", 440);
notes.set("B", 493.9);

function frequency(pitch) {
    freq = pitch / 10000;
    gainNode.gain.setValueAtTime(10, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 1);
}

function handle() {
    audioCtx.resume();
    gainNode.gain.value = 0;

    var usernotes = String(input.value);
    frequency(notes.get(usernotes));
    drawWave();
}

function drawWave() {
    ctx.clearRect(0, 0, width, height);
    x = 0;
    y = height/2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    counter = 0;
    interval = setInterval(line, 20);
}


function line() {
    y = height/2 + (amplitude * Math.sin(x*2*Math.PI*freq));
    ctx.lineTo(x,y);
    ctx.stroke();
    x = x + 1;
    counter++;

    if (counter > 50) {
        clearInterval(interval);
    }
}


