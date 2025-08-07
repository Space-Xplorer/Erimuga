// import React, { useContext, useEffect, useState } from 'react';
// import axios from 'axios';
// import OrderCard from '../components/User/OrderCard';
// import { ShopContext } from '../context/ShopContext';

// const UserDashboard = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const {authUser} = useContext(ShopContext); // Assuming you have a useAuth hook to get the authenticated user
//   const userId = authUser?._id; // Get the authenticated user's ID

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5000/orders/user/${userId}`);
//         setOrders(res.data);
//       } catch (error) {
//         console.error("Error fetching user orders:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [userId]);

//   return (
//     <div className="p-6">
//       <h2 className="text-3xl font-bold mb-6">🛍️ My Orders</h2>

//       {loading ? (
//         <p>Loading orders...</p>
//       ) : orders.length === 0 ? (
//         <p className="text-gray-500">You haven’t placed any orders yet.</p>
//       ) : (
//         <div className="space-y-4">
//           {orders.map((order) => (
//             <OrderCard key={order._id} order={order} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserDashboard;



import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import OrderCard from '../components/User/OrderCard';
import { ShopContext } from '../context/ShopContext';

const UserDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  const { authUser } = useContext(ShopContext);
  const userId = authUser?._id;

  // Fetch Orders
  useEffect(() => {
    if (!userId) return;
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/orders/user/${userId}`);
        setOrders(res.data);
      } catch (error) {
        console.error("Error fetching user orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [userId]);

  // Fetch User Details
  useEffect(() => {
    if (!userId) return;
    const fetchUserDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/user/auth/${userId}`);
        setUserDetails(res.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserDetails();
  }, [userId]);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">👤 My Account</h2>

      {loadingUser ? (
        <p>Loading user details...</p>
      ) : userDetails ? (
        <div className="mb-8 bg-gray-100 p-4 rounded">
          <p><strong>Name:</strong> {userDetails.name}</p>
          <p><strong>Email:</strong> {userDetails.email}</p>
          {userDetails.phonenumber && (
            <p><strong>Phone:</strong> {userDetails.phonenumber}</p>
          )}

        </div>
      ) : (
        <p className="text-red-500">Failed to load user details</p>
      )}

      <h2 className="text-2xl font-semibold mb-4">🛍️ My Orders</h2>
      {loadingOrders ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">You haven’t placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
