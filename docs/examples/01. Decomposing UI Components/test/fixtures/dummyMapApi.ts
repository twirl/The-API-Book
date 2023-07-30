import { ILocation } from '../../src/interfaces/common';

export class DummyMapApi {
    protected listenerDisposers: Array<() => void> = [];

    constructor(
        protected container: HTMLElement,
        protected bounds: [[number, number], [number, number]]
    ) {
        this.container.style.cssText = [
            'background-image: url(../../assets/map.jpg)',
            'background-position: center',
            'background-repeat: no-repeat',
            'background-size: cover',
            'position: relative',
            'width: 100%',
            'height: 100%'
        ].join(';');
    }

    public addMarker(
        markerId: string,
        location: ILocation,
        onClick: (markerId: string) => void
    ) {
        const rect = this.container.getBoundingClientRect();
        const x =
            Math.floor(
                (rect.width * (location.longitude - this.bounds[0][0])) /
                    (this.bounds[1][0] - this.bounds[0][0])
            ) - 15;
        const y =
            Math.floor(
                (rect.height * (this.bounds[1][1] - location.latitude)) /
                    (this.bounds[1][1] - this.bounds[0][1])
            ) - 30;
        const marker = document.createElement('div');
        marker.style.cssText = [
            'position: absolute',
            'width: 30px',
            'height: 30px',
            `left: ${x}px`,
            `top: ${y}px`,
            'align: center',
            'line-height: 30px',
            'font-size: 30px',
            'cursor: pointer'
        ].join(';');
        marker.innerHTML =
            '<a href="javascript:void(0)" style="text-decoration: none;">📍</a>';

        const listener = () => onClick(markerId);
        this.listenerDisposers.push(() => {
            marker.removeEventListener('click', listener, false);
        });
        marker.addEventListener('click', listener, false);

        this.container.appendChild(marker);
    }

    public destroy() {
        for (const dispose of this.listenerDisposers) {
            dispose();
        }
        this.listenerDisposers = [];
        this.container.innerHTML = '';
        this.container.style.cssText = '';
    }
}
