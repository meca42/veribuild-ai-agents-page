import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/ui/cn';
import { Select } from './Select';

export interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  use24Hour?: boolean;
  className?: string;
}

const padZero = (num: number) => num.toString().padStart(2, '0');

export const TimePicker = ({ value, onChange, placeholder = 'Select time', use24Hour = false, className }: TimePickerProps) => {
  const [hours, setHours] = useState('12');
  const [minutes, setMinutes] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      const hour = parseInt(h);

      if (use24Hour) {
        setHours(padZero(hour));
        setMinutes(m);
      } else {
        if (hour === 0) {
          setHours('12');
          setPeriod('AM');
        } else if (hour < 12) {
          setHours(padZero(hour));
          setPeriod('AM');
        } else if (hour === 12) {
          setHours('12');
          setPeriod('PM');
        } else {
          setHours(padZero(hour - 12));
          setPeriod('PM');
        }
        setMinutes(m);
      }
    }
  }, [value, use24Hour]);

  useEffect(() => {
    let hour = parseInt(hours);

    if (!use24Hour) {
      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }
    }

    const timeString = `${padZero(hour)}:${minutes}`;
    onChange?.(timeString);
  }, [hours, minutes, period, use24Hour, onChange]);

  const hourOptions = use24Hour
    ? Array.from({ length: 24 }, (_, i) => ({ value: padZero(i), label: padZero(i) }))
    : Array.from({ length: 12 }, (_, i) => ({ value: padZero(i + 1), label: padZero(i + 1) }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({ value: padZero(i), label: padZero(i) }));

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Clock
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400 pointer-events-none z-10"
            aria-hidden="true"
          />
          <Select
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="pl-10"
            aria-label="Select hours"
          >
            <option value="" disabled>HH</option>
            {hourOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <span className="text-neutral-500 dark:text-neutral-400">:</span>

        <Select
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          className="flex-1"
          aria-label="Select minutes"
        >
          <option value="" disabled>MM</option>
          {minuteOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        {!use24Hour && (
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'AM' | 'PM')}
            className="w-20"
            aria-label="Select AM or PM"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </Select>
        )}
      </div>
    </div>
  );
};
