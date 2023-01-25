# Microservices Ticketing

A Microservies based architecture using Nodejs to create an application where all services has its own database and they replicate data for high availability using event bus NATS Streaming

The cluster uses an Ingress Nginx Object to route all data to its respective service
The backend services communicate using event-bus only (no direct communication happens between any service)

A Frontend using Next.js has users and tickets creating, deleting, booking & purchasing
There is a common library that is hosted on npm that all services install to share definitions of events so that all services can get typescript support on events

Services:
  - Auth: Handles Signup, Signin & Logout
  - Expiration: Calculates expiration date for an order and communicates it to other services using event
  - Orders: Handles all order related operations like reading, updating & deleting
  - Payments: Handles payment of all orders in the application
  - Tickets: Handles all ticket related operations like reading, updating & deleting


Technologies:
- Kubernetes
- NATS Streaming
- Docker
- Redis
- Express
- Nodejs
- React
- Next.js
- MongoDB
- Typescript

To Run the application you have to set the following secrets in your cluster
  - Secret Name: jwt-secret - Key: JWT_KEY - Value: Your secret for signing tokens
  - Secret Name: stripe-secret - Key: STRIPE_KEY - Value: Your Stripe secret key
