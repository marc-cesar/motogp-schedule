import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import LocalTime from '../components/LocalTime.jsx';

const fetchEvents = async () => {
  try {
    const response = await fetch('https://mototiming.live/api/schedule?filter=upcoming');
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    return data.calendar[0];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

const fetchEventSchedule = async (eventId) => {
  try {
    const response = await fetch(`https://mototiming.live/api/schedule?event=${eventId}`);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching event schedule:', error);
    return [];
  }
};

const NextGrandPrix = () => {
  const [closestEvent, setClosestEvent] = useState(null);
  const [eventSchedule, setEventSchedule] = useState([]);
  const [mainEvents, setMainEvents] = useState([]);
  const [isSameWeek, setIsSameWeek] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const event = await fetchEvents();
      setClosestEvent(event);
      if (event && event.id) {
        const schedule = await fetchEventSchedule(event.id);
        setEventSchedule(schedule.sessions || []);
        const mainEvents = schedule.sessions.filter(session => session.class === 'MotoGP');
        setMainEvents(mainEvents);
        setIsSameWeek(dayjs().isSame(dayjs(event.start_date), "week"));
      }
    };
    fetchData();
  }, []);

  const getSession = (shortName) => {
    return mainEvents.find(session => session.session_short_name === shortName);
  };

  return (
    <section className="bg-black p-10">
      <div className="min-h-52 flex flex-col w-full justify-center">
        <h2 className="w-full text-white pb-10 font-semibold text-4xl uppercase text-center">{closestEvent ? 'Next Grand Prix' : 'Loading...'} </h2>
        {!closestEvent ? '' :
            (
                <div className="flex flex-col md:flex-row flex-grow justify-center items-start w-full max-w-screen-xl mx-auto">
                <div className="flex flex-col items-center flex-1 p-4 border-b md:border-b-0 border-gray-500 md:h-full">
                  <h3 className="text-white text-3xl text-center pb-3 font-semibold">{closestEvent.name ?? ""}</h3>
                  <p className="text-white text-2xl p-4 text-center">
                    <LocalTime onlyDate={true} className="text-white text-2xl" dateString={closestEvent.start_date} client:load /> - <LocalTime onlyDate={true} showDate={true} className="text-white text-2xl" dateString={closestEvent.end_date} client:load />
                  </p>
                  <p className="text-4xl text-red-500">{isSameWeek ? "RACE WEEK" : ""}</p>
                </div>
                <div className="flex flex-col text-center items-center md:border-l flex-1 p-4 md:h-full w-full">
                  <p className="text-white text-lg">FP1: <LocalTime onlyDate={false} showDate={false} className="text-white text-lg" dateString={getSession('FP1')?.start_datetime_local} client:load /></p>
                  <p className="text-white text-lg">Practice: <LocalTime onlyDate={false} showDate={false} className="text-white text-lg" dateString={getSession('PR')?.start_datetime_local} client:load /></p>
                  <p className="text-white text-lg">FP2: <LocalTime onlyDate={false} showDate={false} className="text-white text-lg" dateString={getSession('FP2')?.start_datetime_local} client:load /></p>
                  <p className="text-white text-lg">Q1: <LocalTime onlyDate={false} showDate={false} className="text-white text-lg" dateString={getSession('Q1')?.start_datetime_local} client:load /></p>
                  <p className="text-white text-lg">Q2: <LocalTime onlyDate={false} showDate={false} className="text-white text-lg" dateString={getSession('Q2')?.start_datetime_local} client:load /></p>
                  <p className="text-white text-lg">Sprint: <LocalTime onlyDate={false} showDate={false} className="text-white text-lg" dateString={getSession('SPR')?.start_datetime_local} client:load /></p>
                  <p className="text-white text-lg">Race: <LocalTime onlyDate={false} showDate={false} className="text-white text-lg" dateString={getSession('RAC')?.start_datetime_local} client:load /></p>
                </div>
              </div>

            )
        }
        </div>
    </section>
  );
};

export default NextGrandPrix;