import React, { useState } from "react";
import { addAssignment } from "../services/allocationService";
import { searchRooms } from "../services/roomService";
import '../styles/AddAssignment.css'

const AddAssignment = () => {
  const [filters, setFilters] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    isTemporary: false,
    startDate: "",
    endDate: "",
    requesterName: ""
  });

  const [rooms, setRooms] = useState([]);

  const buildSearchParams = (filters) => {
    const today = new Date();

    const start = new Date(today);
    start.setHours(filters.startTime.split(":")[0]);
    start.setMinutes(filters.startTime.split(":")[1]);

    const end = new Date(today);
    end.setHours(filters.endTime.split(":")[0]);
    end.setMinutes(filters.endTime.split(":")[1]);

    return {
      searchStart: start.toISOString(),
      searchEnd: end.toISOString(),
      dayOfWeek: Number(filters.dayOfWeek) // 🔥 להוסיף את זה
    };
  };

  const handleSearch = async () => {
    if (!filters.dayOfWeek || !filters.startTime || !filters.endTime) {
      alert("יש למלא יום ושעות");
      return;
    }
    try {
      const params = buildSearchParams(filters);
      const data = await searchRooms(params);
      setRooms(data);
    } catch (err) {
      console.log(err);
    }
  };
  
  const handleAddAssignment = async (roomId) => {
    try {
      if (!filters.requesterName) {
        alert("יש להזין שם מבקש");
        return;
      }
  
      const payload = {
        roomId,
        requesterName: filters.requesterName,
        kind: filters.isTemporary ? "temporary" : "permanent",
        dayOfWeek: Number(filters.dayOfWeek),
        startTime: filters.startTime,
        endTime: filters.endTime,
      };
  
      if (filters.isTemporary) {
        if (!filters.startDate || !filters.endDate) {
          alert("יש לבחור תאריכים לשיבוץ זמני");
          return;
        }
  
        payload.startDate = filters.startDate;
        payload.endDate = filters.endDate;
      }
  
      await addAssignment(payload);
  
      alert("השיבוץ נוסף בהצלחה ✅");
  
      // 🔥 זה הכי חשוב
      await handleSearch();
  
    } catch (err) {
      alert(err.message || "שגיאה");
    }
  };

  return (
    <div className="add-assignment-container">
    <h2 className="title">🔍 חיפוש חדרים</h2>
  
    <div className="form-section">
  
      {/* שם מבקש */}
      <input
        className="input"
        placeholder="שם המבקש"
        value={filters.requesterName}
        onChange={(e) =>
          setFilters({ ...filters, requesterName: e.target.value })
        }
      />
  
      {/* סוג שיבוץ */}
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={filters.isTemporary}
          onChange={(e) =>
            setFilters({ ...filters, isTemporary: e.target.checked })
          }
        />
        שיבוץ זמני
      </label>
  
      {/* יום */}
      <select
        className="input"
        value={filters.dayOfWeek}
        onChange={(e) =>
          setFilters({ ...filters, dayOfWeek: e.target.value })
        }
      >
        <option value="">בחר יום</option>
        <option value="0">ראשון</option>
        <option value="1">שני</option>
        <option value="2">שלישי</option>
        <option value="3">רביעי</option>
        <option value="4">חמישי</option>
        <option value="5">שישי</option>
        <option value="6">שבת</option>
      </select>
  
      {/* שעות */}
      <div className="time-row">
        <input
          className="input"
          type="time"
          onChange={(e) =>
            setFilters({ ...filters, startTime: e.target.value })
          }
        />
  
        <input
          className="input"
          type="time"
          onChange={(e) =>
            setFilters({ ...filters, endTime: e.target.value })
          }
        />
      </div>
  
      {/* 🔥 תאריכים רק אם זמני */}
      {filters.isTemporary && (
        <div className="date-row">
          <input
            className="input"
            type="date"
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />
  
          <input
            className="input"
            type="date"
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
        </div>
      )}
  
      <button className="search-btn" onClick={handleSearch}>
        חפש חדרים
      </button>
    </div>
  
    <hr />
  
    {/* תוצאות */}
    {rooms.length === 0 ? (
      <p className="no-results">לא נמצאו חדרים</p>
    ) : (
      <div className="rooms-grid">
        {rooms.map((room) => (
          <div key={room._id} className="room-card">
            <h3>חדר {room.roomNumber}</h3>
            <p>קומה: {room.floor}</p>
            <p>גודל: {room.size}</p>
  
            {/* 🔥 כפתור אחד */}
            <button
              className="assign-btn"
              onClick={() => handleAddAssignment(room._id)}
            >
              שמור שיבוץ
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
  );
};

export default AddAssignment;