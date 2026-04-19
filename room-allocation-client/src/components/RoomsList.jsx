import React, { useState, useEffect } from 'react';

const RoomsList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/rooms')
      .then(res => res.json())
      .then(data => {
        setRooms(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching rooms:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>טוען נתונים מהמסד...</div>;

  return (
    <div style={{ direction: 'rtl', padding: '20px' }}>
      <h1>רשימת חדרים מהמסד</h1>
      {rooms.length === 0 ? <p>לא נמצאו חדרים.</p> : (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {rooms.map(room => (
            <div key={room._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', width: '200px' }}>
              <h3>אגף: {room.wing}</h3>
              <p>קומה: {room.floor}</p>
              <p>גודל: {room.size}</p>
              <p>מקרן: {room.hasProjector ? 'יש' : 'אין'}</p>
              <p>סטטוס: <strong>{room.status}</strong></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomsList;