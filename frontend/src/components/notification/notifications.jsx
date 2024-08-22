import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, disconnectSocket } from '../../utils/socketslice.jsx';

const Notifications = () => {
    const dispatch = useDispatch();
    const socket = useSelector((state) => state.socket.socket);
    const [notifications, setNotifications] = useState([]);
    const url = import.meta.env.VITE_BASE_URL || 'http://localhost:8000/';
    const userData = useSelector((state) => state.auth.user);
    const userId = userData?.data?.user?._id;

    // Function to fetch previous notifications from the backend
    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${url}notification/notifications/${userId}`);
            console.log("Notification response", response.data);
            setNotifications(response?.data?.data || []); // Handle empty response
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };
    // console.log("Joining socket with ID - 2",socket);
    
    useEffect(() => {
        // Connect socket if not already connected
        if (!socket) {
            dispatch(connectSocket());
            console.log("Joining socket with ID");
        }

        // Fetch previous notifications on component mount
        fetchNotifications();

        // Listen for new notifications
        if (socket) {
            socket.on('notification', (notificationData) => {
                console.log('Notification received:', notificationData);
                setNotifications((prevNotifications) => [notificationData, ...prevNotifications]);
                console.log(notifications)
            });
        }

        // Clean up the socket event listener when the component unmounts
        return () => {
            if (socket) {
                socket.off('notification');
            }
        };
    }, [socket, dispatch, userId]);


    return (
        <div className="w-full bg-[#0d1114] h-[100vh] overflow-y-scroll no-scrollbar ">
            <div className="mt-4 text-center">
                <h3 className="text-2xl font-mono text-slate-200">Notifications</h3>

            </div>
            <div className="mt-4">
    <ul>
        {notifications.map((notification, index) => (
            <div className="text-slate-300  mx-6 rounded-lg bg-[#13181d] shadow-xl h-[50px] cursor-pointer" key={index}>
                <li className="my-2">
                    <div className="text-center font-sans pt-1 ">
                        <span>{notification.message}</span>
                    </div>
                    <div className="flex justify-end mr-4">
                        <span className="text-slate-400 text-sm">
                            {new Date(notification.createdAt).toLocaleString()}
                        </span>
                    </div>
                    
                </li>
            </div>
        ))}
    </ul>
</div>


        </div>
    );
};

export default Notifications;