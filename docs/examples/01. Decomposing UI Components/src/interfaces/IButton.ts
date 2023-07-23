import { IEventEmitter } from './common';

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
