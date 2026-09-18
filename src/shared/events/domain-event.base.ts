import { v7 } from 'uuid';

export abstract class DomainEvent {
  public readonly aggregateId: string;
  public readonly eventId: string;
  public readonly occurredOn: Date;

  constructor(props: { aggregateId: string }) {
    this.aggregateId = props.aggregateId;
    this.eventId = v7();
    this.occurredOn = new Date();
  }
}
