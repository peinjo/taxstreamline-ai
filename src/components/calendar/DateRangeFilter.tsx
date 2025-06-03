
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { FilterState } from "./AdvancedEventFilters";

interface DateRangeFilterProps {
  dateRange: FilterState['dateRange'];
  onDateRangeChange: (dateRange: { from?: Date; to?: Date }) => void;
}

export function DateRangeFilter({ dateRange, onDateRangeChange }: DateRangeFilterProps) {
  // Convert our dateRange to proper DateRange format for the calendar
  const calendarDateRange: DateRange | undefined = dateRange.from || dateRange.to 
    ? {
        from: dateRange.from,
        to: dateRange.to
      }
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd")} -{" "}
                {format(dateRange.to, "LLL dd")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange.from}
          selected={calendarDateRange}
          onSelect={(selectedRange: DateRange | undefined) => {
            onDateRangeChange({
              from: selectedRange?.from,
              to: selectedRange?.to
            });
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
