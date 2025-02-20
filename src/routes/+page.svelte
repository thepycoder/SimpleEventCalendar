<script lang="ts">
  import { onMount } from "svelte";
  import Calendar from "@event-calendar/core";
  import {
    currentUser,
    userProfile,
    login,
    logout,
    updateProfile,
  } from "$lib/stores/auth";
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
    const attendeeCount = info.event.extendedProps?.attendees?.length || 0;
    return {
      html: `
        <div class="event-content">
          <div class="event-title">${info.event.title}</div>
          ${attendeeCount > 0 ? `<div class="event-attendees">${attendeeCount} aanwezig</div>` : ""}
        </div>
      `,
    };
  }

  function renderListEvent(info: EventContentArg) {
    const attendees = info.event.extendedProps?.attendees || [];
    return {
      html: `
        <div class="list-event-content">
          <div class="event-title">${info.event.title}</div>
          ${
            attendees.length > 0
              ? `
            <div class="event-attendees-list">
              ${attendees.join(", ")}
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
    view: "timeGridWeek",
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
    events: [
      {
        id: "1",
        title: "Team Meeting",
        start: "2025-02-19T10:00:00",
        end: "2025-02-19T11:30:00",
        backgroundColor: "#4CAF50",
        extendedProps: {
          description:
            "Weekly team sync to discuss project progress and blockers",
          attendees: ["John Smith", "Sarah Johnson", "Mike Chen", "Lisa Wong"],
        },
      },
      {
        id: "2",
        title: "Lunch Break",
        start: "2025-02-19T12:00:00",
        end: "2025-02-19T13:00:00",
        backgroundColor: "#FF9800",
        extendedProps: {
          description: "Team lunch at the cafeteria",
          attendees: ["Entire Development Team"],
        },
      },
      {
        id: "3",
        title: "Project Deadline",
        start: "2025-02-20T00:00:00",
        end: "2025-02-21T00:00:00",
        allDay: true,
        backgroundColor: "#f44336",
        extendedProps: {
          description: "Final submission deadline for Q1 project deliverables",
          attendees: ["Project Team", "Stakeholders", "Client Representatives"],
        },
      },
      {
        id: "4",
        title: "Client Workshop",
        start: "2025-02-21T14:00:00",
        end: "2025-02-21T16:30:00",
        backgroundColor: "#2196F3",
        extendedProps: {
          description:
            "Interactive workshop with client to review new features",
          attendees: ["Development Team", "Product Manager", "Client Team"],
        },
      },
      {
        id: "5",
        title: "Weekly Review",
        start: "2025-02-23T09:00:00",
        end: "2025-02-23T10:00:00",
        backgroundColor: "#9C27B0",
        extendedProps: {
          description: "Review of weekly goals and achievements",
          attendees: [
            "Team Lead",
            "Department Managers",
            "Project Coordinators",
          ],
        },
      },
    ],
    eventClick: handleEventClick,
  };

  // Modal state
  let showModal = false;
  let showEventForm = false;
  let selectedEvent: CalendarEvent | null = null;
  let isEditMode = false;

  // Event form handlers
  function handleCreateEvent() {
    isEditMode = false;
    showEventForm = true;
  }

  function handleEditEvent(event: CalendarEvent) {
    selectedEvent = event;
    isEditMode = true;
    showEventForm = true;
  }

  function handleSaveEvent(event: CustomEvent) {
    const eventData = event.detail.event;

    if (isEditMode && selectedEvent) {
      // Update existing event
      options.events = options.events.map((e) =>
        e.id === selectedEvent.id ? { ...eventData, id: selectedEvent.id } : e
      );
    } else {
      // Create new event
      const newEvent = {
        ...eventData,
        id: crypto.randomUUID(),
      };
      options.events = [...options.events, newEvent];
    }

    showEventForm = false;
    selectedEvent = null;
  }

  // Handle event clicks
  function handleEventClick(info: EventClickInfo) {
    selectedEvent = info.event;
    showModal = true;
  }

  let showWelcomeModal = false;

  onMount(() => {
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
        <button on:click={login}>Admin Login</button>
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
      on:update={({ detail }) => {
        options.events = options.events.map((e) =>
          e.id === detail.event.id ? detail.event : e
        );
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
</style>
