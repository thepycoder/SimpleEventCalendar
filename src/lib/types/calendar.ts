import type { EventInput } from '@event-calendar/core';

export interface CalendarEvent extends EventInput {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor?: string;
  allDay?: boolean;
  extendedProps?: {
    description?: string;
    location?: string;
    attendees?: string[];
  };
}

export interface EventClickInfo {
  event: CalendarEvent;
  el: HTMLElement;
  jsEvent: MouseEvent;
}

export interface EventContentArg {
  event: CalendarEvent;
  view: string;
}
