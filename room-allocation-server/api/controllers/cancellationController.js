import Cancellation from "../models/Cancellation.js";
import Room from "../models/Room.js";

export const addCancellation = async (req, res) => {
    try {
        const newCancellation = await new Cancellation(req.body).save();
        res.status(201).json(newCancellation);
    } catch (err) {
        console.log(err.message);
        
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