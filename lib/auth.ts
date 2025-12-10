import { api } from './api';
import { setCookie, getCookie } from './utils';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE = 'aureus_admin_session';
const STATE_KEY = 'aureus_auth_state'; // Used to detect expiration vs clean logout

export const auth = {
    login: async (password: string, rememberMe: boolean) => {
        // Simple mock authentication
        if (password !== 'Ddambaian123@') return false;

        const sessionId = uuidv4();
        const days = rememberMe ? 30 : 1;
        
        // We attempt to set a cookie for realism, but we will rely on LocalStorage
        // for the actual persistence in this demo environment to prevent access issues.
        setCookie(SESSION_COOKIE, sessionId, days, { secure: false, sameSite: 'Lax' });
        localStorage.setItem(STATE_KEY, 'active');
        localStorage.setItem(SESSION_COOKIE, sessionId); // Backup session ID in storage

        await api.logs.create('auth', 'Login', `Admin session started.`, {
            author: 'Admin',
            resourceType: 'session',
            resourceId: sessionId,
            details: {
                rememberMe,
                cookieFlags: ['Secure=false', 'SameSite=Lax']
            }
        });
        return true;
    },

    logout: async () => {
        const sessionId = getCookie(SESSION_COOKIE) || localStorage.getItem(SESSION_COOKIE);
        
        // Clear cookies and state
        setCookie(SESSION_COOKIE, '', -1);
        localStorage.removeItem(STATE_KEY);
        localStorage.removeItem(SESSION_COOKIE);
        
        if (sessionId) {
            await api.logs.create('auth', 'Logout', `Admin session ended manually.`, {
                author: 'Admin',
                resourceType: 'session',
                resourceId: sessionId
            });
        }
    },

    checkSession: async (): Promise<boolean> => {
        // In a real app, we check the HTTP-only cookie. 
        // In this preview environment, cookies are often blocked. 
        // We fallback to checking localStorage to ensure you can access the dashboard.
        const isActive = localStorage.getItem(STATE_KEY) === 'active';
        return isActive;
    }
};