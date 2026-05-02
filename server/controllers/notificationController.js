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
        const notifications = await notificationModel.find()
            .sort({ createdAt: -1 })
        console.log("notification list ", notifications.length)
        res.status(200).json(notifications);
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Failed to fetch notifications", 404))
    }
}

/*
* get Notifications
* GET : api/teams
* PROTECTED
*/
const getNotificationsForVoter = async (req, res, next) => {
    try {   
         console.log("in get notifications for voter ")     
             const { id } = req.params; // Or req.query   
        const notifications = await notificationModel.find({ voter: id })
            .sort({ createdAt: -1 })
        console.log("notification list ", notifications.length)
        res.status(200).json(notifications);
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Failed to fetch notifications for voter", 404))
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

module.exports = {getNotifications, getNotificationsForVoter, updateNotifications}