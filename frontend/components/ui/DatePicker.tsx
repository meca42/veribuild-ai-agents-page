import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/ui/cn';
import { Input } from './Input';
import { Button } from './Button';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange?: (startDate: Date, endDate: Date | null) => void;
  placeholder?: string;
  className?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

export const DatePicker = ({ value, onChange, placeholder = 'Select date', minDate, maxDate, className }: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handleDateSelect = (day: number) => {
    const selected = new Date(year, month, day);

    if (minDate && selected < minDate) return;
    if (maxDate && selected > maxDate) return;

    onChange?.(selected);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(year, month, day);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    return value.getDate() === day && value.getMonth() === month && value.getFullYear() === year;
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Input
          value={value ? formatDate(value) : ''}
          placeholder={placeholder}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer pr-10"
          aria-label="Select date"
        />
        <Calendar
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={handlePrevMonth} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {MONTHS[month]} {year}
            </div>
            <Button variant="ghost" size="sm" onClick={handleNextMonth} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 p-2">
                {day}
              </div>
            ))}

            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isDateDisabled(day);
              const selected = isSelected(day);

              return (
                <button
                  key={day}
                  onClick={() => !disabled && handleDateSelect(day)}
                  disabled={disabled}
                  className={cn(
                    'w-8 h-8 text-sm rounded-lg transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    selected
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700',
                    disabled && 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed hover:bg-transparent'
                  )}
                  aria-label={`Select ${day}`}
                  aria-selected={selected}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const DateRangePicker = ({ startDate, endDate, onChange, placeholder = 'Select date range', className }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState<Date | null>(null);

  const formatRange = () => {
    if (!startDate) return '';
    const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!endDate) return start;
    const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  };

  const handleDateClick = (date: Date) => {
    if (!tempStart) {
      setTempStart(date);
    } else {
      const [start, end] = tempStart < date ? [tempStart, date] : [date, tempStart];
      onChange?.(start, end);
      setTempStart(null);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Input
          value={formatRange()}
          placeholder={placeholder}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer pr-10"
          aria-label="Select date range"
        />
        <Calendar
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <DatePicker
            value={tempStart || startDate}
            onChange={handleDateClick}
          />
        </div>
      )}
    </div>
  );
};
