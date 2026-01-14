import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function Map() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token"); // get JWT from storage
        const res = await fetch("http://localhost:3000/admin/map", {
          headers: {
            Authorization: `Bearer ${token}`, // pass JWT to backend
          },
        });

        if (!res.ok) throw new Error("Failed to fetch complaints");

        const data = await res.json();
        setComplaints(data); // set complaint data
      } catch (err) {
        console.error("Error fetching complaints:", err);
      }
    };

    fetchComplaints();
  }, []);

  useEffect(() => {
    // prevent duplicate init
    const container = L.DomUtil.get("map");
    if (container != null) {
      container._leaflet_id = null;
    }

    const map = L.map("map").setView([19.1698, 72.8481], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // add complaint markers
    complaints.forEach((c) => {
      if (c.locationLat && c.locationLong) {
        L.marker([c.locationLat, c.locationLong])
          .addTo(map)
          .bindPopup(`
            <b>Category:</b> ${c.category}<br/>
            <b>Status:</b> ${c.status}<br/>
            <b>Priority:</b> ${c.priority}<br/>
            <b>Description:</b> ${c.description || "N/A"}
          `);
      }
    });

    return () => map.remove();
  }, [complaints]); // rerun when complaints load

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">All Complaints on Map</h2>
      <div id="map" style={{ height: "600px", width: "100%" }}></div>
    </div>
  );
}











