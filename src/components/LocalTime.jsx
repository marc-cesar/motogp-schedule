// src/components/LocalTime.jsx

import React, { useEffect, useState } from 'react';

const LocalTime = ({ dateString, className }) => {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(formatDateToLocalTime(dateString));
  }, [dateString]);

  return <span className={className}>{formattedDate}</span>;
};

function formatDateToLocalTime(dateString) {
    // Parse the date string into a Date object
    const date = new Date(dateString);
  
    // Function to pad single digit numbers with leading zero
    const padZero = (num) => (num < 10 ? '0' + num : num);
  
    // Get local date components
    const day = padZero(date.getDate());
    const month = padZero(date.getMonth() + 1); // Months are zero-based
    const year = date.getFullYear();
  
    // Get local time components
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
  
    // Format the date and time as dd/MM/yyyy hh:mm
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

export default LocalTime;