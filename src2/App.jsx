import { useState } from "react";
import { useEffect } from "react"


function App() {
  const [mic, setMic] = useState(null);
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => setMic(stream))
      .catch(() => setMic(null))
  }, []);
  useEffect(() => {
    if (!mic) return;


    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    async function process() {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = await audioContext.createMediaStreamSource(mic);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      recognition();
      const frequencyBufferLength = analyser.frequencyBinCount;
      const frequencyData = new Uint8Array(frequencyBufferLength);
      const sensitivity = 50;
      async function draw() {
        requestAnimationFrame(draw);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        analyser.getByteFrequencyData(frequencyData);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.fillStyle = "white";
        ctx.beginPath();

        const angleOffset = Math.PI / (frequencyBufferLength - 1);
        var offsetHeight = 0;
        var cos = 0; var x = 0;
        var sin = 0; var y = 0;
        for (let i = 0; i < frequencyBufferLength; i++) {
          offsetHeight = frequencyData[i] * 200 / 255;
          cos = Math.cos(i * angleOffset);
          sin = Math.sin(i * angleOffset);
          x = centerX + cos * 110 + cos * offsetHeight;
          y = centerY + sin * 110 + sin * offsetHeight;
          ctx.lineTo(x, y);
        }
        for (let i = 0; i < frequencyBufferLength; i++) {
          offsetHeight = frequencyData[i] * sensitivity / 255;
          cos = Math.cos(-i * angleOffset);
          sin = Math.sin(-i * angleOffset);
          x = centerX + cos * 110 + cos * offsetHeight;
          y = centerY + sin * 110 + sin * offsetHeight;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
      draw();
    }
    process();
  }, [mic]);
  async function recognition(){
    const speechRecon = new SpeechRecognition();
    speechRecon.continuous = true;
    speechRecon.interimResults = true;
    speechRecon.lang = 'en-US';
    console.log(speechRecon);
    
    speechRecon.onResult((e) => {
      const transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      console.log(transcript);
    });
  }
  return (
    <div className="w-screen h-screen bg-slate-900 relative">
      <img src="/mic.svg" alt="" height={200} width={200} className="absolute top-[50%] left-[50%] -translate-[50%]" />
      <canvas className="w-full h-full" id="canvas">
        Your browser does not support the HTML5 canvas tag.
      </canvas>
    </div>
  )
}

export default App
