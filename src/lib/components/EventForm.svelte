<script lang="ts">
  import type { CalendarEvent } from "$lib/types/calendar";
  import { createEventDispatcher } from "svelte";
  import { userProfile } from "$lib/stores/auth";

  // Format date for datetime-local input
  function formatDateForInput(date: Date | null): string {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  }

  // Default event or format existing event dates
  export let event: Partial<CalendarEvent> = {
    title: "",
    start: new Date(),
    end: new Date(Date.now() + 3600000),
    backgroundColor: "#4CAF50",
    extendedProps: {
      description: "",
      attendees: [],
    },
  };

  // Convert dates to strings for datetime-local inputs
  let startStr = formatDateForInput(event.start as Date);
  let endStr = formatDateForInput(event.end as Date);

  export let isEdit = false;

  const dispatch = createEventDispatcher();
  let newAttendeeEmail = "";
  let newAttendeeName = "";

  function handleSubmit(): void {
    if (!event.title || !event.start || !event.end) {
      alert("Please fill in all required fields");
      return;
    }

    dispatch("save", { event });
  }

  function addAttendee() {
    if (newAttendeeEmail && newAttendeeName && event.extendedProps) {
      event.extendedProps.attendees = [
        ...(event.extendedProps.attendees || []),
        {
          email: newAttendeeEmail,
          name: newAttendeeName
        }
      ];
      newAttendeeEmail = "";
      newAttendeeName = "";
    }
  }

  function removeAttendee(index: number): void {
    if (event.extendedProps?.attendees) {
      event.extendedProps.attendees = event.extendedProps.attendees.filter(
        (_, i) => i !== index
      );
    }
  }
</script>

<div class="event-form">
  <h2>{isEdit ? "Edit Event" : "Create New Event"}</h2>

  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="title">Title*</label>
      <input id="title" type="text" bind:value={event.title} required />
    </div>

    <div class="form-group">
      <label for="start">Start Time*</label>
      <input id="start" type="datetime-local" bind:value={startStr} required />
    </div>

    <div class="form-group">
      <label for="end">End Time*</label>
      <input id="end" type="datetime-local" bind:value={endStr} required />
    </div>

    <div class="form-group">
      <label for="color">Color</label>
      <input
        id="color"
        type="color"
        style="padding:0"
        bind:value={event.backgroundColor}
      />
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        bind:value={event.extendedProps.description}
        rows="3"
      ></textarea>
    </div>

    <div class="form-group">
      <label>Attendees</label>
      <div class="attendee-input">
        <input
          type="text"
          bind:value={newAttendeeName}
          placeholder="Name"
          on:keydown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (newAttendeeName && newAttendeeEmail) {
                addAttendee();
              }
            }
          }}
        />
        <input
          type="email"
          bind:value={newAttendeeEmail}
          placeholder="Email address"
          on:keydown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (newAttendeeName && newAttendeeEmail) {
                addAttendee();
              }
            }
          }}
        />
        <button type="button" on:click={addAttendee}>Add</button>
      </div>
      {#if event.extendedProps?.attendees?.length}
        <ul class="attendees-list">
          {#each event.extendedProps.attendees as attendee, i}
            <li>
              {attendee.name} ({attendee.email})
              <button type="button" on:click={() => removeAttendee(i)}>×</button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <div class="form-actions">
      <button type="submit">{isEdit ? "Update" : "Create"}</button>
      <button type="button" on:click={() => dispatch("cancel")}>Cancel</button>
    </div>
  </form>
</div>

<style>
  .event-form {
    padding: 20px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }

  input,
  textarea {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
    height: 30px;
  }

  .attendee-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .attendee-input {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }

  .attendee-input input {
    flex: 1;
    min-width: 0;
  }

  .join-button {
    background: #2196f3;
    color: white;
    width: 100%;
  }

  .attendees-list {
    list-style: none;
    padding: 0;
    margin: 10px 0;
  }

  .attendees-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    background: #f5f5f5;
    margin: 5px 0;
    border-radius: 4px;
  }

  .form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button[type="submit"] {
    background: #4caf50;
    color: white;
  }

  button[type="button"] {
    background: #f44336;
    color: white;
  }
</style>
