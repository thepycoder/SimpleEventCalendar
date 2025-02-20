<script lang="ts">
  import "$lib/styles/modal.css";
  import type { CalendarEvent } from "$lib/types/calendar";
  import { createEventDispatcher } from "svelte";
  import { currentUser, userProfile } from "$lib/stores/auth";
  import { updateEventAttendees } from "$lib/services/events";
  import { atcb_action } from 'add-to-calendar-button';

  function generateCalendarConfig(event: CalendarEvent) {
    return {
      name: event.title,
      description: event.extendedProps?.description || '',
      startDate: event.start.toISOString().split('T')[0],
      endDate: event.end.toISOString().split('T')[0],
      startTime: event.start.toISOString().split('T')[1].slice(0, 5),
      endTime: event.end.toISOString().split('T')[1].slice(0, 5),
      location: event.extendedProps?.location || '',
      options: ['Google', 'Apple', 'Microsoft365', 'Outlook.com', 'iCal'],
      timeZone: "Europe/Amsterdam",
      trigger: "click",
      iCalFileName: "Reminder-Event",
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

    <div class="modal-layout">
      <!-- Left Column -->
      <div class="modal-column">
        <fieldset>
          <legend>Evenement Details</legend>

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

          {#if event.extendedProps?.description}
            <div class="event-description">
              <strong>Beschrijving:</strong>
              <p>{event.extendedProps.description}</p>
            </div>
          {/if}
        </fieldset>

        {#if event.extendedProps?.documents?.length}
          <fieldset>
            <legend>Documenten</legend>
            <div class="event-documents">
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
          </fieldset>
        {/if}
      </div>

      <!-- Right Column -->
      <div class="modal-column">
        <fieldset>
          <legend>Vrijwilligers</legend>
          {#if event.extendedProps?.minAttendees !== undefined}
            <div class="event-min-attendees">
              <strong>Minimum benodigde vrijwilligers:</strong>
              <span>{event.extendedProps.minAttendees}</span>
            </div>
            {#if event.extendedProps?.attendees}
              <div class="occupancy-status">
                <strong>Bezetting:</strong>
                <span class="attendee-count">
                  {event.extendedProps.attendees.length}/{event.extendedProps
                    .minAttendees}
                  {event.extendedProps.attendees.length <
                  event.extendedProps.minAttendees
                    ? "⚠️"
                    : "✅"}
                </span>
              </div>
            {/if}
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
              <ul class="attendees-list">
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
        </fieldset>

        <fieldset>
          <legend>Agenda Integratie</legend>
          <div class="calendar-integration">
            <button 
              class="calendar-button"
              on:click={() => atcb_action(generateCalendarConfig(event))}
            >
              Toevoegen aan agenda
            </button>
          </div>
        </fieldset>
      </div>
    </div>
  </div>
</div>

<style>
  .modal {
    background: white;
    border-radius: 8px;
    padding: 20px;
    max-width: 1000px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
  }

  .modal-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 20px;
  }

  .modal-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  fieldset {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
  }

  legend {
    font-weight: bold;
    padding: 0 10px;
    color: #444;
  }

  h2 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 1.5em;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0 8px;
  }

  .event-time,
  .event-location,
  .event-description,
  .event-min-attendees {
    margin-bottom: 15px;
  }

  .event-description p {
    margin: 5px 0;
    line-height: 1.4;
  }

  .attendees-list {
    list-style-type: none;
    padding-left: 0;
    margin: 10px 0;
    max-height: 200px;
    overflow-y: auto;
  }

  .attendees-list li {
    padding: 5px 0;
  }

  .calendar-button {
    width: 100%;
    padding: 12px;
    background-color: #666;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
  }

  .calendar-button:hover {
    background-color: #555;
  }

  :global(.atcb-button) {
    background-color: #666 !important;
  }

  .occupancy-status {
    margin-bottom: 15px;
  }

  .event-time,
  .event-location,
  .event-description,
  .event-min-attendees,
  .occupancy-status {
    margin-bottom: 15px;
  }

  .join-button,
  .leave-button {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 4px;
    color: white;
    font-size: 16px;
    cursor: pointer;
    margin-top: 10px;
  }

  .join-button {
    background-color: #4caf50;
  }
  .leave-button {
    background-color: #f44336;
  }

  .copy-button {
    padding: 4px 8px;
    background: none;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .modal-layout {
      grid-template-columns: 1fr;
    }

    .modal {
      width: 95%;
      padding: 15px;
    }

    .modal-column {
      gap: 15px;
    }

    fieldset {
      padding: 10px;
      margin-bottom: 15px;
    }

    .calendar-buttons {
      flex-direction: column;
    }

    .calendar-button {
      /* width: 100%; */
      text-align: center;
    }
  }
</style>
