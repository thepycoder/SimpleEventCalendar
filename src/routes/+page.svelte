<script>
  import Calendar from "@event-calendar/core";
  import TimeGrid from "@event-calendar/time-grid";
  import DayGrid from "@event-calendar/day-grid";
  import List from "@event-calendar/list";
  import EventModal from "$lib/components/EventModal.svelte";
  import { onMount } from "svelte";

  // Custom event renderers
  function renderEvent(info) {
    const attendeeCount = info.event.extendedProps?.attendees?.length || 0;
    return {
      html: `
        <div class="event-content">
          <div class="event-title">${info.event.title}</div>
          ${attendeeCount > 0 ? `<div class="event-attendees">${attendeeCount} attendees</div>` : ""}
        </div>
      `,
    };
  }

  function renderListEvent(info) {
    const attendees = info.event.extendedProps?.attendees || [];
    return {
      html: `
        <div class="list-event-content">
          <div class="event-title">${info.event.title}</div>
          ${
            attendees.length > 0
              ? `
            <div class="event-attendees-list">
              ${attendees.slice(0, 2).join(", ")}
              ${attendees.length > 2 ? ` +${attendees.length - 2} more` : ""}
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
  let options = {
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
  let selectedEvent = null;

  // Handle event clicks
  function handleEventClick(info) {
    selectedEvent = info.event;
    showModal = true;
  }

  onMount(() => {});
</script>

<main>
  <Calendar {plugins} {options} />

  {#if showModal && selectedEvent}
    <EventModal
      event={selectedEvent}
      onClose={() => {
        showModal = false;
        selectedEvent = null;
      }}
    />
  {/if}
</main>

<style>
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
