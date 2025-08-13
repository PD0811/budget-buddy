// Replace all the code in ReportCalendar.tsx with this code

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './ReportCalendar.css'; 

type DailyTotals = {
  [key: number]: number;
};

const ReportCalendar: React.FC = () => {
  const [activeDate, setActiveDate] = useState(new Date());
  const [dailyData, setDailyData] = useState<DailyTotals>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCalendarData = async () => {
      setIsLoading(true);
      const year = activeDate.getFullYear();
      const month = activeDate.getMonth() + 1;

      try {
        const url = `http://localhost:3001/api/reports/calendar?year=${year}&month=${month}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch calendar data.");
        
        const data: DailyTotals = await response.json();
        setDailyData(data);
      } catch (error) {
        console.error(error);
        setDailyData({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, [activeDate]);

  const tileClassName = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const day = date.getDate();
      if (dailyData[day] > 0) {
        return 'day-with-expense';
      }
    }
    return null;
  };
  
  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const day = date.getDate();
      const spent = dailyData[day];

      if (spent > 0) {
        return (
          // --- THE ONLY CHANGE IS HERE: Changed $ to ₹ ---
          <div className="expense-chip">
            ₹{spent.toFixed(2)}
          </div>
        );
      }
    }
    return null;
  };

  const handleActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
    if (activeStartDate) {
      setActiveDate(activeStartDate);
    }
  };

  return (
    <div className="report-calendar-page">
      <h2 className="report-title">Daily Expense Calendar</h2>
      <div className="calendar-container">
        {isLoading && (
          <div className="loader-overlay">
            <div className="loader-spinner"></div>
          </div>
        )}
        <Calendar
          onActiveStartDateChange={handleActiveStartDateChange}
          value={activeDate}
          tileClassName={tileClassName}
          tileContent={tileContent}
        />
      </div>
    </div>
  );
};

export default ReportCalendar;
