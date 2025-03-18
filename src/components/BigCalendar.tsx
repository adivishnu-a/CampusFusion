"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

const localizer = momentLocalizer(moment);

// Custom event component to better control the display of event information
const EventComponent = ({ event }: { event: { title: string; start: Date; end: Date } }) => (
  <div className="event-content p-1">
    <div className="event-time text-xs">
      {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
    </div>
    <div className="event-title text-sm">{event.title}</div>
  </div>
);

const BigCalendar = ({
  data,
}: {
  data: { title: string; start: Date; end: Date }[];
}) => {
  const [view, setView] = useState<View>(Views.WEEK);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  return (
    <Calendar
      localizer={localizer}
      events={data}
      startAccessor="start"
      endAccessor="end"
      views={["week", "day"]}
      view={view}
      style={{ height: "98%" }}
      onView={handleOnChangeView}
      defaultView={Views.WEEK}
      min={new Date(2024, 0, 1, 8, 0)} // Set min time to 8:00 AM
      max={new Date(2024, 0, 1, 18, 0)} // Set max time to 6:00 PM
      dayPropGetter={(date) => {
        const day = moment(date).day();
        if (day === 0) {
          return { style: { display: "none" } }; // Hide Sunday
        }
        return {};
      }}
      formats={{
        dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
          const adjustedStart = moment(start).day() === 0 ? moment(start).add(1, "day") : moment(start);
          return `${adjustedStart.format("MMMM DD")} - ${moment(end).format("MMMM DD")}`;
        },
        dayHeaderFormat: (date: Date) => {
          return moment(date).format("dddd");
        }
      }}
      components={{
        event: EventComponent
      }}
      timeslots={2}
      step={30}
    />
  );
};

export default BigCalendar;
