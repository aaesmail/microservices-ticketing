const OrdersIndex = ({ orders }) => {
  console.log(orders)

  return (
    <div className="container mt-4">
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            {order.ticket.title} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  )
}

OrdersIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get('orders')

  return { orders: data }
}

export default OrdersIndex
