import React, { useEffect, useState } from 'react';
import Spinner from './Spinner';
import {
    fetchFinishedEvents,
    fetchSessionResults,
    fetchStandings,
    type RaceEvent,
    type Rider,
} from '../lib/motogp';

const StandingsAndResults: React.FC = () => {
    const [standings, setStandings] = useState<Rider[]>([]);
    const [isStandings, setIsStandings] = useState(true);
    const [selectedSession, setSelectedSession] = useState('RAC');
    const [selectedEvent, setSelectedEvent] = useState('');
    const [allEvents, setAllEvents] = useState<RaceEvent[]>([]);
    const [results, setResults] = useState<Rider[]>([]);
    const [missingImages, setMissingImages] = useState<Set<string>>(new Set());
    const [isTimedSession, setIsTimedSession] = useState(false);
    const [loadingStandings, setLoadingStandings] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);

    useEffect(() => {
        fetchStandings()
            .then(setStandings)
            .catch((error) => console.error('Error fetching standings:', error))
            .finally(() => setLoadingStandings(false));

        fetchFinishedEvents()
            .then((events) => {
                setAllEvents(events);
                if (events.length > 0) setSelectedEvent(events[0].id);
            })
            .catch((error) => console.error('Error fetching events:', error))
            .finally(() => setLoadingEvents(false));
    }, []);

    useEffect(() => {
        if (!selectedEvent) return;

        let cancelled = false;
        setLoadingResults(true);
        fetchSessionResults(selectedEvent, selectedSession)
            .then((riders) => {
                if (!cancelled) setResults(riders);
            })
            .catch((error) => console.error('Error fetching results:', error))
            .finally(() => {
                if (!cancelled) setLoadingResults(false);
            });
        return () => {
            cancelled = true;
        };
    }, [selectedSession, selectedEvent]);

    const getTextColor = (backgroundColor: string | null) => {
        if (backgroundColor == null) return 'text-black';
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? 'text-black' : 'text-white';
    };

    const errorImageNotFound = (riderNumber: string) => {
        setMissingImages(prev => new Set(prev).add(riderNumber));
    };

    const toggleView = (option: 'standings' | 'results') => {
        setIsStandings(option === 'standings');
    };

    const handleSessionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSession(event.target.value);
        var timedSessions = ['Q2', 'Q1', 'FP2', 'PR','WUP', 'FP1'];
        console.log('Selected session:', event.target.value);
        // Check if the event is a timed session
        if (timedSessions.includes(event.target.value)) {
            setIsTimedSession(true);
        } else 
            setIsTimedSession(false);
    };

    const handleEventChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedEvent(event.target.value);
    };


    const rows = isStandings ? standings : results;
    const isLoading = isStandings ? loadingStandings : loadingEvents || loadingResults;

    return (
        <section className="bg-white pt-10 md:mx-20">
            <div className="text-center pb-5">
                <ul className="flex justify-center border-b">
                    <li className="-mb-px mr-1 tab">
                        <a
                            className={`cursor-pointer bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 ${
                                isStandings ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-blue-700'
                            } text-lg font-bold`}
                            onClick={() => toggleView('standings')}
                        >
                            Standings
                        </a>
                    </li>
                    <li className="mr-1">
                        <a
                            className={`cursor-pointer bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 ${
                                !isStandings ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 hover:text-blue-700'
                            } text-lg font-bold`}
                            onClick={() => toggleView('results')}
                        >
                            Results
                        </a>
                    </li>
                </ul>
            </div>

            <div className="text-center text-2xl font-bold pb-5 pt-5">
                {isStandings ? 'MotoGP Standings' : 'Session Results'}
            </div>

            {!isStandings ? (
                <div className='flex flex-col md:flex-row items-center pb-5 space-y-4 md:space-y-0 md:space-x-8'>
                <div className='flex items-center space-x-3'>
                    <label htmlFor="event-select" className="text-lg font-bold">GP:</label>
                    <select id="event-select" value={selectedEvent} onChange={handleEventChange} className="border p-2 rounded max-w-52 xl:max-w-80 truncate">
                        {allEvents.map((event) => (
                            <option key={event.id} value={event.id}>{event.name}</option>
                        ))}
                    </select>
                </div>
                <div className='flex items-center space-x-3'>
                    <label htmlFor="class-select" className="text-lg font-bold">Session:</label>
                    <select id="class-select" value={selectedSession} onChange={handleSessionChange} className="border p-2 rounded">
                        <option value="RAC">Race</option>
                        <option value="SPR">Sprint</option>
                        <option value="WUP">Warm-up</option>
                        <option value="Q2">Q2</option>
                        <option value="Q1">Q1</option>
                        <option value="FP2">FP2</option>
                        <option value="PR">Practice</option>
                        <option value="FP1">FP1</option>
                    </select>
                </div>
                {isLoading ? (
                    <div className="flex items-center space-x-2 text-red-500 font-bold" role="status">
                        <Spinner className="w-5 h-5" />
                        <span>Loading…</span>
                    </div>
                ) : null}
            </div>
            )            
            : ''}

            <div className="relative" aria-busy={isLoading}>
            {isLoading && rows.length > 0 ? (
                <div className="absolute inset-0 z-10 flex justify-center pt-24 pointer-events-none">
                    <div className="flex items-center space-x-3 bg-white shadow-lg rounded-full px-5 py-3 text-red-500 font-bold h-fit">
                        <Spinner className="w-6 h-6" />
                        <span>Loading…</span>
                    </div>
                </div>
            ) : null}
            <table className={`min-w-full divide-y divide-gray-200 transition-opacity duration-200 ${isLoading && rows.length > 0 ? 'opacity-40' : ''}`}>
                <thead className="bg-gray-50">
                    <tr>
                        <th className="text-center py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pos
                        </th>
                        <th className="py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '3%' }}>
                            Number
                        </th>
                        <th className="py-3 pl-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        <th className="py-3 pl-7 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Team</th>
                        {!isStandings ? null : 
                            <th className="py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Points
                            </th>
                        }

                        {isStandings ? null : (
                            <th className="py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {isTimedSession ? 'Time' : 'Gap to Leader'}
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading && rows.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-16">
                                <div className="flex flex-col items-center space-y-3 text-red-500 font-bold" role="status">
                                    <Spinner className="w-10 h-10" />
                                    <span>Loading…</span>
                                </div>
                            </td>
                        </tr>
                    ) : null}
                    {!isLoading && rows.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-16 text-center text-gray-400 font-bold">
                                No data available
                            </td>
                        </tr>
                    ) : null}
                    {rows.map((rider, index) => (
                        <tr id={rider.number} className="hover:bg-gray-100" key={rider.number}>
                            <td className="py-4 whitespace-nowrap md:text-xl text-center text-sm font-medium text-gray-900">
                                {index + 1}
                            </td>
                            <td className="py-2 h-14 w-5 sm:w-10 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                                <div
                                    className={`w-10 md:w-14 text-xl md:text-2xl lg:text-3xl h-full flex font-black items-center justify-center rounded ${getTextColor(rider.color)}`}
                                    style={{ backgroundColor: rider.color ?? undefined }}
                                >
                                    {rider.number}
                                </div>
                            </td>
                            {missingImages.has(rider.number) ? (
                                <td className="w-5 whitespace-nowrap text-base md:text-xl font-bold text-gray-500">
                                    
                                </td>
                            ) : (
                                <td className="w-5 whitespace-nowrap text-base md:text-xl font-bold text-gray-500">
                                    <div className="w-10 lg:w-20 max-h-28 max-w-xs overflow-hidden relative">
                                        <img
                                            className="object-cover transform image-translate"
                                            src={`/assets/riders/${rider.number.toString()}.png`}
                                            onError={() => errorImageNotFound(rider.number)}
                                            alt={`Rider ${rider.number}`}
                                        />
                                    </div>
                                </td>
                            )}
                            <td className="pl-2 sm:pl-7 py-4 whitespace-nowrap text-sm sm:text-base md:text-xl font-bold text-gray-500">
                                {rider.name}
                            </td>
                            <td className="py-4 whitespace-nowrap text-xl text-gray-400 hidden lg:table-cell">{rider.team}</td>
                            {!isStandings ? null : (
                                <td className="py-4 whitespace-nowrap text-center md:text-xl text-gray-500 font-black">
                                    {rider.points}
                                </td>)
                            }

                            {isStandings ? null : (
                                <td className="py-4 whitespace-nowrap text-center text-xs md:text-xl text-gray-500 font-black">
                                    { rider.position == null ? 'DNF' : (isTimedSession ? rider.best_lap : rider.gap_to_leader == "0.000" ? rider.time : '+' + rider.gap_to_leader)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </section>
    );
};

export default StandingsAndResults;
