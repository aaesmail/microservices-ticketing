import { useState, useCallback } from 'react'
import client from '/api/client'

const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null)

  const doRequest = useCallback(async (props = {}) => {
    try {
      setErrors(null)

      const response = await client[method](url, {
        ...body,
        ...props,
      })

      if (onSuccess) {
        onSuccess(response.data)
      }

      return response.data
    } catch (err) {
      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops...</h4>

          <ul className="my-0">
            {err.response.data.errors.map((error) => (
              <li key={error.message}>
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      )
    }
  }, [url, method, body, onSuccess])

  return [doRequest, errors]
}

export default useRequest
