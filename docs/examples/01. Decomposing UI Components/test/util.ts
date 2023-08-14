/**
 * @fileoverview
 * Various helpers for testing the components
 */

import { IEventEmitter } from '../src/interfaces/common';

export async function waitForEvents<
    EventList extends Record<string, any>,
    Type extends Extract<keyof EventList, string>
>(
    emitter: IEventEmitter<EventList>,
    type: Type,
    callback: () => void,
    n: number = 1
): Promise<Array<EventList[Type]>> {
    let counter = 0;
    const result = [];
    const disposers = [];
    return new Promise((resolve) => {
        const disposer = emitter.on(type, (event) => {
            result.push(event);
            if (++counter >= n) {
                setTimeout(() => {
                    for (const disposer of disposers) {
                        disposer.off();
                    }
                    resolve(result);
                }, 0);
            }
        });
        disposers.push(disposer);
        callback();
    });
}

export function defer<T>() {
    let resolve: (result: T) => void;
    let reject: (error: any) => void;
    const promise = new Promise<T>((nestedResolve, nestedReject) => {
        resolve = nestedResolve;
    });
    return {
        resolve,
        reject,
        promise
    };
}

export function omitUndefined<T>(obj: T): Partial<T> {
    const result: Partial<T> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined) {
            result[k] = v;
        }
    }
    return result;
}
