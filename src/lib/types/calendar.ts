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
    attendees?: Array<{
      email: string;
      name: string;
    }>;
    minAttendees?: number;
    documents?: Array<{
      title: string;
      url: string;
    }>;
  };
}

export interface EventClickInfo {
  event: CalendarEvent;
  el: HTMLElement;
  jsEvent: MouseEvent;
  view: {
    type: string;
    calendar: unknown;
  };
}

export interface EventContentArg {
  event: CalendarEvent;
  view: string;
}
