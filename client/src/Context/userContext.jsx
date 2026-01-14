import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router"; 
import axios from "axios";

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [type, setType] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:3000/get-user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && res.data.user) {
          setUser(res.data.user);
          setType(res.data.type);
        } else {
          setUser(null);
          setType("");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
        setType("");
        setToken("");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  



  useEffect(() => {
    if (loading) return; 

    if (type === "Admin") {
      navigate("/admin/dashboard");
    } else if (type === "DepartmentHead") {
      navigate("/departmenthead");
    } else if (type === "Worker") {
      navigate("/worker");
    } else if (type === "Citizen") {
      navigate("/citizen/portal/dashboard");
    } else {
      navigate("/"); 
    }
  }, [type, loading]);


  const login = (newToken, newUser, newType) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
    setType(newType);
  };

 
  const logout = () => {
    setToken("");
    setUser(null);
    setType("");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <UserContext.Provider
      value={{ user, type, token, login, logout, loading, setUser, setType }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
