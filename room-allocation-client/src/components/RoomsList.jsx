import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RoomsList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/rooms')
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
              <h3>חדר: {room.roomNumber}</h3>
              <p>אגף: {room.wing}</p>
              <p>קומה: {room.floor}</p>
              <p>גודל: {room.size} איש</p>
              <p>סוג: {room.roomType}</p>
              <p>מקרן: {room.hasProjector ? 'יש' : 'אין'}</p>
              <button
                onClick={() => navigate(`/roomSchedule?roomId=${room._id}`)}
                style={{
                  marginTop: '10px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                צפה במערכת שעות
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default RoomsList;