import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, addWeeks, subWeeks, isBefore, startOfToday } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import '../styles/RoomSchedule.css';

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];
const HOURS = Array.from({ length: 14 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

const RoomSchedule = () => {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get('roomId');
    const [room, setRoom] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null); // null = מערכת קבועה
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        requesterName: '',
        startDate: '',
        endDate: '',
        dayOfWeek: 0,
        startTime: '08:00',
        endTime: '10:00'
    });

    // --- טעינת נתונים ---
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

    // --- לוגיקת חישוב שבועי ---
    const weekRange = useMemo(() => {
        if (!selectedDate) return null;
        const start = startOfWeek(selectedDate, { weekStartsOn: 0 }); // יום ראשון
        const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return { start, end };
    }, [selectedDate]);

    const weeklyTemporaryAllocations = useMemo(() => {
        if (!room || !room.allocations || !weekRange) return [];
        return room.allocations.filter(alloc => {
            if (alloc.kind !== 'temporary') return false;
            const d = new Date(alloc.startDate);
            return d >= weekRange.start && d <= weekRange.end;
        });
    }, [room, weekRange]);

    // --- Handlers מלאים ---
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
            fetchRoomData();
        } catch (err) {
            alert("שגיאה בעדכון השעות: " + (err.response?.data?.message || "בדוק את פורמט הזמן"));
        }
    };

    const handleAddCancellation = async (alloc) => {
        // 1. קבלת סיבה מהמשתמש
        const reason = prompt("סיבת הביטול (אופציונלי):");

        // אם המשתמש לחץ "ביטול" ב-prompt (יחזיר null), נפסיק את הפעולה
        if (reason === null) return;

        try {
            // 2. שליחת הנתונים בדיוק לפי ה-Schema
            await axios.post("/api/cancellations", {
                room: roomId,                       // ObjectId של החדר (Path: room)
                date: format(selectedDate, 'yyyy-MM-dd'), // התאריך שנבחר (Path: date)
                startTime: alloc.startTime,         // השעה מהשיבוץ המקורי (Path: startTime)
                endTime: alloc.endTime,             // השעה מהשיבוץ המקורי (Path: endTime)
                reason: reason || "לא צוינה סיבה",   // סיבת הביטול (Path: reason)
                cancelledBy: "מנהל מערכת"            // חובה לפי הסכימה (Path: cancelledBy)
            });

            alert("הביטול נרשם בהצלחה במערכת");
            fetchRoomData(); // רענון הנתונים בטבלה
        } catch (err) {
            console.error("Error details:", err.response?.data);
            alert("שגיאה ברישום הביטול: " + (err.response?.data?.message || "בדוק את הנתונים"));
        }
    };
    const navigateWeek = (direction) => {
        const base = selectedDate || new Date();
        setSelectedDate(direction > 0 ? addWeeks(base, 1) : subWeeks(base, 1));
    };

    const handleRestoreCancellation = async (cancellationId) => {
        if (!window.confirm("האם לשחזר את השיבוץ?")) return;

        try {
            // מחיקת הביטול מהשרת
            await axios.delete(`/api/cancellations/${cancellationId}`);

            // שליפה מחדש של נתוני החדר - זה מה שיגרום למשבצת "להתעורר"
            fetchRoomData();

            alert("השיבוץ שוחזר בהצלחה!");
        } catch (err) {
            console.error(err);
            alert("שגיאה בשחזור: " + (err.response?.data?.message || "בדוק את החיבור לשרת"));
        }
    };

    const handleAddTemporaryManual = async () => {
        // 1. בדיקה שיש תאריך נבחר (כי שיבוץ זמני חייב תאריך)
        if (!selectedDate) {
            alert("אנא בחר תאריך בלוח השנה לפני הוספת שיבוץ זמני");
            return;
        }

        // 2. איסוף נתונים מהמשתמש
        const requesterName = prompt("שם המרצה/המבקש:");
        if (!requesterName) return;

        const startTime = prompt("שעת התחלה (לדוגמה 08:00):");
        if (!startTime) return;

        const endTime = prompt("שעת סיום (לדוגמה 10:00):");
        if (!endTime) return;

        try {
            await axios.post("/api/allocations", {
                roomId,
                kind: 'temporary',
                requesterName,
                startDate: format(selectedDate, 'yyyy-MM-dd'),
                endDate: format(selectedDate, 'yyyy-MM-dd'),
                startTime,
                endTime
            });

            alert("השיבוץ הזמני נוסף בהצלחה!");
            fetchRoomData();
        } catch (err) {
            alert("שגיאה: " + (err.response?.data?.message || "החדר תפוס בזמן זה"));
        }
    };

    const handleSaveTemporary = async (e) => {
        e.preventDefault(); // מניעת רענון הדף
        try {
            await axios.post("/api/allocations", {
                roomId,
                kind: 'temporary',
                requesterName: formData.requesterName,
                startDate: formData.startDate,
                endDate: formData.endDate,
                dayOfWeek: formData.dayOfWeek,
                startTime: formData.startTime,
                endTime: formData.endTime
            });

            alert("השיבוץ נוסף בהצלחה!");
            setShowModal(false); // סגירת המודאל
            fetchRoomData();     // רענון הטבלה
        } catch (err) {
            alert("שגיאה: " + (err.response?.data?.message || "בדוק חפיפה בלו\"ז"));
        }
    };

    // --- Helpers לשליפת מידע למשבצת ---
    const getSlotData = (dayIdx, hour) => {
        const perm = room?.allocations?.find(a =>
            a.kind === 'permanent' && a.dayOfWeek === dayIdx && hour >= a.startTime && hour < a.endTime
        );

        // מוצאים את אובייקט הביטול עצמו במקום רק true/false
        const cancellation = room?.cancellations?.find(c => {
            const cancellationDate = new Date(c.date);
            const targetDate = weekRange ? addDays(weekRange.start, dayIdx) : null;
            return targetDate && isSameDay(cancellationDate, targetDate) && hour >= c.startTime && hour < c.endTime;
        });

        let temp = null;
        if (weekRange) {
            const targetDate = addDays(weekRange.start, dayIdx);
            temp = weeklyTemporaryAllocations.find(a => {
                const start = new Date(a.startDate);
                const end = new Date(a.endDate);
                const current = targetDate; // התאריך של המשבצת בטבלה

                // מנרמלים שעות ל-00:00 כדי להשוות רק תאריכים
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);
                current.setHours(0, 0, 0, 0);

                // בדוק אם התאריך בטווח
                const isInRange = current >= start && current <= end;
                // אם יש dayOfWeek, בדוק אם היום תואם
                const dayMatches = a.dayOfWeek === undefined || a.dayOfWeek === dayIdx;
                // בדוק אם השעה בתוך הטווח
                const timeMatches = hour >= a.startTime && hour < a.endTime;

                return isInRange && dayMatches && timeMatches;
            });
        }

        return { perm, temp, isCancelled: !!cancellation, cancellationId: cancellation?._id };
    };

    if (loading) return <div className="status-msg">טוען מערכת שעות...</div>;
    if (error) return <div className="status-msg error">{error}</div>;

    return (
        <div className="schedule-container" style={{ direction: 'rtl' }}>

            <div className="schedule-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>מערכת שעות: {room?.roomName || room?.roomNumber}</h2>

                <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
                    {/* כפתור הוספת שיבוץ זמני החדש */}
                    <button
                        className="btn-add-temp"
                        onClick={() => {
                            // אתחול התאריכים ליום הנוכחי שנבחר בטבלה
                            setFormData({
                                ...formData,
                                startDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
                                endDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
                            });
                            setShowModal(true);
                        }}
                        style={{
                            backgroundColor: '#4caf50',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}>
                        ➕ הוסף שיבוץ זמני
                    </button>

                    <button className="btn-delete-all" onClick={handleDeleteAll}>מחק את כל שיבוצי החדר</button>
                </div>
            </div>

            {/* שורת בקרה מעודכנת */}
            <div className="controls-row" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>

                {/* 1/3 - חזרה למערכת קבועה (צד ימין) */}
                <div className="reset-wrapper" style={{ flex: 1 }}>
                    <button
                        className={`btn-reset ${!selectedDate ? 'active' : ''}`}
                        onClick={() => setSelectedDate(null)}
                        style={{ width: '100%', padding: '12px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '8px', border: '1px solid #ddd' }}
                    >
                        🏠 חזרה למערכת קבועה
                    </button>
                </div>

                {/* 2/3 - בחירת תאריך וניווט (צד שמאל) */}
                <div className="date-picker-main-wrapper" style={{ flex: 2, display: 'flex', alignItems: 'center', backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '8px', justifyContent: 'space-between' }}>

                    {/* חץ ימני - שבוע קודם (פונה החוצה ימינה) */}
                    <button onClick={() => navigateWeek(-1)} className="nav-arrow" style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', padding: '0 15px' }}>
                        ❮
                    </button>

                    <div className="date-input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: '500' }}>צפייה לפי תאריך:</span>
                        <input
                            type="date"
                            value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    {/* חץ שמאלי - שבוע הבא (פונה החוצה שמאלה) */}
                    <button onClick={() => navigateWeek(1)} className="nav-arrow" style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', padding: '0 15px' }}>
                        ❯
                    </button>
                </div>
            </div>

            <div className="weekly-section">
                <h3>
                    {selectedDate
                        ? `שיבוצים לשבוע: ${format(weekRange.start, 'dd/MM')} - ${format(weekRange.end, 'dd/MM')}`
                        : "מערכת קבועה"}
                </h3>

                <div className="table-wrapper">
                    <table className="schedule-matrix">
                        <thead>
                            <tr>
                                <th className="hour-header">שעה</th>
                                {DAYS.map((day, i) => {
                                    const dayDate = weekRange ? addDays(weekRange.start, i) : null;
                                    const isPast = dayDate && isBefore(dayDate, startOfToday());
                                    return (
                                        <th key={i} className={isPast ? 'column-past' : ''}>
                                            {day}
                                            {dayDate && <div className="date-subtitle">{format(dayDate, 'dd/MM')}</div>}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {HOURS.map(hour => (
                                <tr key={hour}>
                                    <td className="hour-col">{hour}</td>
                                    {DAYS.map((_, dayIdx) => {
                                        // 1. שליפת הנתונים מהפונקציה
                                        const { perm, temp, isCancelled, cancellationId } = getSlotData(dayIdx, hour);
                                        const active = isCancelled ? null : (temp || perm);

                                        // 2. הגדרת המשתנה שחסר לך (isPastSlot) - זה התיקון לשגיאה!
                                        const slotDate = weekRange ? addDays(weekRange.start, dayIdx) : null;
                                        const isPastSlot = slotDate && isBefore(slotDate, startOfToday());

                                        return (
                                            <td
                                                key={dayIdx}
                                                className={`${active ? (temp ? 'cell-temp' : 'cell-occupied') : 'cell-free'} ${isPastSlot ? 'column-past' : ''}`}
                                            >
                                                {active ? (
                                                    <div className="cell-content">
                                                        <span style={{
                                                            textDecoration: isCancelled ? 'line-through' : 'none',
                                                            opacity: isCancelled ? 0.5 : 1,
                                                            color: isCancelled ? 'red' : (isPastSlot ? '#666' : 'inherit')
                                                        }}>
                                                            {active.requesterName}
                                                        </span>

                                                        <div className="cell-actions">
                                                            {/* כפתור שחזור - מופיע רק אם בוטל */}
                                                            {isCancelled ? (
                                                                <button
                                                                    onClick={() => handleRestoreCancellation(cancellationId)}
                                                                    title="שחזר שיבוץ"
                                                                    style={{ backgroundColor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '4px' }}
                                                                >
                                                                    🔄
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    {/* כפתור שעון - תמיד בולט */}
                                                                    {perm && (
                                                                        <button
                                                                            onClick={() => handleUpdatePermanent(perm._id, perm.startTime, perm.endTime)}
                                                                            title="ערוך שעות"
                                                                        >
                                                                            🕒
                                                                        </button>
                                                                    )}
                                                                    {/* כפתור ביטול - מטושטש בעבר, רגיל בעתיד */}
                                                                    {perm && selectedDate && (
                                                                        <button
                                                                            onClick={!isPastSlot ? () => handleAddCancellation(perm) : undefined}
                                                                            title={isPastSlot ? "לא ניתן לבטל מהעבר" : "בטל חד-פעמי"}
                                                                            style={{
                                                                                opacity: isPastSlot ? 0.2 : 1,
                                                                                cursor: isPastSlot ? 'not-allowed' : 'pointer'
                                                                            }}
                                                                        >
                                                                            ❌
                                                                        </button>
                                                                    )}
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
            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '400px', direction: 'rtl'
                    }}>
                        <h3>הוספת שיבוץ זמני</h3>
                        <form onSubmit={handleSaveTemporary} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <label>שם המרצה:
                                <input type="text" required style={{ width: '100%' }}
                                    onChange={e => setFormData({ ...formData, requesterName: e.target.value })} />
                            </label>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <label>מתאריך:
                                    <input type="date" required
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                                </label>
                                <label>עד תאריך:
                                    <input type="date" required
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                                </label>
                            </div>

                            <label>יום בשבוע:
                                <select required style={{ width: '100%', padding: '8px' }}
                                    value={formData.dayOfWeek}
                                    onChange={e => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}>
                                    {DAYS.map((day, idx) => (
                                        <option key={idx} value={idx}>{day}</option>
                                    ))}
                                </select>
                            </label>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <label>שעת התחלה:
                                    <input type="time" required value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                                </label>
                                <label>שעת סיום:
                                    <input type="time" required value={formData.endTime}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" style={{ flex: 1, backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>שמור</button>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, backgroundColor: '#f44336', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>ביטול</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
};

export default RoomSchedule;