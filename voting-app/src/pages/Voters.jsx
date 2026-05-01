import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';

const Voters = () => {
    const [voters, setVoters] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Sort voters by points (Highest points at the top)
    const rankedVoters = [...voters].sort((a, b) => (b.points || 0) - (a.points || 0));

    const getVoters = async () => {
        setIsLoading(true);
        try {
            const savedToken = localStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/voters`, {
                headers: { Authorization: `Bearer ${savedToken}` }
            });
            const votersData = await response.data
            console.log("Voters.....", votersData);
            setVoters(votersData);
            
        } catch (error) {
            console.error("Error fetching voters:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (user?.token) {
            getVoters();
        } else {
            navigate('/');
        }
    }, [navigate]);

    return (
        <section className='elections'>
            <div className='container elections__container'>
                <header className='elections__header'>
                    <h1>Voter Leaderboard</h1>
                </header>

                {isLoading ? <Loader /> : (
                    <div className="table-container">
                        <table className="voters-points-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Voter</th>
                                    <th>Points</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankedVoters.map((voter, index) => (
                                    <tr key={voter._id} className="table-row">
                                        <td className="rank-cell">#{index + 1}</td>
                                        <td className="rank-cell">
                                             {voter.fullName}
                                        </td>
                                        <td className="points-cell">{voter.netEarnings || 0}</td>
                                        <td>
                                            <span className={`status-badge ${voter.isAdmin ? 'admin' : 'voter'}`}>
                                                {voter.isAdmin ? 'Admin' : 'Voter'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Voters;