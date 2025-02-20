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

  // Reactive statements to update event dates when input strings change
  $: if (startStr) {
    event.start = new Date(startStr);
  }

  $: if (endStr) {
    event.end = new Date(endStr);
  }

  export let isEdit = false;

  const dispatch = createEventDispatcher();
  let newAttendeeEmail = "";
  let newAttendeeName = "";
  let newDocTitle = "";
  let newDocUrl = "";

  // Initialize documents array if not present
  if (!event.extendedProps) {
    event.extendedProps = {};
  }
  if (!event.extendedProps.documents) {
    event.extendedProps.documents = [];
  }

  function addDocument() {
    if (newDocTitle && newDocUrl && event.extendedProps) {
      event.extendedProps.documents = [
        ...(event.extendedProps.documents || []),
        { title: newDocTitle, url: newDocUrl }
      ];
      newDocTitle = "";
      newDocUrl = "";
    }
  }

  function removeDocument(index: number) {
    if (event.extendedProps?.documents) {
      event.extendedProps.documents = event.extendedProps.documents.filter((_, i) => i !== index);
    }
  }

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

    <div class="form-group">
      <label for="minAttendees">Minimum Required Attendees</label>
      <div class="min-attendees-input">
        <input
          id="minAttendees"
          type="number"
          min="0"
          bind:value={event.extendedProps.minAttendees}
        />
        {#if event.extendedProps?.minAttendees !== undefined}
          <span class="attendee-count">
            {event.extendedProps?.attendees?.length || 0}/{event.extendedProps.minAttendees}
            {(event.extendedProps?.attendees?.length || 0) < event.extendedProps.minAttendees ? '⚠️' : '✅'}
          </span>
        {/if}
      </div>
    </div>

    <div class="form-group">
      <label>Documents</label>
      <div class="document-input">
        <input
          type="text"
          bind:value={newDocTitle}
          placeholder="Document title"
        />
        <input
          type="url"
          bind:value={newDocUrl}
          placeholder="Document URL"
        />
        <button type="button" class="add-button" on:click={addDocument}>Add</button>
      </div>
      {#if event.extendedProps?.documents?.length}
        <ul class="documents-list">
          {#each event.extendedProps.documents as doc, i}
            <li>
              <span>{doc.title}</span>
              <div class="document-actions">
                <a href={doc.url} target="_blank" rel="noopener noreferrer">🔗</a>
                <button type="button" class="remove-button" on:click={() => removeDocument(i)}>×</button>
              </div>
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
    max-height: 80vh; /* Limit height to 80% of viewport height */
    overflow-y: auto; /* Enable vertical scrolling */
    position: relative; /* For positioning the form-actions */
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
    position: sticky; /* Make buttons stick to bottom */
    bottom: 0;
    background: white; /* Ensure buttons have a solid background */
    padding: 10px 0;
    border-top: 1px solid #eee;
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

  .min-attendees-input {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .min-attendees-input input {
    width: 100px;
  }

  .attendee-count {
    color: #666;
  }

  .document-input {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }

  .document-input input {
    flex: 1;
    min-width: 0;
  }

  .documents-list {
    list-style: none;
    padding: 0;
    margin: 10px 0;
  }

  .documents-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    background: #f5f5f5;
    margin: 5px 0;
    border-radius: 4px;
  }

  .document-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .document-actions a {
    text-decoration: none;
  }

  .add-button {
    background: #4caf50;
  }

  .remove-button {
    background: #f44336;
    padding: 2px 8px;
  }
</style>
