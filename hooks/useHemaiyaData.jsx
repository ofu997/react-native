//import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import CONFIG from "../config";
import { cachedFetch } from "../utils/api_Hemaiya";

export const useHemaiyaData = (autoFetch = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const fetchUserData = async () => {
    try {
      const storedData = await axios.getItem("userData");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const id = parsedData.Id;
        setUserId(id);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchData = useCallback(
    async (force = false) => {
      console.log("fetchData called");
      console.log("userId:" + userId);
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await cachedFetch.get(
          `CasesAndChildrenForSocialWorker/${userId}`,
          force
        );
        console.log("response:", response);
        setData(response || []);
      } catch (err) {
        console.log("Axios error:", err);
        setError(err);
      } finally {
        console.log("fetchData completed");
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchUserData();
  }, []);

  // 👇 Trigger fetchData only when userId is ready and autoFetch is true
  useEffect(() => {
    if (userId !== null && autoFetch) {
      fetchData();
    }
  }, [userId, autoFetch, fetchData]);

  return { data, loading, error, fetchData };
};
export const CaseNoteAPI = (autoFetch = true, caseId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (force = false) => {
      if (!caseId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await cachedFetch.get(
          `CaseNoteByCaseId/${caseId}`,
          force
        );
        setData(response || []);
      } catch (err) {
        // Handle backend serialization errors (e.g., PeopleJson type mismatch)
        const errorData =
          typeof err?.response?.data === "string"
            ? err.response.data
            : JSON.stringify(err?.response?.data || {});
        const isPeopleJsonError =
          err?.response?.status === 500 && errorData.includes("PeopleJson");

        if (isPeopleJsonError) {
          console.warn(
            "Backend data serialization error detected. Some case notes may have invalid People data. Returning empty array."
          );
          setData([]); // Return empty array instead of crashing
          setError({
            message:
              "Some case notes could not be loaded due to data format issues.",
            type: "serialization_error",
          });
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    },
    [caseId]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  // 👇 Cache clearer + refetch
  const refreshCache = async () => {
    cachedFetch.clearCache(`CaseNoteByCaseId/${caseId}`);
    await fetchData(true);
  };
  console.log("data", data);
  return { data, loading, error, fetchData, refreshCache };
};
export const childAPI = (caseId) => {
  const [childData, setChildData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!caseId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${CONFIG.API_Hemaiya}/GetChildren/${caseId}`
      );
      setChildData(response.data || []);
    } catch (err) {
      setError(err);
      console.error("Axios error:", err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { childData, loading, error, fetchData };
};
export const parentAPI = (caseId) => {
  const [parentData, setParentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!caseId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${CONFIG.API_Hemaiya}/GetParents/${caseId}`
      );
      setParentData(response.data || []);
    } catch (err) {
      setError(err);
      console.error("Axios error:", err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { parentData, loading, error, fetchData };
};

export const teamAPI = (caseId) => {
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!caseId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${CONFIG.API_Hemaiya}/GetTeamMembers/${caseId}`
      );
      setTeamData(response.data || []);
    } catch (err) {
      console.log("Team API error:", err);
      setError(err);
      console.error("Axios error:", err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { teamData, loading, error, fetchData };
};
export const goalAPI = (caseId) => {
  const [goalData, setGoalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!caseId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${CONFIG.API_Hemaiya}/getgoals/${caseId}`
      );
      setGoalData(response.data || []);
    } catch (err) {
      setError(err);
      console.error("Axios error:", err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { goalData, loading, error, fetchData };
};

export const NoteAPI = (noteId) => {
  const [noteData, setNoteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!noteId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${CONFIG.API_Hemaiya}/getCaseNotes/${noteId}`
      );
      setNoteData(response.data || []);
    } catch (err) {
      setError(err);
      console.error("Axios error:", err);
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { noteData, loading, error, fetchData };
};
