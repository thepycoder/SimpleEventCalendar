import { db } from '$lib/firebase';
import type { CalendarEvent } from '$lib/types/calendar';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';

const EVENTS_COLLECTION = 'events';

// Convert Firestore timestamp to Date
function convertFromFirestore(data: any): CalendarEvent {
  return {
    id: data.id,
    title: data.title,
    start: data.start.toDate(),
    end: data.end.toDate(),
    backgroundColor: data.backgroundColor,
    allDay: data.allDay,
    extendedProps: data.extendedProps
  };
}

// Convert Date to Firestore timestamp
function convertToFirestore(event: Partial<CalendarEvent>) {
  const firestoreEvent: any = {
    title: event.title,
    start: Timestamp.fromDate(new Date(event.start as Date)),
    end: Timestamp.fromDate(new Date(event.end as Date)),
  };

  if (event.backgroundColor !== undefined) {
    firestoreEvent.backgroundColor = event.backgroundColor;
  }

  if (event.allDay !== undefined) {
    firestoreEvent.allDay = event.allDay;
  }

  if (event.extendedProps) {
    firestoreEvent.extendedProps = {};
    
    if (event.extendedProps.description) {
      firestoreEvent.extendedProps.description = event.extendedProps.description;
    }
    
    if (event.extendedProps.location) {
      firestoreEvent.extendedProps.location = event.extendedProps.location;
    }
    
    if (event.extendedProps.attendees) {
      firestoreEvent.extendedProps.attendees = event.extendedProps.attendees;
    }
  }

  return firestoreEvent;
}

export async function fetchEvents(): Promise<CalendarEvent[]> {
  const eventsQuery = query(collection(db, EVENTS_COLLECTION));
  const querySnapshot = await getDocs(eventsQuery);
  
  return querySnapshot.docs.map(doc => ({
    ...convertFromFirestore({
      id: doc.id,
      ...doc.data()
    })
  }));
}

export async function createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
  const eventData = convertToFirestore(event);
  const docRef = await addDoc(collection(db, EVENTS_COLLECTION), eventData);
  return {
    ...event,
    id: docRef.id
  } as CalendarEvent;
}

export async function updateEvent(event: CalendarEvent): Promise<void> {
  const eventData = convertToFirestore(event);
  const eventRef = doc(db, EVENTS_COLLECTION, event.id);
  await updateDoc(eventRef, eventData);
}

export async function updateEventAttendees(eventId: string, attendees: Array<{email: string; name: string}>): Promise<void> {
  const eventRef = doc(db, EVENTS_COLLECTION, eventId);
  await updateDoc(eventRef, {
    'extendedProps.attendees': attendees
  });
}

export async function deleteEvent(eventId: string): Promise<void> {
  const eventRef = doc(db, EVENTS_COLLECTION, eventId);
  await deleteDoc(eventRef);
}
