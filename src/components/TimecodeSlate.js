import React, { useState, useEffect, useRef } from 'react';
import LogTable from './LogTable';
import '../styles.css';

const TimecodeSlate = () => {
  const [frameRate, setFrameRate] = useState(24);
  const [scene, setScene] = useState('1');
  const [slate, setSlate] = useState('1');
  const [take, setTake] = useState(1);
  const [timecode, setTimecode] = useState('00:00:00:00');
  const [isMuted, setIsMuted] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('slate');
  const [editingIndex, setEditingIndex] = useState(null);
  const startTime = useRef(Date.now());
  const audioContext = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const oscillator = useRef(null);
  const lastTime = useRef('00:00:00:00');
  const freezeTime = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      updateTimecode();
    }, 1000 / frameRate);
    return () => clearInterval(interval);
  }, [frameRate]);

  const updateTimecode = () => {
    if (!freezeTime.current) {
      const now = Date.now();
      const msSinceStart = now - startTime.current;
      const hours = String(Math.floor(msSinceStart / 3600000)).padStart(2, '0');
      const minutes = String(Math.floor((msSinceStart % 3600000) / 60000)).padStart(2, '0');
      const seconds = String(Math.floor((msSinceStart % 60000) / 1000)).padStart(2, '0');
      const frames = String(Math.floor((msSinceStart % 1000) / (1000 / frameRate))).padStart(2, '0');
      const newTimecode = `${hours}:${minutes}:${seconds}:${frames}`;
      lastTime.current = newTimecode;
      setTimecode(newTimecode);
    }
  };

  const handleFrameRateChange = (e) => {
    setFrameRate(parseInt(e.target.value, 10));
  };

  const handleSizeChange = (e) => {
    const newSize = parseFloat(e.target.value);
    const baseSize = 2.5;
    document.documentElement.style.setProperty('--font-size', `${baseSize * newSize}em`);
    document.documentElement.style.setProperty('--font-size-small', `${baseSize * newSize * 0.5}em`);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const startOscillator = () => {
    if (oscillator.current && oscillator.current.state === 'running') {
      oscillator.current.stop();
    }
    oscillator.current = audioContext.current.createOscillator();
    oscillator.current.type = 'sine';
    oscillator.current.frequency.setValueAtTime(1000, audioContext.current.currentTime);
    oscillator.current.connect(audioContext.current.destination);
    oscillator.current.start();
  };

  const handleSlate = () => {
    if (!isMuted) {
      startOscillator();
    }
    freezeTime.current = true;
    const timecodeElement = document.getElementById('timecode');
    if (timecodeElement) {
      timecodeElement.style.backgroundColor = '#4CAF50';
    }
    setTimeout(() => {
      freezeTime.current = false;
      if (oscillator.current) {
        oscillator.current.stop();
      }
      if (timecodeElement) {
        timecodeElement.style.backgroundColor = '#FFFFFF';
      }
      updateTimecode();
    }, 3000);
    if (editingIndex !== null) {
      updateLogEntry();
    } else {
      addLogEntry();
    }
  };

  const addLogEntry = () => {
    setLogs((prevLogs) => [
      ...prevLogs,
      { scene, slate, take, timecode: lastTime.current, frameRate },
    ]);
  };

  const updateLogEntry = () => {
    setLogs((prevLogs) =>
      prevLogs.map((log, index) =>
        index === editingIndex ? { scene, slate, take, timecode: lastTime.current, frameRate } : log
      )
    );
    setEditingIndex(null);
  };

  const handleIncrementScene = () => {
    if (scene) {
      const match = scene.match(/(\d+)([a-zA-Z]?)/);
      if (match) {
        const number = parseInt(match[1], 10);
        const letter = match[2] || '';
        if (letter) {
          setScene(number + String.fromCharCode(letter.charCodeAt(0) + 1));
        } else {
          setScene((number + 1).toString());
        }
      }
    } else {
      setScene('1');
    }
  };

  const handleDecrementScene = () => {
    if (scene) {
      const match = scene.match(/(\d+)([a-zA-Z]?)/);
      if (match) {
        const number = parseInt(match[1], 10);
        const letter = match[2] || '';
        if (letter) {
          setScene(number + String.fromCharCode(letter.charCodeAt(0) - 1));
        } else if (number > 1) {
          setScene((number - 1).toString());
        } else {
          setScene('');
        }
      }
    }
  };

  const handleIncrementSlate = () => {
    if (slate) {
      const match = slate.match(/(\d+)([a-zA-Z]?)/);
      if (match) {
        const number = parseInt(match[1], 10);
        const letter = match[2] || '';
        if (letter) {
          setSlate(number + String.fromCharCode(letter.charCodeAt(0) + 1));
        } else {
          setSlate((number + 1).toString());
        }
      }
    } else {
      setSlate('1');
    }
  };

  const handleDecrementSlate = () => {
    if (slate) {
      const match = slate.match(/(\d+)([a-zA-Z]?)/);
      if (match) {
        const number = parseInt(match[1], 10);
        const letter = match[2] || '';
        if (letter) {
          setSlate(number + String.fromCharCode(letter.charCodeAt(0) - 1));
        } else if (number > 1) {
          setSlate((number - 1).toString());
        } else {
          setSlate('');
        }
      }
    }
  };

  const handleIncrementTake = () => {
    setTake(take + 1);
  };

  const handleDecrementTake = () => {
    if (take > 1) {
      setTake(take - 1);
    }
  };

  const handleRotateView = () => {
    setRotationAngle((rotationAngle + 90) % 360);
  };

  const handleSyncTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const frames = String(Math.floor(now.getMilliseconds() / (1000 / frameRate))).padStart(2, '0');
    const newTimecode = `${hours}:${minutes}:${seconds}:${frames}`;
    setTimecode(newTimecode);
    startTime.current = now.getTime() - ((now.getHours() * 3600000) + (now.getMinutes() * 60000) + (now.getSeconds() * 1000) + now.getMilliseconds());
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setLogs([]);
      setScene('1');
      setSlate('1');
      setTake(1);
      setTimecode('00:00:00:00');
    }
  };

  const editLog = (index) => {
    const log = logs[index];
    setScene(log.scene);
    setSlate(log.slate);
    setTake(log.take);
    setFrameRate(log.frameRate);
    setEditingIndex(index);
  };

  const deleteLog = (index) => {
    if (window.confirm('Are you sure you want to delete this log? This action cannot be undone.')) {
      setLogs((prevLogs) => prevLogs.filter((_, i) => i !== index));
    }
  };

  const saveLogEntry = (index, updatedLog) => {
    setLogs((prevLogs) => prevLogs.map((log, i) => (i === index ? updatedLog : log)));
    setEditingIndex(null);
  };

  return (
    <div id="appContainer" className="container" style={{ transform: `rotate(${rotationAngle}deg)` }}>
      <div id="content">
        <div className="tab-row">
          <button onClick={() => setActiveTab('slate')} className={activeTab === 'slate' ? 'active' : ''}>Slate</button>
          <button onClick={() => setActiveTab('report')} className={activeTab === 'report' ? 'active' : ''}>Report</button>
          <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}>Settings</button>
        </div>
        {activeTab === 'slate' && (
          <div>
            <div id="timecodeContainer" onClick={handleSlate}>
              <div id="timecode">{timecode}</div>
              <table id="infoDisplay">
                <thead>
                  <tr>
                    <th>Scene</th>
                    <th>Slate</th>
                    <th>Take</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td id="sceneText">{scene}</td>
                    <td id="slateText">{slate}</td>
                    <td id="takeText">{take}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="label-row">
              <span>(tap the timecode readout to play tone and freeze the display for 3 seconds)</span>
            </div>
            <hr className="divider" />
            <div className="input-row">
              <div className="take-input-container">
                <label htmlFor="sceneInput">Scene</label>
                <button onClick={handleDecrementScene}>-</button>
                <input
                  type="text"
                  id="sceneInput"
                  placeholder="Scene"
                  value={scene}
                  onChange={(e) => setScene(e.target.value)}
                />
                <button onClick={handleIncrementScene}>+</button>
              </div>
              <div className="take-input-container">
                <label htmlFor="slateInput">Slate</label>
                <button onClick={handleDecrementSlate}>-</button>
                <input
                  type="text"
                  id="slateInput"
                  placeholder="Slate"
                  value={slate}
                  onChange={(e) => setSlate(e.target.value)}
                />
                <button onClick={handleIncrementSlate}>+</button>
              </div>
              <div className="take-input-container">
                <label htmlFor="takeInput">Take</label>
                <button onClick={handleDecrementTake}>-</button>
                <input
                  type="text"
                  id="takeInput"
                  placeholder="Take"
                  value={take}
                  readOnly
                />
                <button onClick={handleIncrementTake}>+</button>
              </div>
            </div>
            <hr className="divider" />
            <div className="explainer-section">
              <h3>About the App</h3>
              <p>This app allows you to log timecode information for scenes, slates, and takes.</p>
              <h3>Quick Tips and Tricks</h3>
              <ul>
                <li>The + and - buttons can increment and decrement both numbers and letters.</li>
                <li>Tap the timecode readout to log the current timecode.</li>
                <li>Use the SLATE button or tap the timecode readout to freeze the timecode for 3 seconds and log the entry.</li>
              </ul>
            </div>
          </div>
        )}
        {activeTab === 'report' && (
          <div>
            <LogTable logs={logs} editLog={editLog} deleteLog={deleteLog} saveLogEntry={saveLogEntry} />
            <div className="button-row">
              <button id="exportButton" onClick={() => exportLogsAsCSV(logs)}>Export as CSV</button>
              <button id="clearButton" onClick={handleClearAllData}>Clear All Data</button>
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div>
            <div id="timecodeContainer">
              <div id="timecode">{timecode}</div>
            </div>
            <div className="input-row">
              <select id="frameRate" className="half-width" value={frameRate} onChange={handleFrameRateChange}>
                <option value="24">24 FPS</option>
                <option value="25">25 FPS</option>
                <option value="30">30 FPS</option>
              </select>
              <select id="sizeSelector" className="half-width" onChange={handleSizeChange}>
                <option value="1">Default Size</option>
                <option value="2">2x Size</option>
                <option value="3">3x Size</option>
              </select>
            </div>
            <div className="button-row">
              <button id="syncButton" onClick={handleSyncTime}>Sync to Current Time</button>
              <button
                id="muteButton"
                onClick={handleMuteToggle}
                style={{ backgroundColor: isMuted ? 'red' : 'var(--primary-color)' }}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button id="rotateButton" onClick={handleRotateView}>Rotate View</button>
            </div>
          </div>
        )}
      </div>
      <footer>
        Made by <a href="https://soundrolling.com" target="_blank" rel="noopener noreferrer">Matt Price from Soundrolling.com</a>
      </footer>
    </div>
  );
};

const exportLogsAsCSV = (logs) => {
  const headers = ['Scene', 'Slate', 'Take', 'Timecode', 'Frame Rate'];
  const rows = logs.map((log) => [log.scene, log.slate, log.take, log.timecode, log.frameRate]);
  let csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'timecode_logs.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default TimecodeSlate;