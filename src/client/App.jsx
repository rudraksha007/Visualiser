import { useRef, useState } from "react";
import { useEffect } from "react"

function App() {
  const [mic, setMic] = useState(null);
  const [isRunning, setRunning] = useState(false);
  const [transcriber, setTranscriber] = useState(null);
  const [result, setResult] = useState("");
  const runnningRef = useRef(isRunning);
  const [ans, setAns] = useState("");

  useEffect(() => { //setup function
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => setMic(stream))
      .catch(() => setMic(null));
    const tr = new webkitSpeechRecognition();
    console.log('herere');

    tr.continuous = true;
    tr.interimResults = true;
    tr.lang = "en-US";
    tr.onresult = (event) => {
      var res = ''
      console.log(event.results);

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          res += event.results[i][0].transcript;
        }
      }
      console.log(res);
      setResult(res);
    };
    tr.onend = () => {
      // {
      //   if (isRunning) {
      //     setRunning(false);
      //     setTranscriber(null);
      //   }
      //   console.log();
      //   fetch('/prompt', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify({ transcript: result })
      //   })
      //   .then(response => response.json())
      //   .then(data => {
      //     setAns(data.answer);
      //   })
      //   .catch(error => {
      //     console.error('Error:', error);
      //   });
      // }
    };
    tr.onerror = (event) => {
      console.log(event.error);
      setRunning(false);
    }
    setTranscriber(tr);
  }, []);

  useEffect(() => {
    if (runnningRef.current !== isRunning) {
      runnningRef.current = isRunning;
    }
    if (!mic) return;
    if (!isRunning) {
      console.log(result);

      createDefaultCircle(document.getElementById("canvas"));
      return;
    }
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(mic);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const frequencyBufferLength = analyser.frequencyBinCount;
    const frequencyData = new Uint8Array(frequencyBufferLength);
    const sensitivity = 50;

    function draw() {
      if (!runnningRef.current) {
        createDefaultCircle(canvas);
        return;
      }
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

  }, [mic, isRunning, result]);

  function createDefaultCircle(canvas) {
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(centerX, centerY, 100, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }

  function toggleListening() {
    if (isRunning) {
      setRunning(false);
      transcriber.stop();
      setTranscriber(null);
    } else {
      if (!mic) return;
      setResult("");
      setupTranscriber();
      setRunning(true);
    }
  }

  function setupTranscriber() {
    const tr = new webkitSpeechRecognition();
    console.log('herere');

    tr.continuous = true;
    tr.interimResults = true;
    tr.lang = "en-US";
    tr.onresult = (event) => {
      var res = ''
      console.log(event.results);

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          res += event.results[i][0].transcript;
        }
      }
      console.log(res);
      setResult(res);
    };
    tr.onend = () => {
      // {
      //   if (isRunning) {
      //     setRunning(false);
      //     setTranscriber(null);
      //   }
      //   console.log();
      //   fetch('/prompt', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify({ transcript: result })
      //   })
      //   .then(response => response.json())
      //   .then(data => {
      //     setAns(data.answer);
      //   })
      //   .catch(error => {
      //     console.error('Error:', error);
      //   });
      // }
    };
    tr.onerror = (event) => {
      console.log(event.error);
      setRunning(false);
    }
    setTranscriber(tr);
  }
  return (
    <div className="w-screen h-screen bg-slate-900 relative">
      <img src="/mic.svg" alt="" height={150} width={150} className="absolute top-[50%] left-[50%] -translate-[50%] cursor-pointer"
        onClick={() => toggleListening()} />
      <canvas className="w-full h-full" id="canvas">
        Your browser does not support the HTML5 canvas tag.
      </canvas>
      <p id="result" className="absolute bottom-0 left-0 w-screen text-white text-center h-[20%] overflow-y-auto">
        {result}
      </p>
      <p className="absolute top-0 left-0 w-[35%] text-white text-center h-[80%] overflow-y-auto p-10">
        { }
      </p>
    </div>
  )
}

export default App
