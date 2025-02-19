<script>
  export let event;
  export let onClose;

  function handleOutsideClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

<div class="modal-backdrop" on:click={handleOutsideClick}>
  <div class="modal">
    <button class="close-button" on:click={onClose}>&times;</button>
    
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
        {event.extendedProps.description}
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

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    border: none;
    background: none;
    font-size: 24px;
    cursor: pointer;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 20px;
  }

  .event-time,
  .event-location,
  .event-description {
    margin-bottom: 15px;
  }
</style>
