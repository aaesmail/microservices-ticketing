import Link from 'next/link'

const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((ticket) => (
    <tr key={ticket.id}>
      <td>{ticket.title}</td>

      <td>{ticket.price}</td>

      <td>
        <Link
          href="/tickets/[ticketId]"
          as={`/tickets/${ticket.id}`}
        >
          View
        </Link>
      </td>
    </tr>
  ))

  return (
    <div className="container mt-4">
      <h1>Tickets</h1>

      <table className="table mt-3">
        <thead>
          <tr>
            <th>Title</th>

            <th>Price</th>

            <th>Link</th>
          </tr>
        </thead>

        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
  )
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('tickets')

  return { tickets: data }
}

export default LandingPage
