import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import "../styles/EditRoom.css";

const EditRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // הגדרת השדות בדיוק לפי המודל: roomNumber ו-size
  const [formData, setFormData] = useState({
    roomNumber: "",
    wing: "",
    floor: 0,
    size: 0, // שונה מ-capacity ל-size כדי להתאים למודל
    roomType: "כיתה",
    hasProjector: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/rooms/${roomId}`,
        );
        if (!response.ok) throw new Error("לא ניתן היה למצוא את פרטי החדר");

        const data = await response.json();
        // מיפוי הנתונים מהשרת ל-State
        setFormData({
          roomNumber: data.roomNumber || "",
          wing: data.wing || "",
          floor: data.floor || 0,
          size: data.size || 0,
          roomType: data.roomType || "כיתה",
          hasProjector: data.hasProjector || false,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchRoomDetails();
  }, [roomId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5000/api/rooms/${roomId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        alert("החדר עודכן בהצלחה!");
        navigate("/roomList");
      } else {
        alert("העדכון נכשל");
      }
    } catch (err) {
      alert("שגיאת תקשורת");
    }
  };

  if (loading) return <div className="edit-room-container">טוען...</div>;

  return (
    <div className="edit-room-container">
      <div className="edit-room-header">
        <h2>עריכת חדר</h2>
        <p>עדכן את פרטי חדר {formData.roomNumber} במערכת</p>
      </div>

      <div className="edit-room-card">
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>מספר חדר</label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div className="form-group">
            <label>אגף</label>
            <input
              type="text"
              name="wing"
              value={formData.wing}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>קומה</label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>קיבולת</label>
              <input
                type="number"
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>סוג חדר</label>
            <select
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              className="input-field"
            >
              <option value="כיתה">כיתה</option>
              <option value="מעבדה">מעבדה</option>
              <option value="אולם">אולם</option>
              <option value="חדר ישיבות">חדר ישיבות</option>
              <option value="חדר מחשבים">חדר מחשבים</option>
            </select>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              name="hasProjector"
              id="projector"
              checked={formData.hasProjector}
              onChange={handleChange}
            />
            <label htmlFor="projector">יש מקרן בחדר</label>
          </div>

          <div className="button-group">
            <button type="submit" className="btn-save">
              שמור שינויים
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/roomList")}
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoom;
