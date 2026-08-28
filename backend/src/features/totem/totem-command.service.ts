import { Injectable } from '@nestjs/common';

export type CommandType = 'reboot' | 'force_sync' | 'change_content_mode';

export interface Command {
  type: CommandType;
}

@Injectable()
export class TotemCommandService {
  private readonly queues = new Map<number, Command[]>();

  enqueue(totemId: number, type: CommandType): void {
    const queue = this.queues.get(totemId) ?? [];
    queue.push({ type });
    this.queues.set(totemId, queue);
  }

  drain(totemId: number): Command[] {
    const queue = this.queues.get(totemId) ?? [];
    this.queues.delete(totemId);
    return queue;
  }
}
