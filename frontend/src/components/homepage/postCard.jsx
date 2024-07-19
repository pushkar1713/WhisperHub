import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaRegComment } from 'react-icons/fa';
import { AiOutlineLike, AiOutlineDislike } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { fetchOwnerDetails } from '../../api/fetchOwnerDetails.js';
import { fetchCategoryDetails } from '../../api/fetchCategoryDetails.js';

const url = import.meta.env.VITE_BASE_URL || 'http://localhost:8000/';

const PostCard = ({ title, description, owner, votes, updatedAt, media, comments, category, _id }) => {
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [error, setError] = useState(null);
  const [userVote, setUserVote] = useState(null);

  const currentUser = useSelector((state) => state.auth.user?.data?.user?._id);

  const handleVote = async (voteType) => {
    try {
      const response = await axios.post(`${url}vote/create-vote/${_id}`, { voteType }, {
        withCredentials: true
      });
      console.log('Vote response:', response.data);
      setUserVote(voteType);
      // Optionally update the UI with the new vote
    } catch (error) {
      console.error('Error casting vote:', error);
      alert(error.response?.data?.message || "Error casting vote");
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [ownerResponse, categoryResponse] = await Promise.all([
          fetchOwnerDetails(owner),
          fetchCategoryDetails(category)
        ]);
        setOwnerDetails(ownerResponse);
        setCategoryDetails(categoryResponse);
      } catch (error) {
        setError('Error fetching details');
        console.error('Error fetching details:', error);
      }
    };

    fetchDetails();
  }, [owner, category]);

  useEffect(() => {
    if (currentUser) {
      const userVote = votes.find(vote => vote.voteOwner === currentUser);
      if (userVote) {
        setUserVote(userVote.voteType);
      }
    }
  }, [currentUser, votes]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const voteCount = votes.length;
  const commentCount = comments.length;

  return (
    <Link to={`/post/${_id}`} >
      <div className="post-card bg-white border py-4 px-8 shadow-md w-[500px] max-h-[500px]">
        <div className='flex gap-10'>
          {ownerDetails && (
            <div className="owner-info flex items-center mb-4 gap-4">
              <img
                src={ownerDetails.avatar}
                alt={`Avatar of ${ownerDetails.userName}`}
                className="w-10 h-10 rounded-full mr-2"
              />
              <div>
                <span className="font-bold">{ownerDetails.userName}</span>
                <p className='text-sm'> {new Date(updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          <p className='text-sm'>{categoryDetails}</p>
        </div>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-gray-700">{description}</p>
          {media && (
            <div className="media mt-4">
              <img src={media} alt="Media content" className="max-w-full h-auto rounded-md" />
            </div>
          )}
          <div className="text-sm text-gray-500 flex gap-10 mt-2">
            <div className='flex gap-2'>
              <div className='flex'>
                <AiOutlineLike
                  size={30}
                  className={`p-1 rounded-full ${userVote === "upvote" ? 'text-red-500 bg-red-300' : 'hover:text-red-500 hover:bg-red-300'}`}
                  onClick={() => handleVote("upvote")}
                />
                <AiOutlineDislike
                  size={30}
                  className={`p-1 rounded-full ${userVote === "downvote" ? 'text-green-500 bg-green-300' : 'hover:text-green-500 hover:bg-green-300'}`}
                  onClick={() => handleVote("downvote")}
                />
              </div>
              <p className='text-xl'>{voteCount}</p>
            </div>
            <div className='flex gap-2'>
              <FaRegComment size={30} className='hover:text-blue-500 p-1 hover:bg-blue-300 rounded-full'/>
              <p className='text-xl'>{commentCount}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;