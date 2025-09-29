# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Installing the deps

To install the project using node, run:

```bash
npm install
```

## Developing

Once you've installed the dependencies, you can run a dev server locally by running:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Authentication Setup

To enable Google authentication:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Google authentication:
   - In Firebase Console, go to Authentication > Sign-in method
   - Click Google provider and enable it
   - Configure OAuth consent screen if needed
3. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click the web icon (</>)
   - Register your app and copy the firebaseConfig object
      - Note: if you get the option to also set up firebase hosting for the app: do so, we'll use it later :)
4. Copy paste the given snippet into `firebase.ts`
5. The installation should have prompted you to do install firebase, that is part of this repo's install already

## Firebase setup

We're using firebase for **authentication** of the admin, **hosting** of the webpage and **database** storage from firestore to keep the events in.

So I think it should be

`firebase login`
`firebase init`
`pnpm run build`
`firebase deploy`