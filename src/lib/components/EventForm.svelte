<script lang="ts">
  import type { CalendarEvent } from "$lib/types/calendar";
  import { createEventDispatcher } from "svelte";
  import { userProfile } from "$lib/stores/auth";

  // Format date for datetime-local input
  function formatDateForInput(date: Date | null): string {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
        { title: newDocTitle, url: newDocUrl },
      ];
      newDocTitle = "";
      newDocUrl = "";
    }
  }

  function removeDocument(index: number) {
    if (event.extendedProps?.documents) {
      event.extendedProps.documents = event.extendedProps.documents.filter(
        (_, i) => i !== index
      );
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
          name: newAttendeeName,
        },
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
    <div class="form-layout">
      <!-- Left Column -->
      <div class="form-column">
        <fieldset>
          <legend>Basic Information</legend>
          <div class="form-group">
            <label for="title">Title*</label>
            <input id="title" type="text" bind:value={event.title} required />
          </div>

          <div class="form-group">
            <label for="start">Start Time*</label>
            <input
              id="start"
              type="datetime-local"
              bind:value={startStr}
              required
            />
          </div>

          <div class="form-group">
            <label for="end">End Time*</label>
            <input
              id="end"
              type="datetime-local"
              bind:value={endStr}
              required
            />
          </div>

          <div class="form-group">
            <label for="location">Location</label>
            <input
              id="location"
              type="text"
              bind:value={event.extendedProps.location}
              placeholder="Event location"
            />
          </div>

          <div class="form-group">
            <label for="color">Event Color</label>
            <div class="color-picker">
              <input
                id="color"
                type="color"
                bind:value={event.backgroundColor}
              />
              <span
                class="color-preview"
                style="background-color: {event.backgroundColor}"
              ></span>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Description</legend>
          <div class="form-group">
            <textarea
              id="description"
              bind:value={event.extendedProps.description}
              rows="4"
              placeholder="Event description..."
            ></textarea>
          </div>
        </fieldset>
      </div>

      <!-- Right Column -->
      <div class="form-column">
        <fieldset>
          <legend>Attendee Management</legend>
          <div class="form-group">
            <label>Minimum Required Attendees</label>
            <div class="min-attendees-input">
              <input
                type="number"
                min="0"
                bind:value={event.extendedProps.minAttendees}
              />
              {#if event.extendedProps?.minAttendees !== undefined}
                <span class="attendee-count">
                  {event.extendedProps?.attendees?.length || 0}/{event
                    .extendedProps.minAttendees}
                  {(event.extendedProps?.attendees?.length || 0) <
                  event.extendedProps.minAttendees
                    ? "⚠️"
                    : "✅"}
                </span>
              {/if}
            </div>
          </div>

          <div class="form-group">
            <label>Add Attendee</label>
            <div class="attendee-input">
              <input
                type="text"
                bind:value={newAttendeeName}
                placeholder="Name"
                on:keydown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newAttendeeName && newAttendeeEmail) addAttendee();
                  }
                }}
              />
              <input
                type="email"
                bind:value={newAttendeeEmail}
                placeholder="Email"
                on:keydown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newAttendeeName && newAttendeeEmail) addAttendee();
                  }
                }}
              />
              <button type="button" class="add-button" on:click={addAttendee}
                >Add</button
              >
            </div>
          </div>

          {#if event.extendedProps?.attendees?.length}
            <div class="attendees-list">
              {#each event.extendedProps.attendees as attendee, i}
                <div class="attendee-item">
                  <span>{attendee.name}</span>
                  <div class="attendee-actions">
                    <span class="email">{attendee.email}</span>
                    <button
                      type="button"
                      class="remove-button"
                      on:click={() => removeAttendee(i)}>×</button
                    >
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </fieldset>

        <fieldset>
          <legend>Documents</legend>
          <div class="form-group">
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
              <button type="button" class="add-button" on:click={addDocument}
                >Add</button
              >
            </div>
          </div>

          {#if event.extendedProps?.documents?.length}
            <div class="documents-list">
              {#each event.extendedProps.documents as doc, i}
                <div class="document-item">
                  <span>{doc.title}</span>
                  <div class="document-actions">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="link-button">🔗</a
                    >
                    <button
                      type="button"
                      class="remove-button"
                      on:click={() => removeDocument(i)}>×</button
                    >
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </fieldset>
      </div>
    </div>

    <div class="form-actions">
      <button
        type="button"
        class="secondary"
        on:click={() => dispatch("cancel")}>Cancel</button
      >
      <button type="submit" class="primary"
        >{isEdit ? "Update" : "Create"}</button
      >
    </div>
  </form>
</div>

<style>
  .event-form {
    padding: 20px;
    max-height: 85vh;
    overflow-y: auto;
    min-width: 800px;
  }

  .form-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
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

  .form-group {
    margin-bottom: 15px;
    width: 100%;
  }

  label {
    display: block;
    margin-bottom: 8px;
    color: #555;
  }

  input,
  textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .color-picker {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .color-picker input {
    width: 50px;
    padding: 0;
    height: 30px;
  }

  .color-preview {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }

  .attendee-input,
  .document-input {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 8px;
    margin-bottom: 10px;
  }

  .attendees-list,
  .documents-list {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 8px;
  }

  .attendee-item,
  .document-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    background: #f8f8f8;
    margin: 4px 0;
    border-radius: 4px;
  }

  .attendee-actions,
  .document-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .email {
    color: #666;
    font-size: 0.9em;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .primary {
    background: #4caf50;
    color: white;
  }

  .secondary {
    background: #f44336;
    color: white;
  }

  .add-button {
    background: #2196f3;
    color: white;
  }

  .remove-button {
    background: #ff5722;
    color: white;
    padding: 4px 8px;
    font-size: 12px;
  }

  .link-button {
    text-decoration: none;
    padding: 4px 8px;
    background: #666;
    color: white;
    border-radius: 4px;
    font-size: 12px;
  }

  @media (max-width: 768px) {
    .form-layout {
      grid-template-columns: 1fr;
    }

    .attendee-input,
    .document-input {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .event-form {
      padding: 15px;
      min-width: auto;
      /* width: 100%; */
    }

    fieldset {
      padding: 10px;
      margin-bottom: 15px;
    }
  }
</style>
