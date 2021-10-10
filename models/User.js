const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: 3,
        max: 50
    },
    
    password: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        min: 4,
        max: 255
    },

    outgoingFriendRequests: {
        type: Array,
        default: []
    },

    ingoingFriendRequests: {
        type: Array,
        default: []
    },

    blockedUsers: {
        type: Array,
        default: []
    },

    friends: {
        type: Array,
        default: []
    }
})

const User = mongoose.model("User", userSchema);

module.exports = User;