import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/notifications`,
              {withCredentials: true, headers:{Authorization: `Bearer ${token}`}})
            const notifications = await response.data;
            setNotifications(notifications);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchNotifications();
        // Close dropdown when clicking outside
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${process.env.REACT_APP_API_URL}/notifications/readAll`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) { console.error(err); }
    };

    return (
        <div className="notification-wrapper" ref={dropdownRef}>
            <button className="nav__notification-btn" onClick={() => { setIsOpen(!isOpen); handleMarkAsRead(); }}>
                <i className="fa-solid fa-bell"></i>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">Notifications</div>
                    <div className="notification-list">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div key={n._id} className={`notification-item ${!n.isRead ? 'unread' : ''}`}>
                                    <p>{n.message}</p>
                                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                                </div>
                            ))
                        ) : (
                            <div className="notification-empty">No notifications yet</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;