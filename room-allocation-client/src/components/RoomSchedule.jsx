import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import '../styles/RoomSchedule.css';

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];
const HOURS = Array.from({ length: 14 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

const RoomSchedule = () => {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get('roomId');
    const [room, setRoom] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // חישוב תאריכי השבוע הנוכחי לפי התאריך שנבחר (מתחיל ביום ראשון)
    const weekDays = useMemo(() => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
        return DAYS.map((_, index) => addDays(start, index));
    }, [selectedDate]);

    const fetchRoomData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/rooms/${roomId}`);
            setRoom(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "שגיאה בטעינת נתוני החדר");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (roomId && roomId !== 'default') fetchRoomData();
    }, [roomId]);

    // --- Logic Handlers ---

    const handleDeleteAll = async () => {
        if (!window.confirm("האם אתה בטוח שברצונך למחוק את כל השיבוצים לחדר זה?")) return;
        try {
            await axios.delete(`/api/allocations/room/${roomId}`);
            alert("כל השיבוצים נמחקו בהצלחה");
            fetchRoomData();
        } catch (err) {
            alert("שגיאה במחיקת השיבוצים");
        }
    };

    const handleUpdatePermanent = async (allocId, currentStart, currentEnd) => {
        const newStart = prompt("הכנס שעת התחלה חדשה (לדוגמה 09:00):", currentStart);
        if (!newStart) return;
        const newEnd = prompt("הכנס שעת סיום חדשה (לדוגמה 11:00):", currentEnd);
        if (!newEnd) return;

        try {
            await axios.patch(`/api/allocations/${allocId}`, {
                startTime: newStart,
                endTime: newEnd
            });
            alert("השעות עודכנו בהצלחה");
            fetchRoomData();
        } catch (err) {
            alert("שגיאה בעדכון השעות");
        }
    };

    const handleAddCancellation = async (alloc, date) => {
        const reason = prompt("סיבת הביטול:");
        if (reason === null) return;
        try {
            await axios.post("/api/allocations", {
                roomId,
                kind: 'cancellation',
                originalAllocationId: alloc._id,
                date: format(date, 'yyyy-MM-dd'),
                reason
            });
            alert("ביטול חד-פעמי נוסף בהצלחה");
            fetchRoomData();
        } catch (err) {
            alert("שגיאה בהוספת הביטול");
        }
    };

    // --- Helper Function: מציאת שיבוץ לתא ספציפי בטבלה ---
    const getAllocationForSlot = (dayIdx, hour) => {
        if (!room?.allocations) return null;

        const currentSlotDate = weekDays[dayIdx];
        const dateStr = format(currentSlotDate, 'yyyy-MM-dd');

        // 1. בדיקה אם יש שיבוץ זמני (Temporary) לתאריך ולשעה הזו
        const tempAlloc = room.allocations.find(alloc =>
            alloc.kind === 'temporary' &&
            isSameDay(parseISO(alloc.startDate), currentSlotDate) &&
            hour >= alloc.startTime && hour < alloc.endTime
        );
        if (tempAlloc) return { ...tempAlloc, isTemporary: true };

        // 2. בדיקה אם יש ביטול (Cancellation) לשיבוץ קבוע בתאריך הזה
        const isCancelled = room.allocations.some(alloc =>
            alloc.kind === 'cancellation' &&
            format(parseISO(alloc.date), 'yyyy-MM-dd') === dateStr &&
            room.allocations.find(original => original._id === alloc.originalAllocationId && hour >= original.startTime && hour < original.endTime)
        );
        if (isCancelled) return null;

        // 3. מציאת שיבוץ קבוע (Permanent)
        const permAlloc = room.allocations.find(alloc =>
            alloc.kind === 'permanent' &&
            alloc.dayOfWeek === dayIdx &&
            hour >= alloc.startTime && hour < alloc.endTime
        );

        return permAlloc ? { ...permAlloc, isTemporary: false } : null;
    };

    if (loading) return <div className="status-msg">טוען מערכת שעות...</div>;
    if (error) return <div className="status-msg error">{error}</div>;
    if (!room) return <div className="status-msg">לא נמצא חדר להצגה.</div>;

    return (
        <div className="schedule-container">
            <div className="schedule-header">
                <h2>מערכת שעות: {room.roomName || room.roomNumber}</h2>
                <div className="admin-actions">
                    <button className="btn-delete-all" onClick={handleDeleteAll}>מחק את כל שיבוצי החדר</button>
                </div>
            </div>

            <div className="date-selector-box">
                <label>הצג שבוע עבור תאריך:</label>
                <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
                <span className="week-range">
                    (שבוע: {format(weekDays[0], 'dd/MM')} - {format(weekDays[5], 'dd/MM')})
                </span>
            </div>

            <div className="weekly-section">
                <div className="table-wrapper">
                    <table className="schedule-matrix">
                        <thead>
                            <tr>
                                <th>שעה</th>
                                {DAYS.map((day, i) => (
                                    <th key={i}>
                                        {day}
                                        <div className="th-date">{format(weekDays[i], 'dd/MM')}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {HOURS.map(hour => (
                                <tr key={hour}>
                                    <td className="hour-col">{hour}</td>
                                    {DAYS.map((_, dayIdx) => {
                                        const alloc = getAllocationForSlot(dayIdx, hour);

                                        // קביעת ה-Class לפי סוג השיבוץ
                                        let cellClass = 'cell-free';
                                        if (alloc) {
                                            cellClass = alloc.isTemporary ? 'cell-temporary' : 'cell-permanent';
                                        }

                                        return (
                                            <td key={dayIdx} className={cellClass}>
                                                {alloc ? (
                                                    <div className="cell-content">
                                                        <span className="req-name">{alloc.requesterName}</span>
                                                        <div className="cell-actions">
                                                            {/* הצגת כפתורי עריכה רק לשיבוץ קבוע, או לפי הלוגיקה שלך */}
                                                            {!alloc.isTemporary && (
                                                                <>
                                                                    <button onClick={() => handleUpdatePermanent(alloc._id, alloc.startTime, alloc.endTime)} title="ערוך">🕒</button>
                                                                    <button onClick={() => handleAddCancellation(alloc, weekDays[dayIdx])} title="בטל">❌</button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RoomSchedule;