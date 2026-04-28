import Cancellation from "../models/Cancellation.js";
import Room from "../models/Room.js";

export const getAvailableRooms = async (req, res) => {
    try {
        const { date, startTime, endTime } = req.query;
        if (!date || !startTime || !endTime) return res.status(400).json({ message: "חסרים פרמטרים לחיפוש" });

        const searchDate = new Date(date);
        searchDate.setHours(0,0,0,0);
        const dayOfWeek = searchDate.getDay();

        const rooms = await Room.find().populate('allocations').populate('cancellations');

        const availableRooms = rooms.filter(room => {
            const overlappingAlloc = room.allocations.find(alloc => {
                const isTimeOverlap = startTime < alloc.endTime && endTime > alloc.startTime;
                if (alloc.kind === 'permanent') {
                    return alloc.dayOfWeek === dayOfWeek && isTimeOverlap;
                }
                const allocDate = new Date(alloc.startDate);
                allocDate.setHours(0,0,0,0);
                return allocDate.getTime() === searchDate.getTime() && isTimeOverlap;
            });

            if (!overlappingAlloc) return true;

            // בדיקה אם קיים ביטול שמשחרר את החדר בזמן הזה
            return room.cancellations.some(cancel => {
                const cancelDate = new Date(cancel.date);
                cancelDate.setHours(0,0,0,0);
                return cancelDate.getTime() === searchDate.getTime() && 
                       cancel.startTime <= startTime && cancel.endTime >= endTime;
            });
        });
        res.status(200).json(availableRooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addCancellation = async (req, res) => {
    try {
        const newCancellation = await new Cancellation(req.body).save();
        res.status(201).json(newCancellation);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteCancellation = async (req, res) => {
    try {
        const deleted = await Cancellation.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "הביטול לא נמצא" });
        res.status(200).json({ message: "הביטול נמחק בהצלחה" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};