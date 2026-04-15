const notificationModel = require('../models/notificationModel')
const HttpError = require('../models/ErrorModel');
const mongoose = require("mongoose");

/*
* get Notifications
* GET : api/teams
* PROTECTED
*/
const getNotifications = async (req, res, next) => {
    try {   
         console.log("in get all notifications ")        
        const notifications = await notificationModel.find({ voter: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        console.log("notification list ", notifications)
        res.status(200).json(notifications);
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Failed to fetch notifications", 404))
    }
}

/*
* update Notifications
* GET : api/teams
* PROTECTED
*/
const updateNotifications = async (req, res, next) => {
    try {   
         console.log("in update notifications ")        
        await notificationModel.updateMany(
            { voter: req.user.id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ message: "All marked as read" });
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Update failed", 404))
    }
}

module.exports = {getNotifications, updateNotifications}