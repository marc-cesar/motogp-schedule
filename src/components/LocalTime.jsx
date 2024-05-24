// src/components/LocalTime.jsx

import React, { useEffect, useState } from 'react';

const LocalTime = ({ dateString, className,onlyDate = false, showDate = true}) => {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    console.log(onlyDate)
    setFormattedDate(formatDateToLocalTime(dateString, onlyDate, showDate));
  }, [dateString]);

  return <span className={className}>{formattedDate}</span>;
};

function formatDateToLocalTime(dateString, onlyDate = false, showDate = true) {
    // Parse the date string into a Date object
    const date = new Date(dateString);
  
    // Function to pad single digit numbers with leading zero
    const padZero = (num) => (num < 10 ? '0' + num : num);
  
    // Get local date components
    const day = padZero(date.getDate());
    const month = padZero(date.getMonth() + 1); // Months are zero-based
    const year = date.getFullYear();

    if(onlyDate){
        return `${day}/${month}/${year}`;
    }
  
    // Get local time components
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
  
    // Format the date and time as dd/MM/yyyy hh:mm
    // Get the first three letters of the day of the week from the Date object
    const dayOfWeek = date.toDateString().slice(0, 3);
    

    return showDate ? `${dayOfWeek} ${day}/${month}/${year} ${hours}:${minutes}`
     : `${dayOfWeek} ${hours}:${minutes}`;
  }

export default LocalTime;