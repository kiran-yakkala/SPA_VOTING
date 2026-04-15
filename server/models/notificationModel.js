const {Schema, model, Types} = require('mongoose')

// notificationModel.js
const notificationSchema = new Schema({
    voter: { type: Types.ObjectId, ref: 'Voter', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = model('Notification', notificationSchema)