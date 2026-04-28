import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router'; // חשוב לשליפת ה-ID מה-URL
import axios from 'axios';
import { format, getDay } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import '../styles/RoomSchedule.css';

const RoomSchedule = () => {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get('roomId');
    const [room, setRoom] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 2. קריאה לשרת באמצעות ה-Proxy (נתיב יחסי)
                const response = await axios.get(`/api/rooms/${roomId}`);

                // שמירת הנתונים (השרת מחזיר את אובייקט ה-room עם מערך ה-allocations בפנים)
                setRoom(response.data);
            } catch (err) {
                console.error("Error fetching room details:", err);
                setError(err.response?.data?.message || "שגיאה בטעינת נתוני החדר");
            } finally {
                setLoading(false);
            }
        };

        if (roomId && roomId !== 'default') {
            fetchRoomData();
        }
    }, [roomId]);

    // 3. הגנות וטעינה
    if (loading) return <div style={{padding: '20px', textAlign: 'center'}}>טוען מערכת שעות...</div>;
    if (error) return <div style={{padding: '20px', textAlign: 'center', color: '#d63031'}}>{error}</div>;
    if (!room) return <div style={{padding: '20px', textAlign: 'center'}}>לא נמצא חדר להצגה.</div>;

    // --- לוגיקת הסינון להצגה ---
    const dayOfWeek = getDay(selectedDate);
    const dateString = format(selectedDate, 'yyyy-MM-dd');

    // סינון השיבוצים שחזרו מה-populate
    const visibleAllocations = room.allocations ? room.allocations.filter(alloc => {
        // שיבוץ קבוע ליום שנבחר
        if (alloc.kind === 'permanent' && alloc.dayOfWeek === dayOfWeek) {
            return true;
        }
        // שיבוץ זמני לתאריך שנבחר
        if (alloc.kind === 'temporary' && format(new Date(alloc.startDate), 'yyyy-MM-dd') === dateString) {
            return true;
        }
        return false;
    }) : [];

    return (
        <div className="schedule-container">
            {/* כותרת החדר */}
            <div className="schedule-header">
                <h2>מערכת שעות: {room.roomName || room.roomNumber}</h2>
                <p>אגף {room.wing} | קומה {room.floor} | גודל: {room.size} איש</p>
            </div>
            
            {/* בחירת תאריך */}
            <div className="date-selector-box">
                <label>בחר תאריך לצפייה:</label>
                <input 
                    type="date" 
                    value={dateString} 
                    onChange={(e) => setSelectedDate(new Date(e.target.value))} 
                />
            </div>

            {/* רשימת השיבוצים */}
            <div className="allocations-list">
                {visibleAllocations.length > 0 ? (
                    visibleAllocations
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(alloc => (
                        <div 
                            key={alloc._id} 
                            className={`allocation-card ${alloc.kind}`}
                        >
                            <div className={`allocation-type ${alloc.kind}`}>
                                {alloc.kind === 'permanent' ? 'קבוע' : 'זמני'}
                            </div>
                            <div className="allocation-content">
                                <div className="allocation-time">{alloc.startTime} - {alloc.endTime}</div>
                                <div className="allocation-requester">{alloc.requesterName}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-allocations">
                        <p>✨ החדר פנוי ביום זה</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomSchedule;