import React, { useEffect, useState } from "react";
import api from "../../api";
import Loading from "../../components/loading/Loading";
import { getToken, getUser } from "../../util";
import SmallServicesCard from "../../components/profil/SmallServicesCard";
import Window from "../../components/window/Window";
import BigServiceDetailCardForDashoard from "../../components/service/BigServiceDetailCardForDashoard";
import ChartStatistics from "../../components/chartJS/ChartStatistics";
import AdminCharts from "../../components/chartJS/AdminCharts";


const Statistics = () => {
  const [error, setError] = useState();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [auser, setAuser] = useState({});
  const [stats, setStats] = useState([]);
  const token = getToken();
  const userID = getUser()._id;
  const userRole = getUser().roles[0].name;
  
  const getUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers({
        headers: {
          Authorization: `Bearer ${token}`,
          id: userID,
        },
      });
      const usersWithRole = res.data.map((user) => ({
        ...user,
        role: user.roles[0].name,
      }));
      setUsers(usersWithRole);

    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
        setTimeout(() => {
          setError("");
        }, "5000");
      } else {
        setError("Une erreur s'est produite!");
        setTimeout(() => {
          setError("");
        }, "5000");
      }

    } finally {
      setLoading(false);
    }
  };

  const getStatistics = async (id) => {
    try {
      setLoading(true);
      const res = await api.getStats({
        headers: {
          Authorization: `Bearer ${token}`,
          id,
        },
      });
      setStats(res.data);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message);
        setTimeout(() => {
          setError("");
        }, "5000");
      } else {
        setError("Une erreur s'est produite!");
        setTimeout(() => {
          setError("");
        }, "5000");
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
    userRole === "provider" && getStatistics(userID);
  }, []);

  return (
    <div
      className="service-dashboard"
      style={{ height: "90vh", overflowY: "scroll" }}
    >
      {error && <p className="text-danger">{error}</p>}
      {/* get all users who are not customers on click of user, hit endpoint to get chart data and display charts for that user's services */}
      {userRole !== "provider" && (
        <>
          <table className="table">
            <thead>
              <tr className="title">
                <th>First name</th>
                <th>Last name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>

              </thead>
            <tbody>
              {users
                .filter((user) => user.role !== "customer")
                .map((user) => (
                  <tr key={user._id}>
                    <td className="text-table">{user.firstname}</td>
                    <td className="text-table">{user.lastname}</td>
                    <td className="text-table">{user.phone}</td>
                    <td className="text-table">{user.email}</td>
                    <td className="text-table">{user.role}</td>
                    <td className="">
                      <button
                        onClick={() => {
                          getStatistics(user._id);
                          setAuser(user);
                          const element = document.getElementById("graphs");
                          if (element) {
                            // 👇 Will scroll smoothly to the top of the next section
                            element.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                        className="btn btn-secondary"
                      >
                        Statistiques
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div id="graphs" className="mt-4">
            {stats.length > 0 && <AdminCharts data={stats} user={auser} />}
          </div>
        </>
      )}
      {userRole === "provider" && (
        <div id="graphs" className="mt-4">
          {stats?.length > 0 ? (
            <AdminCharts data={stats} user={getUser()} role={userRole} />
          ) : (
            <p>Vous n'avez pas de services, donc aucun statistiques.</p>
          )}
        </div>
      )}
      {loading && <Loading />} 
    </div>
  );
};

export default Statistics;
