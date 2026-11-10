import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import LocalTime from '../components/LocalTime.jsx';
import { fetchUpcomingEvent } from '../lib/motogp';

const NextGrandPrix = () => {
  const [closestEvent, setClosestEvent] = useState(null);
  const [isSameWeek, setIsSameWeek] = useState(false);

  useEffect(() => {
    fetchUpcomingEvent()
      .then((event) => {
        setClosestEvent(event);
        if (event) setIsSameWeek(dayjs().isSame(dayjs(event.start_date), 'week'));
      })
      .catch((error) => console.error('Error fetching next event:', error));
  }, []);

  const getSessionStart = (shortName) => closestEvent?.sessions[shortName];

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
                  <p className="text-white text-lg">FP1: <LocalTime onlyDate={false} showDate={false} className="text-white text-lg" dateString={getSessionStart('FP1')} client:load /></p>
                  <p className="text-white text-lg">Practice: <LocalTime onlyDate={false} showDate={false} className="text-white text-lg" dateString={getSessionStart('PR')} client:load /></p>
                  <p className="text-white text-lg">FP2: <LocalTime onlyDate={false} showDate={false} className="text-white text-lg" dateString={getSessionStart('FP2')} client:load /></p>
                  <p className="text-white text-lg">Q1: <LocalTime onlyDate={false} showDate={false} className="text-white text-lg" dateString={getSessionStart('Q1')} client:load /></p>
                  <p className="text-white text-lg">Q2: <LocalTime onlyDate={false} showDate={false} className="text-white text-lg" dateString={getSessionStart('Q2')} client:load /></p>
                  <p className="text-white text-lg">Sprint: <LocalTime onlyDate={false} showDate={false} className="text-white text-lg" dateString={getSessionStart('SPR')} client:load /></p>
                  <p className="text-white text-lg">Race: <LocalTime onlyDate={false} showDate={false} className="text-white text-lg" dateString={getSessionStart('RAC')} client:load /></p>
                </div>
              </div>

            )
        }
        </div>
    </section>
  );
};

export default NextGrandPrix;