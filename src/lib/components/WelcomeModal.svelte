<script lang="ts">
  import "$lib/styles/modal.css";
  import { createEventDispatcher } from "svelte";
  import { updateProfile } from "$lib/stores/auth";

  const dispatch = createEventDispatcher();

  let name = "";
  let email = "";

  function handleSubmit() {
    if (name && email) {
      updateProfile(name, email);
      dispatch("close");
    }
  }
</script>

<div class="modal-backdrop">
  <div class="modal">
    <h2>Welkom op de Ekoli Kalender!</h2>
    <p>
      Je hebt geen wachtwoord nodig. Enkel je naam en email adres, zo weten wij
      wie er komt en dat we je een bevestigingsemail kunnen sturen.
    </p>

    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label for="name">Naam</label>
        <input
          id="name"
          type="text"
          bind:value={name}
          placeholder="Typ hier je naam"
          required
        />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="Typ hier je email adres"
          required
        />
      </div>

      <div class="form-actions">
        <button type="submit">Klaar!</button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal {
    padding: 30px;
    max-width: 400px;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 10px;
  }

  p {
    margin-bottom: 20px;
    color: #666;
  }

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }

  .form-actions {
    margin-top: 20px;
    text-align: right;
  }

  button {
    background: #4caf50;
    color: white;
  }

  button:hover {
    background: #45a049;
  }
</style>
