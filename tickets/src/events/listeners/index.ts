import { natsWrapper } from '../nats-wrapper'
import { OrderCancelledListener } from './order-cancelled-listener'
import { OrderCreatedListener } from './order-created-listener'

new OrderCancelledListener(natsWrapper.client).listen()
new OrderCreatedListener(natsWrapper.client).listen()
