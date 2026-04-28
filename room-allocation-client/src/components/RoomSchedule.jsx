import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router'; // חשוב לשליפת ה-ID מה-URL
import axios from 'axios';
import { format, getDay } from 'date-fns';

const RoomSchedule = () => {
    // 1. שליפת ה-ID מהנתיב (מזהה החדר)
    const { roomId } = useParams();
    
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
    if (loading) return <div className="p-4">טוען מערכת שעות...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (!room) return <div className="p-4">לא נמצא חדר להצגה.</div>;

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
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">מערכת שעות: {room.roomName || room.roomNumber}</h2>
            
            <div className="mb-6">
                <label className="block mb-2">בחר תאריך לצפייה:</label>
                <input 
                    type="date" 
                    className="border p-2 rounded"
                    value={dateString} 
                    onChange={(e) => setSelectedDate(new Date(e.target.value))} 
                />
            </div>

            <div className="grid gap-4">
                {visibleAllocations.length > 0 ? (
                    visibleAllocations.map(alloc => (
                        <div key={alloc._id} className={`p-4 rounded border shadow-sm ${alloc.kind === 'permanent' ? 'bg-blue-50' : 'bg-green-50'}`}>
                            <div className="font-bold">{alloc.startTime} - {alloc.endTime}</div>
                            <div className="text-sm text-gray-600">{alloc.requesterName}</div>
                            <div className="text-xs mt-1 uppercase">{alloc.kind}</div>
                        </div>
                    ))
                ) : (
                    <div className="italic text-gray-500">אין שיבוצים רשומים ליום זה.</div>
                )}
            </div>
        </div>
    );
};

export default RoomSchedule;