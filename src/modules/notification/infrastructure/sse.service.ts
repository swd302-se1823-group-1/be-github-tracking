import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export interface SseEvent {
  type: string;
  data: Record<string, unknown>;
}

@Injectable()
export class SseService {
  private readonly subjects = new Map<string, Subject<SseEvent>>();

  /** Get or create a Subject (stream) per userId */
  getStream(userId: string): Observable<SseEvent> {
    if (!this.subjects.has(userId)) {
      this.subjects.set(userId, new Subject<SseEvent>());
    }
    return this.subjects.get(userId)!.asObservable();
  }

  /** Push a notification event to a specific user */
  emit(userId: string, event: SseEvent): void {
    const subject = this.subjects.get(userId);
    if (subject) {
      subject.next(event);
    }
  }

  /** Cleanup stream when client disconnects */
  closeStream(userId: string): void {
    const subject = this.subjects.get(userId);
    if (subject) {
      subject.complete();
      this.subjects.delete(userId);
    }
  }
}
