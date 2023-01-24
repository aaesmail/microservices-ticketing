import { natsWrapper } from '../nats-wrapper'
import { ExpirationCompleteListener } from './expiration-complete-listener'
import { PaymentCreatedListener } from './payment-created-listener'
import { TicketCreatedListener } from './ticket-created-listener'
import { TicketUpdatedListener } from './ticket-updated-listener'

new ExpirationCompleteListener(natsWrapper.client).listen()
new PaymentCreatedListener(natsWrapper.client).listen()
new TicketCreatedListener(natsWrapper.client).listen()
new TicketUpdatedListener(natsWrapper.client).listen()
