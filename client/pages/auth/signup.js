import { useState, useCallback } from 'react'
import Router from 'next/router'
import useRequest from '/hooks/use-request'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [doRequest, errors] = useRequest({
    url: 'users/signup',
    method: 'post',
    body: { email, password },
    onSuccess: () => Router.push('/'),
  })

  const onSubmit = useCallback((event) => {
    event.preventDefault()

    doRequest()
  }, [doRequest])

  return (
    <form
      className="container mt-4"
      onSubmit={onSubmit}
    >
      <h1>Sign Up</h1>

      <div className="form-group mt-4">
        <label>Email Address</label>

        <input
          className="form-control mt-2"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="form-group mt-3 mb-3">
        <label>Password</label>

        <input
          type="password"
          className="form-control mt-2"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {errors}

      <button className="btn btn-primary mt-3">
        Sign Up
      </button>
    </form>
  )
}

export default Signup
