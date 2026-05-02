import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import {useDispatch, useSelector} from 'react-redux';
import {uiActions} from '../store/ui-slice';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";


const PointsTableModal = () => {const [voters, setVoters] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Sort voters by points (Highest points at the top)
    const rankedVoters = voters
    .filter(voter => voter.fullName !== "Preetham") // Removes Preetham
    .sort((a, b) => (b.netEarnings || 0) - (a.netEarnings || 0)); // Sorts the rest

     // close update elction modal
    const closeModal = () => {
        dispatch(uiActions.closePointsTableModal())
    }

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
        } 
    }, []);

    return (
        <section className='modal'>
            <div className = "modal__content">
                <header className = "modal__header">
                    <h1>Voter Leaderboard</h1>
                    <button className="modal__close" onClick={closeModal}><IoMdClose/></button>
                </header>
                
                {isLoading ? <Loader /> : (
                    
                    <div className="table-container">
                        <table className="voters-points-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Voter</th>
                                    <th>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                               {rankedVoters.map((voter, index) => {
                                    // 1. Determine if the points are negative
                                    const isNegative = (voter.netEarnings || 0) < 0;

                                    return (
                                        <tr key={voter._id} className="table-row">
                                            <td className="rank-cell">#{index + 1}</td>
                                            <td className="rank-cell">
                                                {voter.fullName}
                                            </td>
                                            <td className={`points-cell ${isNegative ? 'points-negative' : 'points-positive'}`}>
                                                {/* 2. Use Math.abs() to remove the minus sign */}
                                                {Math.abs(voter.netEarnings || 0)}
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
}

export default PointsTableModal;