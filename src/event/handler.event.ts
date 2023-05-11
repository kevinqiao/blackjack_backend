import { IEventHandler, EventsHandler } from '@nestjs/cqrs';
import {CustomEvent } from './custom.event';

@EventsHandler(CustomEvent)
export class CustomEventHandler implements IEventHandler<CustomEvent> {
    handle(event: CustomEvent) {
        // handle the event here
    }
}
