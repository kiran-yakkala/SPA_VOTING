import React, { useEffect, useState } from 'react';  
import { Link, NavLink } from 'react-router-dom';
import { IoMdSunny } from "react-icons/io";
import { IoIosMoon } from "react-icons/io";
import { HiOutlineBars3 } from "react-icons/hi2";
import { AiOutlineClose } from "react-icons/ai";
import '../index.css';
import { useSelector } from 'react-redux';

const Navbar = () => {
    const[showNav, setShowNav] = useState(window.innerWidth < 600 ? false : true);
    const[token, setToken] = useState('');
    const[darkTheme, setDarkTheme] = useState(
        localStorage.getItem('voting-app-theme') || "");
    const currentVoter = useSelector(state => state?.vote?.currentVoter)
    //const token = useSelector(state => state?.vote?.currentVoter?.token)

    
        // function to close nav menu on small screens when a link is clicked
const closeNavMenu = () => {
    if(window.innerWidth < 600){
        setShowNav(false);
    } else {
        setShowNav(true);
    }
}

// function to toggle dark theme
const changeTheme = () => {
    if(localStorage.getItem('voting-app-theme') === 'dark'){
        localStorage.setItem('voting-app-theme', '');
    } else {
        localStorage.setItem('voting-app-theme', 'dark');
    }
    setDarkTheme(localStorage.getItem('voting-app-theme'));
}

useEffect(() => {
    setToken(localStorage.getItem('token'))
    document.body.className = localStorage.getItem('voting-app-theme');
},[darkTheme])

  return (
    <nav>
        <div className="container nav__container">
            {currentVoter ?  <Link to="/profile" className="nav__logo">{currentVoter.fullName}</Link>
                :
                 <Link to="/logout" className="nav__logo">Voting App</Link>}
            
            <div>
                {token && showNav && 
                <menu>
                    <NavLink to="/teams" onClick={closeNavMenu}>Teams</NavLink>
                    <NavLink to="/elections" onClick={closeNavMenu}>Matches</NavLink>
                    <NavLink to="/results" onClick={closeNavMenu}>Results</NavLink>
                    <NavLink to="/logout" onClick={closeNavMenu}>Logout</NavLink>
                </menu> }
                <button className="theme__toggle-btn"
                        onClick={changeTheme}>
                            {
                                darkTheme ? <IoMdSunny /> : <IoIosMoon />
                            }
                        </button>
                <button className="nav__toggle-btn" 
                        onClick={() => setShowNav(!showNav)}>
                            {
                                showNav ? <AiOutlineClose /> : <HiOutlineBars3 />
                            }
                </button>
            </div>
        </div>
    </nav>
  );
};

export default Navbar;