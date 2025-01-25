import React, { useState, useEffect } from "react";
import axios from "axios";
import Topbar from "../components/Topbar";
import Navbar from "../components/Navbar";
import post from "../assets/images/post.png";
import homefull from "../assets/images/home-full.png";
import profile from "../assets/images/profile.png";
import Searchbar from "../components/Searchbar"; 
import Showservice from "../components/Showservice";
import worker1 from "../assets/images/worker0.png"; 

function Workers() {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/workers');
        setWorkers(response.data);
        setFilteredWorkers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching workers:', err);
        setError('Failed to load workers');
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredWorkers(workers);
      return;
    }

    const searchTerms = query.toLowerCase().split(' ');
    const filtered = workers.filter(worker => {
      const workerText = `${worker.full_name} ${worker.skills?.join(' ')}`.toLowerCase();
      return searchTerms.every(term => workerText.includes(term));
    });

    setFilteredWorkers(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <Topbar workersBg="bg-yellow-400" />
      <div className="max-w-7xl mx-auto">
        <Searchbar onSearch={handleSearch} placeholder="Search for services or workers..." />
        
        {error && (
          <div className="text-red-500 text-center p-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center p-4">Loading workers...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4">
            {filteredWorkers.length === 0 ? (
              <div className="text-center p-4">
                {searchQuery ? `No workers found matching "${searchQuery}"` : 'No workers available'}
              </div>
            ) : (
              filteredWorkers.map((worker) => (
                <Showservice
                  key={worker.id}
                  image={worker.profile_pic || worker1}
                  title={worker.full_name}
                  price={worker.skills ? worker.skills.join(', ') : 'No skills listed'}
                  rating={worker.rating || 0}
                  totalJobs={worker.total_jobs || 0}
                />
              ))
            )}
          </div>
        )}
      </div>
      <Navbar posticon={post} homeicon={homefull} profileicon={profile} />
    </div>
  );
}

export default Workers;
