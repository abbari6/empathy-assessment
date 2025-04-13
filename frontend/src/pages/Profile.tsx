import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { InstagramUser } from "../types/instagram";
import MediaFeed from "../components/MediaFeed";

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<InstagramUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("instagram_token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("instagram_token");
        setToken(token);

        if (!token) {
          navigate('/login');
          throw new Error("No authentication token found");
        }
        const response = await axios.get<InstagramUser>(
          `https://graph.instagram.com/me?fields=id,name,username,account_type,media_count,followers_count,follows_count,profile_picture_url,biography,website&access_token=${token}`
        );
        setProfileData(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch profile data"
        );
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
        <strong>Error:</strong> {error}
      </div>
    </div>
  );

  if (!profileData) return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-md">
        No profile data available
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <button 
        onClick={handleLogout}
        className="absolute cursor-pointer z-10 top-10 right-10 flex items-center space-x-1 text-white hover:text-gray-200 transition-colors duration-200"
        title="Logout"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>

      {/* Profile Header with Gradient Background */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-t-xl p-6 shadow-lg relative">
        <div className="flex flex-col md:flex-row items-center">
          <div className="relative group">
            {profileData.profile_picture_url ? (
              <img
                src={profileData.profile_picture_url}
                alt={profileData.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg transform group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-4xl font-bold text-white border-4 border-white shadow-lg">
                {profileData.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="mt-4 md:mt-0 md:ml-8 text-center md:text-left">
            <h1 className="text-3xl font-bold text-white">{profileData.name}</h1>
            <h2 className="text-xl font-bold text-white">@{profileData.username}</h2>
            {profileData.account_type && (
              <span className="inline-block mt-2 px-3 py-1 bg-white bg-opacity-20 text-black rounded-full text-sm font-medium">
                {profileData.account_type.replace("_", " ")}
              </span>
            )}
            
            {profileData.biography && (
              <p className="mt-3 text-white text-opacity-90 max-w-lg">
                {profileData.biography}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white rounded-b-xl shadow-md px-6 py-4 flex justify-around border-t border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{profileData.media_count ?? "0"}</p>
          <p className="text-sm text-gray-500">Posts</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{profileData.followers_count ?? "0"}</p>
          <p className="text-sm text-gray-500">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{profileData.follows_count ?? "0"}</p>
          <p className="text-sm text-gray-500">Following</p>
        </div>
      </div>

      {/* Website Link */}
      {profileData.website && (
        <div className="mt-6 text-center">
          <a
            href={
              profileData.website.startsWith("http")
                ? profileData.website
                : `https://${profileData.website}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            <svg className="w-5 h-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            Visit Website
          </a>
        </div>
      )}

      {/* User's Media Section */}
      {token && (
        <div className="mt-12">
          <div className="border-b border-gray-200 pb-5 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <svg className="w-6 h-6 text-pink-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              Your Posts
            </h2>
          </div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
            <MediaFeed accessToken={token} />
          </div>
        </div>
      )}

      {/* Mobile Floating Logout Button */}
      <div className="fixed bottom-6 right-6 sm:hidden">
        <button 
          onClick={handleLogout}
          className="p-3 bg-pink-600 text-white rounded-full shadow-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
          title="Logout"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Profile;