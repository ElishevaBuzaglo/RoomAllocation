import React, { useState } from "react";
import { addAssignment } from "../services/allocationService";
import { searchRooms } from "../services/roomService";

const AddAssignment = () => {
  const [filters, setFilters] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: ""
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
      searchEnd: end.toISOString()
    };
  };


const handleSearch = async () => {
  try {
    const params = buildSearchParams(filters);

    const data = await searchRooms(params);
    setRooms(data);

  } catch (err) {
    console.log(err);
  }
};

// const handleAddAssignment = async (roomId, kind) => {
//   try {
//     const payload = {
//       roomId,
//       requesterName: "שרי",
//       kind,
//       startTime: filters.startTime,
//       endTime: filters.endTime,
//     };

//     if (kind === "temporary") {
//       payload.startDate = "2026-05-01";
//       payload.endDate = "2026-05-10";
//     }

//     await addAssignment(payload);

//     alert("השיבוץ נוסף בהצלחה ✅");

//     // 🔥 תיקון כאן:
//     const params = buildSearchParams(filters);
//     const updated = await searchRooms(params);
//     setRooms(updated);

//   } catch (err) {
//     alert(err.message || "שגיאה");
//   }
// };

const handleAddAssignment = async (roomId, kind) => {
  try {
    const payload = {
      roomId,
      requesterName: "שרי",
      kind,
      dayOfWeek: Number(filters.dayOfWeek),
      startTime: filters.startTime,
      endTime: filters.endTime,
    };

    if (kind === "temporary") {
      payload.startDate = "2026-05-01";
      payload.endDate = "2026-05-10";
    }

    await addAssignment(payload);

    alert("השיבוץ נוסף בהצלחה ✅");

    // 🔥 חובה: חיפוש מחדש אמיתי
    await handleSearch();

  } catch (err) {
    alert(err.message || "שגיאה");
  }
};

  return (
    <div style={{ padding: "20px" }}>
      <h2>🔍 חיפוש חדרים</h2>

      {/* יום בשבוע */}
      <select
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
      <input
        type="time"
        onChange={(e) =>
          setFilters({ ...filters, startTime: e.target.value })
        }
      />

      <input
        type="time"
        onChange={(e) =>
          setFilters({ ...filters, endTime: e.target.value })
        }
      />

      <button onClick={handleSearch}>חפש חדרים</button>

      <hr />

      {/* תוצאות */}
      {rooms.length === 0 ? (
        <p>לא נמצאו חדרים</p>
      ) : (
        rooms.map((room) => (
          <div
            key={room._id}
            style={{
              border: "1px solid #ccc",
              marginBottom: "10px",
              padding: "10px"
            }}
          >
            <h3>חדר {room.roomNumber}</h3>
            <p>קומה: {room.floor}</p>
            <p>גודל: {room.size}</p>

            <button onClick={() => handleAddAssignment(room._id, "permanent")}>
              שיבוץ קבוע
            </button>

            <button onClick={() => handleAddAssignment(room._id, "temporary")}>
              שיבוץ זמני
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AddAssignment;