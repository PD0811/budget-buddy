// Replace all the code in ReportCalendar.tsx with this code

import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './ReportCalendar.css'; 

type DailyTotals = {
  [key: number]: number;
};

type CategoryComparison = {
  category: string;
  currentMonth: number;
  average: number;
  transactionCount: number;
  difference: number;
  percentageChange: number;
};

const ReportCalendar: React.FC = () => {
  const [activeDate, setActiveDate] = useState(new Date());
  const [dailyData, setDailyData] = useState<DailyTotals>({});
  const [categoryData, setCategoryData] = useState<CategoryComparison[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

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

    const fetchCategoryData = async () => {
      setIsLoadingCategories(true);
      const year = activeDate.getFullYear();
      const month = activeDate.getMonth() + 1;

      try {
        const url = `http://localhost:3001/api/reports/monthly-category-comparison?year=${year}&month=${month}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch category data.");
        
        const data = await response.json();
        setCategoryData(data.data);
      } catch (error) {
        console.error(error);
        setCategoryData([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCalendarData();
    fetchCategoryData();
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
      
      {/* Category Comparison Section */}
      <div className="category-comparison-section">
        <h3 style={{ 
          marginBottom: '1rem', 
          fontSize: '1.2rem', 
          color: '#e2e8f0',
          fontWeight: '600'
        }}>
          Monthly Spending by Category vs Average
        </h3>
        
        {isLoadingCategories ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            Loading category data...
          </div>
        ) : categoryData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            No spending data available for this month
          </div>
        ) : (
          <div className="category-grid">
            {categoryData.map((item, index) => (
              <div key={index} className="category-card">
                <div className="category-header">
                  <h4 className="category-name">{item.category}</h4>
                  <span className="transaction-count">{item.transactionCount} transactions</span>
                </div>
                <div className="category-amounts">
                  <div className="amount-row">
                    <span className="amount-label">This Month:</span>
                    <span className="amount-value current">₹{item.currentMonth.toFixed(2)}</span>
                  </div>
                  <div className="amount-row">
                    <span className="amount-label">Average:</span>
                    <span className="amount-value average">₹{item.average.toFixed(2)}</span>
                  </div>
                  <div className="amount-row difference">
                    <span className="amount-label">Difference:</span>
                    <span className={`amount-value ${item.difference >= 0 ? 'positive' : 'negative'}`}>
                      {item.difference >= 0 ? '+' : ''}₹{item.difference.toFixed(2)}
                    </span>
                  </div>
                  <div className="percentage-change">
                    <span className={`percentage ${item.percentageChange >= 0 ? 'positive' : 'negative'}`}>
                      {item.percentageChange >= 0 ? '+' : ''}{item.percentageChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendar Section - Reduced Size */}
      <div className="calendar-container-small">
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
