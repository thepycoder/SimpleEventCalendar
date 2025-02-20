<script lang="ts">
  import { login } from "$lib/stores/auth";
</script>

<button class="google-btn" on:click={login}>
  <div class="google-icon-wrapper">
    <img
      class="google-icon"
      src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
      alt="Google sign-in"
    />
  </div>
  <span class="btn-text">Admin Login</span>
</button>

<style>
  .google-btn {
    width: 184px;
    height: 42px;
    background-color: #4285f4;
    border-radius: 2px;
    box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.25);
    display: flex;
    align-items: center;
    padding: 0;
    border: none;
    cursor: pointer;
    transition: box-shadow 0.3s ease;
  }

  .google-btn:hover {
    box-shadow: 0 0 6px #4285f4;
  }

  .google-btn:active {
    background: #1669f2;
  }

  .google-icon-wrapper {
    width: 40px;
    height: 100%;
    border-radius: 2px 0 0 2px;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .google-icon {
    width: 18px;
    height: 18px;
  }

  .btn-text {
    padding: 0 16px;
    font-size: 14px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    color: white;
    flex-grow: 1;
    text-align: center;
  }
</style>
