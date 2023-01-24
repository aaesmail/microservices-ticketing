import { useState } from 'react'
import Router from 'next/router'
import useRequest from '/hooks/use-request'

const NewTicket = () => {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')

  const [doRequest, errors] = useRequest({
    url: 'tickets',
    method: 'post',
    body: { title, price },
    onSuccess: () => Router.push('/'),
  })

  const onBlurPrice = () => {
    const value = parseFloat(price)

    if (isNaN(value)) return

    setPrice(value.toFixed(2))
  }

  const onSubmit = (event) => {
    event.preventDefault()

    doRequest()
  }

  return (
    <div className="container mt-4">
      <h1>Create a Ticket</h1>

      <form onSubmit={onSubmit}>
        <div className="form-group mt-4">
          <label>Title</label>

          <input
            className="form-control mt-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="form-group mt-4 mb-4">
          <label>Price</label>

          <input
            className="form-control mt-2"
            value={price}
            onBlur={onBlurPrice}
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>

        {errors}

        <button className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  )
}

export default NewTicket
