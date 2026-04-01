import React, { useEffect } from 'react';  
import { useNavigate } from 'react-router-dom';
import image from '../assets/404.gif';

const ErrorPage = () => {
  const navigate = useNavigate();


  //redirect user to previous page after 5 seconds
  useEffect(() => {
    setTimeout(() => {
      navigate(-1); // Navigate back to the previous page
    }, 6000); // Redirect after 5 seconds
  });
  return (
   <section className='errorPage'>
    <div className ='errorPage__container'>
      <img src={image} alt="404 Error" />
      <h1>404</h1>
      <h3>Page Not Found</h3>
      <p>Sorry, the page you are looking for does not exist.
        You will be redirected to the previous page in a few seconds.
      </p>
    </div>
   </section>
  );
};

export default ErrorPage;