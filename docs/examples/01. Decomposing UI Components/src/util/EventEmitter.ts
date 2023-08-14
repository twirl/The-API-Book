import { IDisposer, IEventEmitter } from '../interfaces/common';

/**
 * A helper class to subscribe for events and emit them
 */
export class EventEmitter<EventList extends Record<string, any>>
    implements IEventEmitter<EventList>
{
    constructor() {}

    protected readonly listenersByType = new Map<
        string,
        Map<Disposer, Function>
    >();

    protected disposeCallback = (type: string, disposer: Disposer) => {
        const listeners = this.listenersByType.get(type);
        if (listeners !== undefined) {
            const callback = listeners.get(disposer);
            if (callback !== undefined) {
                listeners.delete(disposer);
                if (listeners.size === 0) {
                    this.listenersByType.delete(type);
                }
            }
        }
    };

    /**
     * Subscribes for an event
     * @returns a `Disposer` which allows to unsubscribe
     */
    public on<Type extends Extract<keyof EventList, string>>(
        type: Type,
        callback: (event: EventList[Type]) => void
    ): Disposer {
        const disposer = new Disposer(type, this.disposeCallback);
        const listeners = this.listenersByType.get(type);
        if (listeners === undefined) {
            this.listenersByType.set(
                type,
                new Map<Disposer, Function>([[disposer, callback]])
            );
        } else {
            listeners.set(disposer, callback);
        }
        return disposer;
    }

    /**
     * Emits an event, i.e., call all the subscribers for the
     * specified event type
     */
    public emit<Type extends Extract<keyof EventList, string>>(
        type: Type,
        event: EventList[Type]
    ) {
        const listeners = this.listenersByType.get(type);
        if (listeners !== undefined) {
            for (const callback of listeners.values()) {
                callback(event);
            }
        }
    }
}

export class Disposer implements IDisposer {
    protected active = true;

    constructor(
        protected readonly type: string,
        protected readonly callback: (type: string, disposer: Disposer) => void
    ) {}

    public off() {
        if (this.active) {
            this.callback(this.type, this);
            this.active = false;
        }
    }
}
