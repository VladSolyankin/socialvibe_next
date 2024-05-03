// main.js
import getSpotifyToken from "./token.tsx";

const BASE_URL = "https://api.spotify.com/v1";

async function getAllArtists(query) {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `${BASE_URL}/search?q=${query}&type=artist&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    return data.artists;
  } catch (error) {
    console.error("Error getting artists:", error.message);
    throw error;
  }
}

async function getTracks(query) {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `${BASE_URL}/search?q=${query}&type=track&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    return data.tracks;
  } catch (error) {
    console.error("Error getting tracks:", error.message);
    throw error;
  }
}

async function getSearchedTracks(query, offset) {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `${BASE_URL}/search?q=${query}&type=track&limit=10&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    return data.tracks;
  } catch (error) {
    console.error("Error getting searched tracks:", error.message);
    throw error;
  }
}

async function getTracksByIds(ids) {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(`${BASE_URL}/tracks?ids=${ids}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.tracks;
  } catch (error) {
    console.error("Error getting tracks by IDs:", error.message);
    throw error;
  }
}

async function getPlaylists(query) {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `${BASE_URL}/search?q=${query}&type=playlist&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    return data.playlists;
  } catch (error) {
    console.error("Error getting playlists:", error.message);
    throw error;
  }
}

async function getPlaylistTracks() {
  const popularRussianArtists = [
    "Сметана Band",
    "три дня дождя",
    "Порнофильмы",
    "Тараканы!",
    "Станционный смотритель",
    "Время",
    "Grad!ent",
    "Kotone",
    "Panda",
    "Диктофон",
    "Onsa Media",
    "Jackie-O",
    "Sati Akura",
    "Спасибо",
    "Dmitry Taranov",
    "РОБОКОТ",
    "СЛОТ",
    "Inside",
  ];
  try {
    const token = await getSpotifyToken();
    const playlistTracks = await Promise.all(
      popularRussianArtists.map(async (artist) => {
        const token = await getSpotifyToken();
        const response = await fetch(
          `${BASE_URL}/search?q=${artist}&type=track&`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { tracks } = await response.json();
        return tracks.items;
      })
    );

    const flatenedTracks = playlistTracks.flat();

    const randomNumber = Math.floor(Math.random() * flatenedTracks.length);

    return playlistTracks.flat().slice(0, randomNumber);
  } catch (error) {
    console.error("Error getting playlist tracks:", error.message);
    throw error;
  }
}

async function getPopularTracks() {
  try {
    const popularArtists = [
      "ariana grande",
      "eminem",
      "billie elish",
      "justin bieber",
      "rap",
      "hip hop",
      "lucas graham",
      "marshmellow",
    ];

    const popularTracks = await Promise.all(
      popularArtists.map(async (artist) => {
        const token = await getSpotifyToken();
        const response = await fetch(
          `${BASE_URL}/search?q=${artist}&type=track&`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { tracks } = await response.json();
        return tracks.items;
      })
    );
    return popularTracks.flat();
  } catch (error) {
    console.error("Error getting popular tracks:", error.message);
    throw error;
  }
}

export {
  getAllArtists,
  getTracks,
  getSearchedTracks,
  getTracksByIds,
  getPlaylists,
  getPlaylistTracks,
  getPopularTracks,
};
