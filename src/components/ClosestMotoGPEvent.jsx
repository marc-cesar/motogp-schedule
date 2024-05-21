// src/components/ClosestMotoGPEvent.jsx
import React, { useEffect, useState } from 'react';

const ClosestMotoGPEvent = () => {
  const [closestEvent, setClosestEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Component mounted, fetching events...');
    const fetchEvents = async () => {
      try {
        const response = await fetch('https://api.micheleberardi.com/racing/v1.0/motogp-events?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&year=2024');
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Data fetched:', data);
        const events = data;

        if (!Array.isArray(events) || events.length === 0) {
          throw new Error('No events found');
        }

        const now = new Date();
        const closest = events.reduce((closestEvent, currentEvent) => {
          const currentStartDate = new Date(currentEvent.date_start);
          if (!closestEvent || (currentStartDate < new Date(closestEvent.date_start) && currentStartDate > now)) {
            return currentEvent;
          }
          return closestEvent;
        }, null);

        console.log('Closest event found:', closest);
        setClosestEvent(closest);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!closestEvent) {
    return <p>No upcoming events found.</p>;
  }

  return (
    <div>
      <h1>Closest MotoGP Event</h1>
      <h2>{closestEvent.name}</h2>
      <p>Date: {new Date(closestEvent.date_start).toLocaleDateString()} - {new Date(closestEvent.date_end).toLocaleDateString()}</p>
      <p>Location: {closestEvent.circuit_name}, {closestEvent.country_name}</p>
      <p>Sponsored Name: {closestEvent.sponsored_name}</p>
    </div>
  );
};

export default ClosestMotoGPEvent;
