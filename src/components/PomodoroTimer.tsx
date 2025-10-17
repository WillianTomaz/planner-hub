import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faRedo } from '@fortawesome/free-solid-svg-icons';

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export const PomodoroTimer: React.FC = () => {
    const [timeRemaining, setTimeRemaining] = useState(WORK_TIME);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const resetTimer = useCallback(() => {
        setIsActive(false);
        setTimeRemaining(isBreak ? BREAK_TIME : WORK_TIME);
    }, [isBreak]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prevTime => prevTime - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            new Audio('https://assets.mixkit.co/active_storage/sfx/933/933-preview.mp3').play(); // TODO: Substituir com os audios que eu baixei
            setIsBreak(prevIsBreak => !prevIsBreak);
            setTimeRemaining(isBreak ? WORK_TIME : BREAK_TIME);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isActive, timeRemaining, isBreak]);

    const statusText = useMemo(() => {
        if (isActive) {
            return isBreak ? 'BREAK TIME' : 'FOCUS TIME';
        }
        return isBreak ? 'Ready for Break' : 'Ready for Focus';
    }, [isActive, isBreak]);

    const statusClass = isActive ? 'pomodoro-active-btn' : '';

    return (
        <div className="pomodoro-container">
            <div className="pomodoro-time">
                {formatTime(timeRemaining)}
            </div>
            <div className="pomodoro-controls">
                <button
                    onClick={() => setIsActive(prev => !prev)}
                    className={statusClass}
                >
                    <FontAwesomeIcon icon={isActive ? faPause : faPlay} /> {isActive ? 'PAUSE' : 'START'}
                </button>
                <button
                    onClick={resetTimer}
                    style={{ marginLeft: '8px' }}
                >
                    <FontAwesomeIcon icon={faRedo} /> RESET
                </button>
            </div>
            <div className="pomodoro-status">
                {statusText}
            </div>
        </div>
    );
};