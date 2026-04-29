import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { format, getDay } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import '../styles/RoomSchedule.css';

// נתוני עזר לטבלה השבועית
const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];
const HOURS = Array.from({ length: 14 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

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
                const response = await axios.get(`/api/rooms/${roomId}`);
                setRoom(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "שגיאה בטעינת נתוני החדר");
            } finally {
                setLoading(false);
            }
        };

        if (roomId && roomId !== 'default') fetchRoomData();
    }, [roomId]);

    // פונקציית עזר לבדיקת שיבוץ קבוע למשבצת בטבלה
    const getPermanentAllocForSlot = (dayIndex, hour) => {
        return room?.allocations?.find(alloc => 
            alloc.kind === 'permanent' && 
            alloc.dayOfWeek === dayIndex &&
            hour >= alloc.startTime && 
            hour < alloc.endTime
        );
    };

    // סינון שיבוצים זמניים בלבד לתאריך הנבחר
    const temporaryAllocations = useMemo(() => {
        if (!room || !room.allocations) return [];
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        
        return room.allocations
            .filter(alloc => 
                alloc.kind === 'temporary' && 
                format(new Date(alloc.startDate), 'yyyy-MM-dd') === dateString
            )
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [room, selectedDate]);

    if (loading) return <div className="status-msg">טוען מערכת שעות...</div>;
    if (error) return <div className="status-msg error">{error}</div>;
    if (!room) return <div className="status-msg">לא נמצא חדר להצגה.</div>;

    return (
        <div className="schedule-container">
            <div className="schedule-header">
                <h2>מערכת שעות: {room.roomName || room.roomNumber}</h2>
                <p>אגף {room.wing} | קומה {room.floor} | קיבולת: {room.size}</p>
            </div>

            {/* חלק 1: טבלת מערכת שבועה קבועה */}
            <div className="weekly-section">
                <h3>שיבוצים קבועים (שבועי)</h3>
                <div className="table-wrapper">
                    <table className="schedule-matrix">
                        <thead>
                            <tr>
                                <th>שעה</th>
                                {DAYS.map((day, i) => <th key={i}>{day}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {HOURS.map(hour => (
                                <tr key={hour}>
                                    <td className="hour-col">{hour}</td>
                                    {DAYS.map((_, dayIdx) => {
                                        const alloc = getPermanentAllocForSlot(dayIdx, hour);
                                        return (
                                            <td key={dayIdx} className={alloc ? 'cell-occupied' : 'cell-free'}>
                                                {alloc ? alloc.requesterName : '-'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <hr className="divider" />

            {/* חלק 2: שיבוצים זמניים לפי תאריך */}
            <div className="temporary-section">
                <h3>שיבוצים זמניים ואירועים</h3>
                <div className="date-selector-box">
                    <label>בחר תאריך:</label>
                    <input 
                        type="date" 
                        value={format(selectedDate, 'yyyy-MM-dd')} 
                        onChange={(e) => setSelectedDate(new Date(e.target.value))} 
                    />
                </div>

                <div className="allocations-list">
                    {temporaryAllocations.length > 0 ? (
                        temporaryAllocations.map(alloc => (
                            <div key={alloc._id} className="allocation-card temporary">
                                <div className="allocation-type">זמני</div>
                                <div className="allocation-content">
                                    <div className="allocation-time">{alloc.startTime} - {alloc.endTime}</div>
                                    <div className="allocation-requester">{alloc.requesterName}</div>
                                    {alloc.reason && <div className="allocation-reason">{alloc.reason}</div>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-allocations">
                            <p>אין שיבוצים זמניים לתאריך {format(selectedDate, 'dd/MM/yyyy')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomSchedule;