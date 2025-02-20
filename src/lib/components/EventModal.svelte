<script lang="ts">
  import type { CalendarEvent } from "$lib/types/calendar";
  import { createEventDispatcher } from "svelte";
  import { currentUser, userProfile } from "$lib/stores/auth";

  const dispatch = createEventDispatcher();

  export let event: CalendarEvent;
  export let onClose: () => void;
  export let onEdit: (event: CalendarEvent) => void;

  function handleOutsideClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-backdrop" on:click={handleOutsideClick}>
  <div class="modal">
    <div class="modal-buttons">
      {#if $currentUser}
        <button class="edit-button" on:click={() => onEdit(event)}>Edit</button>
      {/if}
      {#if $userProfile.name && $userProfile.email}
        <button
          class={event.extendedProps?.attendees?.includes($userProfile.name)
            ? "leave-button"
            : "join-button"}
          on:click={() => {
            if (event.extendedProps) {
              if (event.extendedProps.attendees?.includes($userProfile.name)) {
                event.extendedProps.attendees =
                  event.extendedProps.attendees.filter(
                    (a) => a !== $userProfile.name
                  );
              } else {
                event.extendedProps.attendees = [
                  ...(event.extendedProps.attendees || []),
                  $userProfile.name,
                ];
              }
              // Update the event without opening the form
              const updatedEvent = { ...event };
              dispatch("update", { event: updatedEvent });
            }
          }}
        >
          {event.extendedProps?.attendees?.includes($userProfile.name)
            ? "Leave Event"
            : "Join Event"}
        </button>
      {/if}
      <button class="close-button" on:click={onClose}>&times;</button>
    </div>

    <h2>{event.title}</h2>

    <div class="event-time">
      <strong>When:</strong>
      {new Date(event.start).toLocaleString()} -
      {new Date(event.end).toLocaleString()}
    </div>

    {#if event.extendedProps?.location}
      <div class="event-location">
        <strong>Where:</strong>
        {event.extendedProps.location}
      </div>
    {/if}

    {#if event.extendedProps?.description}
      <div class="event-description">
        <strong>Description:</strong>
        <p>{event.extendedProps.description}</p>
      </div>
    {/if}

    {#if event.extendedProps?.attendees}
      <div class="event-attendees">
        <strong>Attendees:</strong>
        <ul>
          {#each event.extendedProps.attendees as attendee}
            <li>{attendee}</li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    padding: 20px;
    border-radius: 8px;
    min-width: 300px;
    max-width: 500px;
    position: relative;
  }

  .modal-buttons {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 10px;
  }

  .close-button,
  .edit-button,
  .join-button,
  .leave-button {
    border: none;
    background: none;
    font-size: 16px;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 4px;
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
</style>
