import axios from 'axios';

const apiUrl = 'http://localhost:4500/api/games';

export const getGames = async () => {
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
};
