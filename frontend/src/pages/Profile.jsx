import React from "react";
import Layout from '../components/Layout';
import UserProfile from "../components/UserProfile";
import Topbar2 from "../components/Topbar2";
import PostCard from "../components/PostCard";
import tv from '../assets/images/tv.png';
import car from '../assets/images/car.png';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pt-4">
        <UserProfile />
        <Topbar2 Posts="border-b-4" />
        <div className="max-w-7xl mx-auto px-4">
          <div className="m-3">
            <select
              name="Mode"
              id=""
              className="rounded-3xl border-gray-300 border p-2"
            >
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
            </select>
          </div>
          <PostCard
            Image={tv}
            Problem="Something wrong with the tv display"
            Time="Posted 3hrs ago"
          />
          <PostCard
            Image={car}
            Problem="Car starts but doesnt move when in gear"
            Time="Posted 1hr ago"
          />
        </div>
      </div>
    </Layout>
  );
}

export default Profile;
