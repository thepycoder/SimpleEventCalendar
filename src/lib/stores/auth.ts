import { writable, get } from 'svelte/store';
import { auth } from '$lib/firebase';
import { 
    signInWithPopup, 
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged 
} from 'firebase/auth';

// Update User interface to match Firebase user properties
export interface User {
    id: string;
    name: string | null;
    email: string | null;
    photoURL?: string | null;
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

// Authentication functions
export async function login() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        currentUser.set({
            id: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL
        });
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

export async function logout() {
    try {
        await signOut(auth);
        currentUser.set(null);
    } catch (error) {
        console.error('Logout failed:', error);
        throw error;
    }
}

// Add auth state listener
if (typeof window !== 'undefined') {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser.set({
                id: user.uid,
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL
            });
        } else {
            currentUser.set(null);
        }
    });
}

// Public profile update
export function updateProfile(name: string, email: string) {
    userProfile.set({ name, email });
}
