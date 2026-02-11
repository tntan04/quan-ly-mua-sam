
import { User, ProcurementRequest } from '../types';

const SERVER_IP = '192.168.1.99';
const BASE_URL = `http://${SERVER_IP}:3000/api`;

export const apiService = {
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`http://${SERVER_IP}:3000/health`, { 
        method: 'HEAD', 
        mode: 'no-cors',
        signal: AbortSignal.timeout(1000) 
      });
      return true;
    } catch {
      return false;
    }
  },

  async loadUsers(): Promise<User[] | null> {
    try {
      const res = await fetch(`${BASE_URL}/users`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  },

  async saveUsers(users: User[]): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(users),
        signal: AbortSignal.timeout(3000)
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async loadRequests(): Promise<ProcurementRequest[] | null> {
    try {
      const res = await fetch(`${BASE_URL}/requests`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  },

  async saveRequests(requests: ProcurementRequest[]): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requests),
        signal: AbortSignal.timeout(3000)
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }
};
