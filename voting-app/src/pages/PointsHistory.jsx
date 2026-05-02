import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';

const PointsHistory = () => {
    const [pointsHistory, setPointsHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const getPointsHistory = async () => {
        setIsLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem("currentUser")); // Convert string to Object
            const { token, id } = user; 
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const votersData = await response.data
            console.log("Voters.....", votersData);
            setPointsHistory(votersData);
            
        } catch (error) {
            console.error("Error fetching voters:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (user?.token) {
            getPointsHistory();
        } else {
            navigate('/');
        }
    }, [navigate]);

    const parseNotification = (msg) => {
        // Regex patterns to capture specific parts
        const matchNum = msg.match(/(\d+)\./)?.[1] || "N/A";
        // This looks for word characters, followed by (Vs, VS, vs, OR a hyphen), followed by word characters
        const matchName = msg.match(/([A-Z0-9]+\s*(?:V[sS]|-)\s*[A-Z0-9]+)/i)?.[1] || "N/A";
        const matchDate = msg.match(/\((.*?)\)/)?.[1] || "N/A";
        const points = msg.match(/(\d+)\spts/)?.[1] || "0";
        const isLoss = msg.toLowerCase().includes('lost') || msg.toLowerCase().includes('decreased');

        // 2. NEW: Extract winning team (Looks for the word after "winner")
    // This matches "winner " followed by one or more capital letters/numbers
    const winnerTeam = msg.match(/winner\s+([A-Z0-9]+)/i)?.[1] || "N/A";


        return { matchNum, matchName, matchDate, points, isLoss, winnerTeam };
    };

    return (
        <section className='elections'>
            <div className='container elections__container'>
                <header className='elections__header'>
                    <h1>Points History</h1>
                </header>

                {isLoading ? <Loader /> : (
                    <div className="table-container">
                        

                        <table className="voters-points-table">
                            <thead>
                                <tr>
                                    <th>Match Number</th>
                                    <th>Match</th>
                                    <th>Winner Team</th>
                                    <th>Status</th>
                                    <th>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pointsHistory.map((notification) => {
                                    const { matchNum, matchName, matchDate, points, isLoss, winnerTeam } = parseNotification(notification.message);

                                    return (
                                        <tr key={notification._id} className="table-row" title={notification.message}>
                                            <td className="cell-center">{matchNum}</td>
                                            <td>
                                                <div className="match-info">
                                                    <strong>{matchName}</strong>
                                                    <small>{matchDate}</small>
                                                </div>
                                            </td>
                                            <td className="cell-center">{winnerTeam}</td>
                                            <td className={isLoss ? 'text-red' : 'text-green'}>
                                                {isLoss ? 'Decreased' : 'Increased'}
                                            </td>
                                            <td className={`points-cell ${isLoss ? 'bg-red' : 'bg-green'}`}>
                                                {isLoss ? '📉' : '📈'} {points} pts
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>


                    </div>
                )}
            </div>
        </section>
    );
};

export default PointsHistory;