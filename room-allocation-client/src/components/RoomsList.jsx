import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/RoomsList.css";

const RoomsList = () => {
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('roomNumber'); // מצב לניהול המיון
  const navigate = useNavigate();


  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        setRooms(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching rooms:", err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        טוען נתונים מהמסד...
      </div>
    );
  // פונקציית מיון שתרוץ בכל פעם ש-sortBy משתנה או שהרשימה מתעדכנת
  const sortedRooms = [...rooms].sort((a, b) => {
    if (sortBy === 'floor' || sortBy === 'size' || sortBy === 'roomNumber') {
      return a[sortBy] - b[sortBy]; // מיון מספרי
    }
    return String(a[sortBy]).localeCompare(String(b[sortBy])); // מיון טקסטואלי (אגף/שם)
  });

  // פונקציה לניקוי כל השיבוצים 
  // const clearAllAllocations = async () => {
  //   const confirmDelete = window.confirm("האם את בטוחה שברצונך למחוק את כל השיבוצים מכל החדרים? פעולה זו אינה ניתנת לביטול.");
  //   if (confirmDelete) {
  //     try {
  //       const response = await fetch('http://localhost:5000/api/allocations/clear-all', {
  //         method: 'DELETE',
  //       });
  //       if (response.ok) {
  //         alert("כל השיבוצים נמחקו בהצלחה.");
  //         // כאן אפשר לרענן נתונים אם צריך
  //       }
  //     } catch (err) {
  //       alert("שגיאה במחיקת השיבוצים.");
  //     }
  //   }
  // };

  const handleDeleteRoom = async (id) => {
    if (window.confirm("האם את בטוחה שברצונך למחוק את החדר?")) {
      try {
        const response = await fetch(`/api/rooms/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          // עדכון הרשימה בתצוגה ללא צורך בריענון דף
          setRooms(rooms.filter(room => room._id !== id));
          alert("החדר נמחק בהצלחה.");
        } else {
          alert("שגיאה במחיקת החדר.");
        }
      } catch (err) {
        console.error("Delete error:", err);
        alert("שגיאה בחיבור לשרת.");
      }
    }
  };

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <h1>רשימת חדרים</h1>
      </div>

      {/* שורת אפשרויות: מיון וניקוי */}
      <div className="rooms-filter-container">
        <div className="sort-wrapper">
          <label htmlFor="sort-select">מיין לפי:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="roomNumber">מספר חדר</option>
            <option value="floor">קומה</option>
            <option value="wing">אגף</option>
            <option value="size">גודל/קיבולת</option>
          </select>
        </div>

        {/* אם תחליטי להחזיר את כפתור ניקוי השיבוצים, הוא יישב כאן בצד שמאל */}
      </div>
      {rooms.length === 0 ? (
        <p style={{ textAlign: "center", color: "#636e72" }}>לא נמצאו חדרים.</p>
      ) : (
        <div className="rooms-grid">
          {sortedRooms.map((room) => (
            <div key={room._id} className="room-card">
              <h3>חדר {room.roomNumber}</h3>
              <div className="room-info">
                <p>
                  <strong>אגף:</strong> {room.wing}
                </p>
                <p>
                  <strong>קומה:</strong> {room.floor}
                </p>
                <p>
                  <strong>גודל:</strong> {room.size} איש
                </p>
                <p>
                  <strong>סוג:</strong> {room.roomType}
                </p>
                <p>
                  <strong>מקרן:</strong> {room.hasProjector ? "✓ יש" : "✗ אין"}
                </p>
              </div>
              <div className="room-actions">
                {/* כפתור המערכת - הגדול */}
                <button
                  className="view-btn"
                  onClick={() => navigate(`/roomSchedule?roomId=${room._id}`)}
                >
                  צפה במערכת שעות
                </button>

                {/* כפתור עריכה - הקטן הלבן */}
                <button
                  className="edit-btn"
                  onClick={() => navigate(`editRoom/${room._id}`)}
                >
                  ערוך
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteRoom(room._id)}
                >
                  מחק
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomsList;
