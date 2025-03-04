"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import { calendarEvents } from "@/lib/data";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

const localizer = momentLocalizer(moment);

const BigCalendar = () => {
  const [view, setView] = useState<View>(Views.WEEK);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  return (
    <Calendar
      localizer={localizer}
      events={calendarEvents}
      startAccessor="start"
      endAccessor="end"
      views={["week", "day"]}
      view={view}
      style={{ height: "98%" }}
      onView={handleOnChangeView}
      min={new Date(2025, 2, 3, 8, 0, 0)} // Monday, March 3
      max={new Date(2025, 2, 8, 18, 0, 0)} // Saturday, March 8
      dayPropGetter={(date) => {
        if (moment(date).day() === 0) {
          return { style: { display: "none" } }; // Hide Sunday
        }
        return {};
      }}
      formats={{
        dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
          const adjustedStart = moment(start).day() === 0 ? moment(start).add(1, "day") : moment(start);
          return `${adjustedStart.format("MMMM DD")} - ${moment(end).format("MMMM DD")}`;
        },
      }}
    />
  );
};

export default BigCalendar;
