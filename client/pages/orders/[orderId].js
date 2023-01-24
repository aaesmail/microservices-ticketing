import { useState, useEffect } from 'react'
import Router from 'next/router'
import StripeCheckout from 'react-stripe-checkout'
import useRequest from '/hooks/use-request'

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0)
  const [doRequest, errors] = useRequest({
    url: 'payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  })

  useEffect(() => {
    const findTimeLeft = () => {
      const milliSecondsLeft = new Date(order.expiresAt) - new Date()
      setTimeLeft(Math.round(milliSecondsLeft / 1000))
    }

    findTimeLeft()

    const timerId = setInterval(findTimeLeft, 1000)

    return () => {
      clearInterval(timerId)
    }
  }, [order])

  if (timeLeft < 0) {
    return (
      <div className="container mt-4">
        Order Expired
      </div>
    )
  }

  return (
    <div className="container mt-4">
      Time left to pay: {timeLeft} seconds

      <div className="mb-5" />

      {errors}

      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey={process.env.NEXT_PUBLIC_STRIPE_KEY}
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  )
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query
  const { data } = await client.get(`orders/${orderId}`)

  return { order: data }
}

export default OrderShow
