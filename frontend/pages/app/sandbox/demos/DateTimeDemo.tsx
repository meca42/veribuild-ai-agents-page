import { useState } from 'react';
import { DatePicker, DateRangePicker } from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker';
import { FormRow } from '@/components/ui/FormRow';

export const DateTimeDemo = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>('');
  const [time24, setTime24] = useState<string>('');

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Date Picker</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormRow label="Select a Date" htmlFor="date-picker">
            <DatePicker
              value={date}
              onChange={setDate}
              placeholder="Choose a date"
            />
          </FormRow>

          <FormRow label="Selected Date" htmlFor="date-display">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-neutral-100">
              {date ? date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'No date selected'}
            </div>
          </FormRow>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Date Picker with Min/Max</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Limited to the next 30 days
        </p>
        <FormRow label="Select Future Date" htmlFor="future-date">
          <DatePicker
            placeholder="Choose a date within 30 days"
            minDate={new Date()}
            maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
          />
        </FormRow>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Date Range Picker</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormRow label="Select Date Range" htmlFor="date-range">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end || undefined);
              }}
              placeholder="Choose date range"
            />
          </FormRow>

          <FormRow label="Selected Range" htmlFor="range-display">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-neutral-100">
              {startDate && endDate ? (
                <>
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                  <br />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    ({Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days)
                  </span>
                </>
              ) : startDate ? (
                `${startDate.toLocaleDateString()} (select end date)`
              ) : (
                'No range selected'
              )}
            </div>
          </FormRow>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Time Picker (12-hour)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormRow label="Select Time" htmlFor="time-picker">
            <TimePicker
              value={time}
              onChange={setTime}
              placeholder="Choose a time"
            />
          </FormRow>

          <FormRow label="Selected Time" htmlFor="time-display">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-neutral-100">
              {time || 'No time selected'}
            </div>
          </FormRow>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Time Picker (24-hour)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormRow label="Select Time (24-hour format)" htmlFor="time-picker-24">
            <TimePicker
              value={time24}
              onChange={setTime24}
              use24Hour
              placeholder="Choose a time"
            />
          </FormRow>

          <FormRow label="Selected Time" htmlFor="time-display-24">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-neutral-100">
              {time24 || 'No time selected'}
            </div>
          </FormRow>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Combined Date & Time</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Example: Schedule a meeting
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormRow label="Meeting Date" htmlFor="meeting-date" required>
            <DatePicker placeholder="Select date" minDate={new Date()} />
          </FormRow>
          <FormRow label="Meeting Time" htmlFor="meeting-time" required>
            <TimePicker placeholder="Select time" />
          </FormRow>
        </div>
      </div>
    </div>
  );
};
