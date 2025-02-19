<script>
  import Calendar from "@event-calendar/core";
  import TimeGrid from "@event-calendar/time-grid";
  import DayGrid from "@event-calendar/day-grid";
  import List from "@event-calendar/list";
  import EventModal from "$lib/components/EventModal.svelte";
  import { onMount } from "svelte";

  // Calendar setup
  const plugins = [TimeGrid, DayGrid, List];
  let options = {
    view: "timeGridWeek",
    views: {
      dayGridMonth: {},
      timeGridWeek: {},
      timeGridDay: {},
      listYear: {},
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
  let selectedEvent = null;

  // Handle event clicks
  function handleEventClick(info) {
    selectedEvent = info.event;
    showModal = true;
  }

  onMount(() => {
    fetchEvents();
  });
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
</style>
