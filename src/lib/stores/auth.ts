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

// Cookie helper functions
function getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    return null;
}

function setCookie(name: string, value: string, days: number = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Strict`;
}

// Public visitor profile state
export const userProfile = writable<Profile>({
    name: '',
    email: ''
});

// Initialize profile from cookie
if (typeof window !== 'undefined') {
    const savedProfile = getCookie('userProfile');
    if (savedProfile) {
        try {
            const profile = JSON.parse(savedProfile);
            userProfile.set(profile);
        } catch (e) {
            console.error('Failed to parse profile cookie:', e);
        }
    }
}

// Save profile to cookie whenever it changes
userProfile.subscribe(profile => {
    if (typeof window !== 'undefined' && (profile.name || profile.email)) {
        setCookie('userProfile', JSON.stringify(profile));
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
