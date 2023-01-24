import { natsWrapper } from '../nats-wrapper'
import { OrderCreatedListener } from './order-created-listener'

new OrderCreatedListener(natsWrapper.client).listen()
