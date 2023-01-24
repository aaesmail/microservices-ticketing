import Router from 'next/router'
import useRequest from '/hooks/use-request'

const TicketShow = ({ ticket }) => {
  const [doRequest, errors] = useRequest({
    url: 'orders',
    method: 'post',
    body: { ticketId: ticket.id },
    onSuccess: (order) => Router.push('/orders/[orderId]', `/orders/${order.id}`),
  })

  return (
    <div className="container mt-4">
      <h1 className="mb-3">
        {ticket.title}
      </h1>

      <h4 className="mb-3">
        Price: {ticket.price}
      </h4>

      {errors}

      <button
        className="btn btn-primary"
        onClick={() => doRequest()}
      >
        Purchase
      </button>
    </div>
  )
}

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query
  const { data } = await client.get(`tickets/${ticketId}`)

  return { ticket: data }
}

export default TicketShow
