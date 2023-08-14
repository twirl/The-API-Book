import { IEventEmitter } from './common';

/**
 * An interface of a “button” — a UI control
 * to represent a call to action.
 */
export interface IButton {
    action: string;
    events: IEventEmitter<IButtonEvents>;
    destroy: () => void;
}

export interface IButtonOptions {
    iconUrl?: string;
    text: string;
}

export interface IButtonEvents {
    press: IButtonPressEvent;
}

export interface IButtonPressEvent {
    target: IButton;
}
