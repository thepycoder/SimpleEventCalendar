<script lang="ts">
  import "$lib/styles/modal.css";
  import type { CalendarEvent } from "$lib/types/calendar";
  import { createEventDispatcher } from "svelte";
  import { currentUser, userProfile } from "$lib/stores/auth";
  import { updateEventAttendees } from "$lib/services/events";

  function generateCalendarLinks(event: CalendarEvent) {
    // Format date to calendar format (YYYYMMDDTHHMMSSZ)
    function formatDateForCalendar(date: Date): string {
      return date.toISOString().replace(/-|:|\.\d+/g, "");
    }

    const start = formatDateForCalendar(new Date(event.start));
    const end = formatDateForCalendar(new Date(event.end));
    const title = encodeURIComponent(event.title);
    const description = encodeURIComponent(
      event.extendedProps?.description || ""
    );
    const location = encodeURIComponent(event.extendedProps?.location || "");

    // Generate links for different calendar types
    const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${description}&location=${location}`;

    // For Apple/Outlook calendar, we'll generate an ICS file
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${event.extendedProps?.description || ""}
LOCATION:${event.extendedProps?.location || ""}
END:VEVENT
END:VCALENDAR`;

    return {
      google,
      ics: "text/calendar;charset=utf-8," + encodeURIComponent(ics),
    };
  }

  function copyEmails(attendees: Array<{ email: string; name: string }>) {
    const emails = attendees.map((a) => a.email).join(", ");
    navigator.clipboard.writeText(emails);
  }

  const dispatch = createEventDispatcher();

  const DAYS_NL = [
    "Zondag",
    "Maandag",
    "Dinsdag",
    "Woensdag",
    "Donderdag",
    "Vrijdag",
    "Zaterdag",
  ];
  const MONTHS_NL = [
    "Jan",
    "Feb",
    "Mrt",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dec",
  ];

  function formatEventDateTime(start: Date, end: Date): string {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const dayName = DAYS_NL[startDate.getDay()];
    const day = startDate.getDate();
    const month = MONTHS_NL[startDate.getMonth()];
    const year = startDate.getFullYear();

    const startTime = startDate.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = endDate.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const durationMs = endDate.getTime() - startDate.getTime();

    return `${dayName} ${day} ${month}, ${year} van ${startTime} tot ${endTime}`;
  }

  export let event: CalendarEvent;
  export let onClose: () => void;
  export let onEdit: (event: CalendarEvent) => void;

  function handleOutsideClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-backdrop" on:click={handleOutsideClick}>
  <div class="modal">
    <div class="modal-header">
      <div class="action-buttons">
        {#if $currentUser}
          <button class="edit-button" on:click={() => onEdit(event)}
            >Edit</button
          >
          <button
            class="delete-button"
            on:click={() => dispatch("delete", { event })}>Delete</button
          >
        {/if}
      </div>
      <button class="close-button" on:click={onClose}>&times;</button>
    </div>

    <h2>{event.title}</h2>

    <div class="event-time">
      <strong>Wanneer:</strong>
      {formatEventDateTime(event.start, event.end)}
    </div>

    {#if event.extendedProps?.location}
      <div class="event-location">
        <strong>Waar:</strong>
        {event.extendedProps.location}
      </div>
    {/if}

    {#if event.extendedProps?.minAttendees !== undefined}
      <div class="event-min-attendees">
        <strong>Minimum benodigde vrijwilligers:</strong>
        <span>{event.extendedProps.minAttendees}</span>
        {#if event.extendedProps?.attendees}
          <span class="attendee-count">
            {event.extendedProps.attendees.length}/{event.extendedProps.minAttendees}
            {event.extendedProps.attendees.length < event.extendedProps.minAttendees ? '⚠️' : '✅'}
          </span>
        {/if}
      </div>
    {/if}

    {#if event.extendedProps?.description}
      <div class="event-description">
        <strong>Beschrijving:</strong>
        <p>{event.extendedProps.description}</p>
      </div>
    {/if}


    {#if event.extendedProps?.documents?.length}
      <div class="event-documents">
        <strong>Documenten:</strong>
        <ul>
          {#each event.extendedProps.documents as doc}
            <li>
              <a href={doc.url} target="_blank" rel="noopener noreferrer"
                >{doc.title}</a
              >
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if event.extendedProps?.attendees}
      <div class="event-attendees">
        <div class="attendees-header">
          <strong>Vrijwilligers:</strong>
          {#if $currentUser}
            <button
              class="copy-button"
              on:click={() => copyEmails(event.extendedProps.attendees)}
              title="Copy all email addresses"
            >
              📋
            </button>
          {/if}
        </div>
        <ul>
          {#each event.extendedProps.attendees as attendee}
            <li>{attendee.name}</li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if $userProfile.name && $userProfile.email}
      <div class="join-section">
        <button
          class={event.extendedProps?.attendees?.some(
            (a) => a.email === $userProfile.email
          )
            ? "leave-button"
            : "join-button"}
          on:click={async () => {
            if (event.extendedProps) {
              const newAttendees = event.extendedProps.attendees?.some(
                (a) => a.email === $userProfile.email
              )
                ? event.extendedProps.attendees.filter(
                    (a) => a.email !== $userProfile.email
                  )
                : [
                    ...(event.extendedProps.attendees || []),
                    {
                      email: $userProfile.email,
                      name: $userProfile.name || $userProfile.email,
                    },
                  ];

              event.extendedProps.attendees = newAttendees;

              dispatch("update", {
                event: event,
                onlyAttendeesChanged: true,
              });
            }
          }}
        >
          {event.extendedProps?.attendees?.some(
            (a) => a.email === $userProfile.email
          )
            ? "Uitschrijven"
            : "Inschrijven als vrijwilliger!"}
        </button>
      </div>
    {/if}
    <div class="calendar-integration">
      <h3>Voeg dit event toe aan je eigen kalender</h3>
      <div class="calendar-buttons">
        {#if event}
          {@const calLinks = generateCalendarLinks(event)}
          <a
            href={calLinks.google}
            target="_blank"
            rel="noopener noreferrer"
            class="calendar-button google"
          >
            Google Calendar
          </a>
          <a
            href={calLinks.ics}
            download="event.ics"
            class="calendar-button apple"
          >
            Apple Calendar
          </a>
          <a
            href={calLinks.ics}
            download="event.ics"
            class="calendar-button outlook"
          >
            Outlook
          </a>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .modal {
    max-width: 500px;
    position: relative;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
  }

  .join-button {
    background: #4caf50;
    color: white;
  }

  .leave-button {
    background: #f44336;
    color: white;
  }

  .edit-button {
    background: #2196f3;
    color: white;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 20px;
  }

  .event-time,
  .event-location,
  .event-description,
  .event-attendees {
    margin-bottom: 15px;
  }

  .event-description p {
    margin: 5px 0;
  }

  ul {
    list-style-type: none;
    padding-left: 0;
    margin: 5px 0;
  }

  li {
    padding: 3px 0;
  }

  .event-min-attendees {
    margin-bottom: 15px;
  }

  .attendee-count {
    margin-left: 10px;
    color: #666;
  }

  .event-documents ul {
    list-style: none;
    padding-left: 0;
    margin: 5px 0;
  }

  .event-documents a {
    color: #2196f3;
    text-decoration: none;
  }

  .event-documents a:hover {
    text-decoration: underline;
  }

  .attendees-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
  }

  .attendees-header strong {
    font-size: inherit;
  }

  .copy-button {
    padding: 2px 6px;
    font-size: 14px;
    background: none;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .copy-button:hover {
    background: #f5f5f5;
  }

  .join-section {
    margin-top: 20px;
    text-align: center;
  }

  .join-section button {
    width: 100%;
    padding: 12px;
    font-size: 16px;
  }

  .calendar-integration {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    width: 100%;
  }

  .calendar-integration h3 {
    margin: 0 0 10px 0;
    font-size: 1.1em;
    color: #333;
  }

  .calendar-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .calendar-button {
    padding: 8px 16px;
    border-radius: 4px;
    text-decoration: none;
    color: white;
    font-size: 14px;
    display: flex;
    align-items: center;
    transition: opacity 0.2s;
  }

  .calendar-button:hover {
    opacity: 0.9;
  }

  .google {
    background-color: #4285f4;
  }

  .apple {
    background-color: #000000;
  }

  .outlook {
    background-color: #0078d4;
  }
</style>
