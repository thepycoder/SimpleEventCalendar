<script lang="ts">
  import { userProfile } from "$lib/stores/auth";
  import { onMount } from "svelte";
  import {
    subscribeToNotifications,
    unsubscribeFromNotifications,
    isEmailSubscribed,
  } from "$lib/services/subscribers";

  let isSubscribed = false;
  let isLoading = false;
  let lastCheckedEmail = '';

  // Check subscription status when component mounts or user profile changes
  $: if ($userProfile.email && $userProfile.email !== lastCheckedEmail) {
    checkSubscriptionStatus();
  }

  async function checkSubscriptionStatus() {
    if (!$userProfile.email || isLoading) return;
    
    try {
      isLoading = true;
      lastCheckedEmail = $userProfile.email;
      isSubscribed = await isEmailSubscribed($userProfile.email);
    } catch (error) {
      console.error("Error checking subscription status:", error);
    } finally {
      isLoading = false;
    }
  }

  async function handleSubscriptionChange() {
    if (!$userProfile.email || !$userProfile.name) {
      alert("Vul eerst je naam en email adres in om je in te schrijven voor notificaties.");
      // Revert checkbox state
      isSubscribed = !isSubscribed;
      return;
    }

    try {
      isLoading = true;
      console.log("here");
      console.log("isSubscribed", isSubscribed);
      if (isSubscribed) {
        console.log("subscribing");
        await subscribeToNotifications($userProfile.email, $userProfile.name);
      } else {
        console.log("unsubscribing");
        await unsubscribeFromNotifications($userProfile.email);
      }
      console.log("after operation, isSubscribed", isSubscribed);
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("Er is een fout opgetreden bij het bijwerken van je abonnement. Probeer het opnieuw.");
      // Revert the checkbox state
      isSubscribed = !isSubscribed;
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    if ($userProfile.email) {
      checkSubscriptionStatus();
    }
  });
</script>

{#if $userProfile.email}
  <div class="subscription-section">
    <label 
      class="subscription-checkbox"
      title="Stuur mij een email als er een nieuw event wordt aangemaakt"
    >
      <input
        type="checkbox"
        id="email-subscription"
        bind:checked={isSubscribed}
        on:change={handleSubscriptionChange}
        disabled={isLoading}
      />
      <span class="checkbox-text">
        Email updates
      </span>
      {#if isLoading}
        <span class="loading-indicator">...</span>
      {/if}
    </label>
  </div>
{/if}

<style>

  .subscription-checkbox {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-size: 13px;
    color: #555;
    white-space: nowrap;
  }

  .subscription-checkbox input[type="checkbox"] {
    margin: 0;
    cursor: pointer;
    transform: scale(1.1);
  }

  .subscription-checkbox input[type="checkbox"]:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .checkbox-text {
    user-select: none;
    font-weight: 500;
  }

  .loading-indicator {
    color: #666;
    font-size: 11px;
  }

  .subscription-checkbox:hover .checkbox-text {
    color: #333;
  }
</style> 