import { useState } from 'react';
import api from '../lib/axios';
import { useNavigate } from 'react-router-dom';

export default function FriendsPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
      setResults(res.data.users || res.data); 
    } catch (e) {
      console.error(e);
    }
  };

  const addFriend = async (userId) => {
    try {
      const res = await api.post('/friends', { requested_id: userId });
      const conv = res.data.conversation;
      if (conv) navigate(`/chat/${conv.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl">Find users</h2>
      <div className="flex gap-2 my-4">
        <input value={q} onChange={e=>setQ(e.target.value)} className="border p-2" />
        <button onClick={handleSearch} className="bg-blue-500 text-white px-3">Search</button>
      </div>

      <ul>
        {results.map(u => (
          <li key={u.id} className="flex justify-between py-2 border-b">
            <div>{u.name}</div>
            <button onClick={()=>addFriend(u.id)} className="bg-green-500 px-2 text-white">Add & Chat</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
