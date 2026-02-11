
import { User, ProcurementRequest } from '../types';

const CLIENT_ID: string = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; 

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const USERS_FILE = 'smartprocure_users_db.json';
const REQUESTS_FILE = 'smartprocure_requests_db.json';

let accessToken: string | null = null;

export const driveService = {
  isConfigured(): boolean {
    return CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' && CLIENT_ID.includes('.apps.googleusercontent.com');
  },

  async authenticate(): Promise<string | null> {
    if (!this.isConfigured()) {
      throw new Error('CONFIG_MISSING');
    }

    return new Promise((resolve, reject) => {
      try {
        if (!(window as any).google) {
          throw new Error('GOOGLE_SDK_NOT_LOADED');
        }

        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.error) {
              reject(response);
              return;
            }
            accessToken = response.access_token;
            localStorage.setItem('drive_token', accessToken!);
            resolve(accessToken);
          },
        });
        client.requestAccessToken();
      } catch (e) {
        reject(e);
      }
    });
  },

  async syncToDrive(fileName: string, data: any): Promise<boolean> {
    const fileContent = JSON.stringify(data);
    localStorage.setItem(fileName, fileContent);

    const token = accessToken || localStorage.getItem('drive_token');
    if (!token) return false;

    try {
      const query = encodeURIComponent(`name = '${fileName}' and trashed = false`);
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (searchRes.status === 401) {
        localStorage.removeItem('drive_token');
        accessToken = null;
        return false;
      }

      const searchData = await searchRes.json();
      
      if (searchData.files && searchData.files.length > 0) {
        const fileId = searchData.files[0].id;
        const updateRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: fileContent
        });
        return updateRes.ok;
      } else {
        const metadata = { name: fileName, mimeType: 'application/json' };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([fileContent], { type: 'application/json' }));

        const createRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form
        });
        return createRes.ok;
      }
    } catch (error) {
      console.error(`Lỗi Drive Sync (${fileName}):`, error);
      return false;
    }
  },

  async loadFromDrive(fileName: string): Promise<any | null> {
    const token = accessToken || localStorage.getItem('drive_token');
    const localSaved = localStorage.getItem(fileName);
    
    if (!token) return localSaved ? JSON.parse(localSaved) : null;

    try {
      const query = encodeURIComponent(`name = '${fileName}' and trashed = false`);
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.files && searchData.files.length > 0) {
          const fileId = searchData.files[0].id;
          const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (fileRes.ok) {
            const remoteData = await fileRes.json();
            localStorage.setItem(fileName, JSON.stringify(remoteData));
            return remoteData;
          }
        }
      }
    } catch (e) {
      console.error(`Không thể tải ${fileName} từ Drive:`, e);
    }
    
    return localSaved ? JSON.parse(localSaved) : null;
  },

  async syncUsersToDrive(users: User[]) { return this.syncToDrive(USERS_FILE, users); },
  async loadUsersFromDrive() { return this.loadFromDrive(USERS_FILE); },
  
  async syncRequestsToDrive(requests: ProcurementRequest[]) { return this.syncToDrive(REQUESTS_FILE, requests); },
  async loadRequestsFromDrive() { return this.loadFromDrive(REQUESTS_FILE); }
};
