import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RoomsList.css';

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

  if (loading) return <div style={{padding: '20px', textAlign: 'center'}}>טוען נתונים מהמסד...</div>;

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <h1>רשימת חדרים</h1>
      </div>
      {rooms.length === 0 ? (
        <p style={{textAlign: 'center', color: '#636e72'}}>לא נמצאו חדרים.</p>
      ) : (
        <div className="rooms-grid">
          {rooms.map(room => (
            <div key={room._id} className="room-card">
              <h3>חדר {room.roomNumber}</h3>
              <div className="room-info">
                <p><strong>אגף:</strong> {room.wing}</p>
                <p><strong>קומה:</strong> {room.floor}</p>
                <p><strong>גודל:</strong> {room.size} איש</p>
                <p><strong>סוג:</strong> {room.roomType}</p>
                <p><strong>מקרן:</strong> {room.hasProjector ? '✓ יש' : '✗ אין'}</p>
              </div>
              <button
                className="view-btn"
                onClick={() => navigate(`/roomSchedule?roomId=${room._id}`)}
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