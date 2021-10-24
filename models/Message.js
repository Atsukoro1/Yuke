const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        min: 1,
        max: 500
    },

    from: {
        type: String,
        required: true
    },

    to: {
        type: String,
        required: true
    },

    creationDate: {
        type: Date,
        default: Date.now()
    }
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;