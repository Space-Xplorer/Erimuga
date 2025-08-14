import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OrderAnalytics from '../../components/Admin/OrderAnalytics';
import AdminSummary from '../../components/Admin/AdminSummary';

function Stats() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Fetch orders logic would go here
  }, []);

  return (
    <>
      <AdminSummary orders={orders} />
      <OrderAnalytics />
    </>
  );
}

export default Stats;