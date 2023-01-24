import axios from 'axios'

export default ({ req }) => {
  if (typeof window === 'undefined') {
    return axios.create({
      baseURL: 'http://incluster-router-srv/api/',
      timeout: 5000,
      headers: req.headers,
    })
  } else {
    return axios.create({
      baseURL: '/api/',
      timeout: 5000,
    })
  }
}
