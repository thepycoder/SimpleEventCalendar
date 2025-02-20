import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			fallback: 'index.html' // Ensures the app behaves like an SPA
		})
	}
};
