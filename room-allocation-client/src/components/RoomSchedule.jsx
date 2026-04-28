import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router'; // חשוב לשליפת ה-ID מה-URL
import axios from 'axios';
import { format, getDay } from 'date-fns';
import { useSearchParams } from 'react-router-dom';

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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-10" dir="rtl">
            {/* קונטיינר מרכזי מוגבל ברוחב */}
            <div className="w-full max-w-3xl">
                
                {/* כותרת החדר */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
                        מערכת שעות: {room.roomName || room.roomNumber}
                    </h2>
                    <p className="text-gray-500 italic">אגף {room.wing} | קומה {room.floor}</p>
                </div>
                
                {/* בחירת תאריך - ממורכז בתוך קופסה לבנה */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 mb-8 flex flex-col items-center">
                    <label className="block mb-3 font-semibold text-gray-700 italic">בחר תאריך לצפייה:</label>
                    <input 
                        type="date" 
                        className="border-2 border-blue-50 p-2 rounded-lg focus:border-blue-400 outline-none transition-all cursor-pointer text-lg"
                        value={dateString} 
                        onChange={(e) => setSelectedDate(new Date(e.target.value))} 
                    />
                </div>

                {/* רשימת השיבוצים */}
                <div className="space-y-4">
                    {visibleAllocations.length > 0 ? (
                        visibleAllocations
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(alloc => (
                            <div 
                                key={alloc._id} 
                                className={`p-5 rounded-2xl border-r-8 shadow-sm bg-white flex justify-between items-center transition-transform hover:scale-[1.01] ${
                                    alloc.kind === 'permanent' ? 'border-blue-500' : 'border-emerald-500'
                                }`}
                            >
                                <div className="text-right">
                                    <div className="font-bold text-xl text-gray-900">{alloc.startTime} - {alloc.endTime}</div>
                                    <div className="text-gray-600">{alloc.requesterName}</div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    alloc.kind === 'permanent' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                    {alloc.kind === 'permanent' ? 'שיבוץ קבוע' : 'שיבוץ זמני'}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
                            <p className="text-lg">החדר פנוי ביום זה.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomSchedule;