import { writable } from 'svelte/store';

export interface User {
    id: string;
    name: string;
    email: string;
}

export const currentUser = writable<User | null>(null);

// Mock login function (to be replaced with Google OAuth)
export function login() {
    currentUser.set({
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
    });
}

export function logout() {
    currentUser.set(null);
}
