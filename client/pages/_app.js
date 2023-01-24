import 'bootstrap/dist/css/bootstrap.css'

import buildClient from '/api/build-client'
import { Fragment } from 'react'
import Header from '/components/header'

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <Fragment>
      <Header currentUser={currentUser} />

      <Component
        currentUser={currentUser}
        {...pageProps}
      />
    </Fragment>
  )
}

AppComponent.getInitialProps = async ({ ctx, Component }) => {
  const client = buildClient(ctx)
  const { data } = await client.get('users/currentuser')

  let pageProps = {}

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(
      ctx,
      client,
      data.currentUser
    )
  }

  return {
    pageProps,
    ...data,
  }
}

export default AppComponent
