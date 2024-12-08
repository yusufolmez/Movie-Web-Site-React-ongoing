import { useEffect, useState } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('http://localhost:5000/users');
      const data = await response.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>All Users</h2>
      {users.map((user) => (
        <div key={user.auth0Id}>
          <p>{user.name}</p>
          <img src={user.picture} alt="Profile" />
        </div>
      ))}
    </div>
  );
};

export default UserList;
