<script lang="ts">
  import "$lib/styles/modal.css";
  import type { CalendarEvent } from "$lib/types/calendar";
  import { createEventDispatcher } from "svelte";
  import { currentUser, userProfile } from "$lib/stores/auth";
  import { updateEventAttendees } from '$lib/services/events';

  function copyEmails(attendees: Array<{email: string; name: string}>) {
    const emails = attendees.map(a => a.email).join(', ');
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
          <button class="edit-button" on:click={() => onEdit(event)}>Edit</button>
        {/if}
        {#if $userProfile.name && $userProfile.email}
          <button
            class={event.extendedProps?.attendees?.some(a => a.email === $userProfile.email)
              ? "leave-button"
              : "join-button"}
            on:click={async () => {
              if (event.extendedProps) {
                const newAttendees = event.extendedProps.attendees?.some(a => a.email === $userProfile.email)
                  ? (event.extendedProps.attendees.filter(a => a.email !== $userProfile.email))
                  : [...(event.extendedProps.attendees || []), {
                      email: $userProfile.email,
                      name: $userProfile.name || $userProfile.email
                    }];

                event.extendedProps.attendees = newAttendees;
                
                // Update the event and specify that only attendees changed
                dispatch("update", { 
                  event: event,
                  onlyAttendeesChanged: true 
                });
              }
            }}
          >
            {event.extendedProps?.attendees?.some(a => a.email === $userProfile.email)
              ? "Ik kom niet"
              : "Ik kom ook!"}
          </button>
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

    {#if event.extendedProps?.description}
      <div class="event-description">
        <strong>Beschrijving:</strong>
        <p>{event.extendedProps.description}</p>
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

  .attendees-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
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
</style>
