const handleError = (error, res) => {
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: error.message });
    }
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: "Invalid ID" });
    }
    if (error.code === 11000) {
        return res.status(400).json({ success: false, message: "Duplicate key error" });
    }
    if (error.name === 'MongoError') {
        errorMessage = 'Duplicate key error';
        return res.status(400).json({ success: false, message: errorMessage });
    }
    return res.status(500).json({ success: false, message: "Internal server error", error: error?.message });
};

module.exports = {
    handleError
}