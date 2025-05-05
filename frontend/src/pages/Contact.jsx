import React, { useState } from 'react';
import '../css/Contact.css';

const Contact = () => {
  const [ripples, setRipples] = useState([]);

  // Function to create the water ripple effect
  // const handleMouseMove = (event) => {
  //   const ripple = {
  //     x: event.clientX,
  //     y: event.clientY,
  //     id: Date.now(),
  //   };
  //   setRipples((prevRipples) => [...prevRipples, ripple]);
  //   setTimeout(() => {
  //     setRipples((prevRipples) => prevRipples.filter((r) => r.id !== ripple.id));
  //   }, 1000);
  // };

  return (
    <div className="contact-page" >
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="ripple"
          style={{
            left: `${ripple.x - 50}px`,
            top: `${ripple.y - 50}px`,
          }}
        />
      ))}

      <div className="contact-container">
        <h1 className="contact-heading">About Our Company</h1>
        <p className="contact-subheading">We are a premier online platform dedicated to bringing the best books to your doorstep. Our mission is to connect readers with a wide variety of literature and make book buying an enjoyable and convenient experience.</p>
        <p className="contact-description">
          Founded with the goal of making books easily accessible, we offer a seamless platform for browsing, purchasing, and receiving your favorite books. Whether you're a casual reader or a literature enthusiast, we provide a comprehensive collection of books across various genres, carefully curated to meet diverse interests.
        </p>
        <h2 className="contact-heading">Contact Us</h2>
        <p className="contact-details">
          We are here to assist you with any inquiries, order issues, or book recommendations. Feel free to get in touch with us via the contact details below:
        </p>

        <div className="contact-info">
          <p><strong>Phone:</strong> +91 7022632653</p>
          <p><strong>Phone:</strong> +91 7000841995</p>
          <p><strong>Email:</strong> booklovers4u@gmail.com</p>
        </div>

        <div className="contact-buttons">
          {/* <a href="tel:+1234567890" className="contact-button">Call Us</a> */}
          <a href="https://wa.me/7022632653" target="_blank" rel="noopener noreferrer" className="contact-button whatsapp">Chat on WhatsApp</a>
          <a
            href="https://www.instagram.com/book_lovers_india?igsh=ZmhlZGo2M3ltanIx"
            className="instagram-float"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow Us on Instagram"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/174/174855.png"
              alt="Follow Us on Instagram"
              className="instagram-icon"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
