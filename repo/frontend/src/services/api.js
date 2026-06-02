import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const gardenAPI = {
  getZones: () => api.get('/garden/zones')
};

export const meetingsAPI = {
  getAll: () => api.get('/meetings'),
  getById: (id) => api.get(`/meetings/${id}`),
  create: (data) => api.post('/meetings', data),
  uploadAudio: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/meetings/${id}/upload-audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getDiscussions: (id) => api.get(`/meetings/${id}/discussions`),
  addDiscussion: (data) => api.post('/discussions', data)
};

export const minutesAPI = {
  generate: (meetingId, sendEmail = false) => 
    api.post('/minutes/generate', { meeting_id: meetingId, send_email: sendEmail }),
  getByMeetingId: (meetingId) => api.get(`/minutes/${meetingId}`)
};

export default api;
