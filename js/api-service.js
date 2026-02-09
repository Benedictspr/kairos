
const API_BASE_URL = 'http://localhost:10000'; // Update this for production deployment

export const ApiService = {
    /**
     * Fetches a LiveKit access token from the backend.
     * @param {string} roomName - The name of the room to join.
     * @param {string} participantName - The name of the participant.
     * @returns {Promise<string>} - The JWT access token.
     */
    async getToken(roomName, participantName) {
        try {
            const response = await fetch(`${API_BASE_URL}/get-token?room=${encodeURIComponent(roomName)}&user=${encodeURIComponent(participantName)}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch token: ${response.statusText}`);
            }
            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error('Error fetching token:', error);
            throw error;
        }
    },

    /**
     * Checks if the backend server is reachable.
     * @returns {Promise<boolean>}
     */
    async checkHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
};
