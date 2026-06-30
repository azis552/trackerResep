const API_URL = import.meta.env.VITE_API_URL;
const TOKEN = import.meta.env.VITE_API_TOKEN;

const fetchData = async (type = "semua") => {
  try {
    setLoading(true);

    let url = `${API_URL}/reseptracker/?action=list`;

    switch (type) {
      case "ranap":
        url = `${API_URL}/reseptracker/?action=list&jenis=ranap`;
        break;

      case "rajal":
        url = `${API_URL}/reseptracker/?action=list&jenis=rajal`;
        break;

      case "belum_penyerahan":
        url = `${API_URL}/reseptracker/?action=list&only_active=1`;
        break;

      default:
        url = `${API_URL}/reseptracker/?action=list`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }

    const json = await res.json();

    console.log("API Response:", json);

    if (Array.isArray(json)) {
      setData(json);
    } else if (json?.data && Array.isArray(json.data)) {
      setData(json.data);
    } else {
      setData([]);
    }

  } catch (err) {
    console.error("Fetch Error:", err);
    setData([]);

  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchData("semua");
}, []);