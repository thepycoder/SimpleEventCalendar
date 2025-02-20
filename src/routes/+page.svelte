<script lang="ts">
  import { onMount } from "svelte";
  import Calendar from "@event-calendar/core";
  import {
    currentUser,
    userProfile,
    logout,
    updateProfile,
  } from "$lib/stores/auth";
  import {
    fetchEvents,
    createEvent,
    updateEvent,
    updateEventAttendees,
    deleteEvent
  } from "$lib/services/events";
  import GoogleSignInButton from "$lib/components/GoogleSignInButton.svelte";
  import WelcomeModal from "$lib/components/WelcomeModal.svelte";
  import TimeGrid from "@event-calendar/time-grid";
  import DayGrid from "@event-calendar/day-grid";
  import List from "@event-calendar/list";
  import EventModal from "$lib/components/EventModal.svelte";
  import EventForm from "$lib/components/EventForm.svelte";
  import type {
    CalendarEvent,
    EventClickInfo,
    EventContentArg,
  } from "$lib/types/calendar";
  import type { EventCalendarOptions } from "@event-calendar/core";

  // Custom event renderers
  function renderEvent(info: EventContentArg) {
    const attendees = info.event.extendedProps?.attendees || [];
    const minAttendees = info.event.extendedProps?.minAttendees;
    let attendeeText = "";

    if (attendees.length > 0) {
      if (attendees.length <= 50) {
        // Show all names if 50 or fewer
        attendeeText = attendees.map((a) => a.name).join(", ");
      } else {
        // Show first 50 names + count of others
        const firstFive = attendees
          .slice(0, 50)
          .map((a) => a.name)
          .join(", ");
        const remaining = attendees.length - 50;
        attendeeText = `${firstFive} +${remaining} others`;
      }
    }

    const attendeeCount = minAttendees !== undefined 
      ? `<div class="event-count ${attendees.length < minAttendees ? 'needs-more' : ''}">
          ${attendees.length}/${minAttendees} ${attendees.length < minAttendees ? '⚠️' : '✅'}
        </div>`
      : '';

    return {
      html: `
        <div class="event-content">
          <div class="event-title">${info.event.title} ${attendeeCount}</div>
          ${attendees.length > 0 ? `<div class="event-attendees">${attendeeText}</div>` : ""}
        </div>
      `,
    };
  }

  function renderListEvent(info: EventContentArg) {
    const attendees = info.event.extendedProps?.attendees || [];
    const minAttendees = info.event.extendedProps?.minAttendees;

    const attendeeCount = minAttendees !== undefined 
      ? `<div class="event-count ${attendees.length < minAttendees ? 'needs-more' : ''}">
          ${attendees.length}/${minAttendees} ${attendees.length < minAttendees ? '⚠️' : '✅'}
        </div>`
      : '';

    return {
      html: `
        <div class="list-event-content">
          <div class="event-title">${info.event.title} ${attendeeCount}</div>
          ${
            attendees.length > 0
              ? `
            <div class="event-attendees-list">
              ${attendees.map((a) => a.name).join(", ")}
            </div>
          `
              : ""
          }
        </div>
      `,
    };
  }

  // Calendar setup
  const plugins = [TimeGrid, DayGrid, List];

  let options: EventCalendarOptions = {
    view: "dayGridMonth",
    views: {
      dayGridMonth: {
        eventContent: renderEvent,
      },
      timeGridWeek: {
        eventContent: renderEvent,
      },
      timeGridDay: {
        eventContent: renderEvent,
      },
      listYear: {
        eventContent: renderListEvent,
      },
    },
    headerToolbar: {
      start: "prev,next today",
      center: "title",
      end: "dayGridMonth,timeGridWeek,timeGridDay,listYear",
    },
    events: [],
    eventClick: handleEventClick,
  };

  // Modal state
  let showModal = false;
  let showEventForm = false;
  let selectedEvent: CalendarEvent | null = null;
  let isEditMode = false;

  // Event form handlers
  function handleCreateEvent(): void {
    isEditMode = false;
    showEventForm = true;
  }

  function handleEditEvent(event: CalendarEvent) {
    selectedEvent = event;
    isEditMode = true;
    showEventForm = true;
  }

  async function handleSaveEvent(
    event: CustomEvent<{ event: CalendarEvent }>
  ): Promise<void> {
    try {
      const eventData = event.detail.event;

      if (isEditMode && selectedEvent) {
        await updateEvent({ ...eventData, id: selectedEvent.id });
        calendarEvents = calendarEvents.map((e) =>
          e.id === selectedEvent.id ? { ...eventData, id: selectedEvent.id } : e
        );
      } else {
        const newEvent = await createEvent(eventData);
        calendarEvents = [...calendarEvents, newEvent];
      }

      options = {
        ...options,
        events: calendarEvents,
      };

      showEventForm = false;
      selectedEvent = null;
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Error saving event. Please try again.");
    }
  }

  // Handle event clicks
  function handleEventClick(info: EventClickInfo) {
    selectedEvent = info.event;
    showModal = true;
  }

  let showWelcomeModal = false;

  let calendarEvents: CalendarEvent[] = [];

  onMount(async () => {
    try {
      calendarEvents = await fetchEvents();
      options = {
        ...options,
        events: calendarEvents,
      };
    } catch (error) {
      console.error("Error fetching events:", error);
    }

    // Show welcome modal if no profile exists
    if (!$userProfile.name && !$userProfile.email) {
      showWelcomeModal = true;
    }
  });
</script>

<main>
  <div class="header">
    <div class="profile-section">
      <div class="profile-fields">
        <input
          type="text"
          placeholder="Your name"
          value={$userProfile.name}
          on:change={(e) => updateProfile(e.target.value, $userProfile.email)}
        />
        <input
          type="email"
          placeholder="Your email"
          value={$userProfile.email}
          on:change={(e) => updateProfile($userProfile.name, e.target.value)}
        />
      </div>
    </div>
    <div class="admin-section">
      {#if $currentUser}
        <span class="admin-label">Admin</span>
        <button on:click={handleCreateEvent}>Create Event</button>
        <button on:click={logout}>Logout</button>
      {:else}
        <GoogleSignInButton />
      {/if}
    </div>
  </div>

  <Calendar {plugins} {options} />

  {#if showModal && selectedEvent}
    <EventModal
      event={selectedEvent}
      onClose={() => {
        showModal = false;
        selectedEvent = null;
      }}
      onEdit={handleEditEvent}
      on:delete={async ({ detail }) => {
        if (confirm('Are you sure you want to delete this event?')) {
          try {
            await deleteEvent(detail.event.id);
            options.events = options.events.filter(e => e.id !== detail.event.id);
            showModal = false;
            selectedEvent = null;
          } catch (error) {
            console.error("Error deleting event:", error);
            alert("Error deleting event. Please try again.");
          }
        }
      }}
      on:update={async ({ detail }) => {
        try {
          // If only attendees changed, use the specific update function
          if (detail.onlyAttendeesChanged) {
            await updateEventAttendees(
              detail.event.id,
              detail.event.extendedProps?.attendees || []
            );
          } else {
            await updateEvent(detail.event);
          }

          options.events = options.events.map((e) =>
            e.id === detail.event.id ? detail.event : e
          );
        } catch (error) {
          console.error("Error updating event:", error);
          alert("Error updating event. Please try again.");
        }
      }}
    />
  {/if}

  {#if showEventForm}
    <div class="modal-backdrop">
      <div class="modal-content">
        <EventForm
          event={selectedEvent || undefined}
          isEdit={isEditMode}
          on:save={handleSaveEvent}
          on:cancel={() => {
            showEventForm = false;
            selectedEvent = null;
          }}
        />
      </div>
    </div>
  {/if}

  {#if showWelcomeModal}
    <WelcomeModal on:close={() => (showWelcomeModal = false)} />
  {/if}
</main>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #f5f5f5;
    margin-bottom: 1rem;
  }

  .profile-section,
  .admin-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .admin-label {
    font-weight: bold;
    color: #666;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .profile-fields {
    display: flex;
    gap: 0.5rem;
  }

  .profile-fields input {
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background-color: #4caf50;
    color: white;
    cursor: pointer;
  }

  button:hover {
    background-color: #45a049;
  }

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

  .modal-content {
    background: white;
    border-radius: 8px;
    max-width: 600px;
    width: 90%;
  }
  :global(.event-content) {
    padding: 2px 4px;
    overflow: hidden;
  }

  :global(.event-title) {
    font-weight: bold;
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global(.event-attendees) {
    font-size: 0.8em;
    opacity: 0.8;
  }

  :global(.list-event-content) {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  :global(.event-attendees-list) {
    font-size: 0.9em;
    color: #666;
    font-style: italic;
  }

  :global(.event-count) {
    display: inline-block;
    font-size: 0.8em;
    margin-left: 5px;
  }

  :global(.event-count.needs-more) {
    color: #ff4444;
  }
</style>
