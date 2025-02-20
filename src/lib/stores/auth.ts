import { writable, get } from 'svelte/store';

// Admin user type
export interface User {
    id: string;
    name: string;
    email: string;
}

// Public visitor profile
export interface Profile {
    name: string;
    email: string;
}

// Admin authentication state
export const currentUser = writable<User | null>(null);

// Public visitor profile state
export const userProfile = writable<Profile>(() => {
    if (typeof window !== 'undefined') {
        const saved = document.cookie.split('; ').find(row => row.startsWith('userProfile='));
        if (saved) {
            try {
                return JSON.parse(decodeURIComponent(saved.split('=')[1]));
            } catch (e) {
                console.error('Failed to parse profile cookie:', e);
            }
        }
    }
    return { name: '', email: '' };
});

// Save profile to cookie whenever it changes
userProfile.subscribe(profile => {
    if (typeof window !== 'undefined') {
        const value = encodeURIComponent(JSON.stringify(profile));
        document.cookie = `userProfile=${value};path=/;max-age=31536000`; // 1 year
    }
});

// Admin authentication functions
export function login() {
    currentUser.set({
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com'
    });
}

export function logout() {
    currentUser.set(null);
}

// Public profile update
export function updateProfile(name: string, email: string) {
    userProfile.set({ name, email });
}
