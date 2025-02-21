import { db } from '$lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import type { CalendarEvent } from '$lib/types/calendar';

const MAIL_COLLECTION = 'system';

export async function sendEventJoinEmail(event: CalendarEvent, attendeeEmail: string, attendeeName: string) {
  // Check if we've already sent an email for this event/attendee combination
  const q = query(
    collection(db, MAIL_COLLECTION), 
    where('eventId', '==', event.id),
    where('attendeeEmail', '==', attendeeEmail)
  );
  
  const existing = await getDocs(q);
  if (!existing.empty) {
    return; // Email already sent
  }

  // Format the event time
  const startTime = event.start.toLocaleString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Create HTML email content
  // Format document links if they exist
  const documentLinks = event.extendedProps?.documents 
    ? event.extendedProps.documents
        .map(doc => `<p><a href="${doc.url}">${doc.title}</a></p>`)
        .join('\n')
    : '';

  const htmlContent = `
    <h2>Bedankt voor je aanmelding!</h2>
    <p>Beste ${attendeeName},</p>
    <p>Je hebt je aangemeld voor het volgende evenement:</p>
    <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
      <h3>${event.title}</h3>
      <p><strong>Wanneer:</strong> ${startTime}</p>
      ${event.extendedProps?.location ? `<p><strong>Waar:</strong> ${event.extendedProps.location}</p>` : ''}
      ${event.extendedProps?.description ? `<p><strong>Beschrijving:</strong> ${event.extendedProps.description}</p>` : ''}
      ${documentLinks ? `<div style="margin-top: 15px;"><strong>Documenten:</strong>${documentLinks}</div>` : ''}
    </div>
    <p>We kijken ernaar uit je te zien!</p>
  `;

  // Create plain text version
  const documentLinksText = event.extendedProps?.documents
    ? '\n\nDocumenten:\n' + 
      event.extendedProps.documents
        .map(doc => `${doc.title}: ${doc.url}`)
        .join('\n')
    : '';

  const textContent = `
    Bedankt voor je aanmelding!
    
    Beste ${attendeeName},
    
    Je hebt je aangemeld voor het volgende evenement:
    
    ${event.title}
    Wanneer: ${startTime}
    ${event.extendedProps?.location ? `Waar: ${event.extendedProps.location}` : ''}
    ${event.extendedProps?.description ? `Beschrijving: ${event.extendedProps.description}` : ''}${documentLinksText}
    
    We kijken ernaar uit je te zien!
  `;

  // Add the email to Firestore
  await addDoc(collection(db, MAIL_COLLECTION), {
    to: attendeeEmail,
    eventId: event.id,
    attendeeEmail: attendeeEmail,
    createdAt: serverTimestamp(),
    message: {
      subject: `Aanmelding bevestigd: ${event.title}`,
      html: htmlContent,
      text: textContent,
    },
    replyTo: "info@ekoli.be"
  });
}
