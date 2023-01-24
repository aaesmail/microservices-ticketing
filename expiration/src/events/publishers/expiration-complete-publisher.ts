import { ExpirationCompleteEvent, Publisher, Subjects } from '@aaesmailtickets/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete
}
