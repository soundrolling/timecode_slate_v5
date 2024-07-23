import React, { useState } from 'react';

const LogTable = ({ logs, saveLogEntry, deleteLog }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editScene, setEditScene] = useState('');
  const [editSlate, setEditSlate] = useState('');
  const [editTake, setEditTake] = useState('');
  const [editTimecode, setEditTimecode] = useState('');
  const [editFrameRate, setEditFrameRate] = useState('');

  const startEditing = (index) => {
    const log = logs[index];
    setEditingIndex(index);
    setEditScene(log.scene);
    setEditSlate(log.slate);
    setEditTake(log.take);
    setEditTimecode(log.timecode);
    setEditFrameRate(log.frameRate);
  };

  const handleSave = (index) => {
    const updatedLog = {
      scene: editScene,
      slate: editSlate,
      take: editTake,
      timecode: editTimecode,
      frameRate: editFrameRate,
    };
    saveLogEntry(index, updatedLog);
    setEditingIndex(null);
  };

  return (
    <table id="logTable">
      <thead>
        <tr>
          <th>Scene</th>
          <th>Slate</th>
          <th>Take</th>
          <th>Timecode</th>
          <th>Frame Rate</th>
          <th>Edit</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log, index) => (
          <tr key={index}>
            {editingIndex === index ? (
              <>
                <td><input type="text" value={editScene} onChange={(e) => setEditScene(e.target.value)} /></td>
                <td><input type="text" value={editSlate} onChange={(e) => setEditSlate(e.target.value)} /></td>
                <td><input type="text" value={editTake} onChange={(e) => setEditTake(e.target.value)} /></td>
                <td><input type="text" value={editTimecode} onChange={(e) => setEditTimecode(e.target.value)} /></td>
                <td><input type="text" value={editFrameRate} onChange={(e) => setEditFrameRate(e.target.value)} /></td>
                <td><button onClick={() => handleSave(index)}>Save</button></td>
                <td><button onClick={() => setEditingIndex(null)}>Cancel</button></td>
              </>
            ) : (
              <>
                <td>{log.scene}</td>
                <td>{log.slate}</td>
                <td>{log.take}</td>
                <td>{log.timecode}</td>
                <td>{log.frameRate}</td>
                <td><button onClick={() => startEditing(index)}>Edit</button></td>
                <td><button onClick={() => deleteLog(index)}>Delete</button></td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LogTable;