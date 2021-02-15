import {RGBA} from "../lib/highlighting/color.service";

export class RandomColorsService {
    private static hsv_to_rgb(h: number, s: number, v: number): RGBA {
        const h_i = Math.floor((h*6));
        const f = h*6 - h_i
        const p = v * (1 - s)
        const q = v * (1 - f*s)
        const t = v * (1 - (1 - f) * s)
        const resolveRgb = () => {
            switch(h_i) {
                case 0:
                    return [v, t, p];
                case 1:
                    return [q, v, p];
                case 2:
                    return [p, v, t];
                case 3:
                    return [p, q, v];
                case 4:
                    return [t, p, v];
                case 5:
                    return [v, p, q];
            }
        }
        const [r, g, b] = resolveRgb();
        return [Math.floor(r*256), Math.floor(g*256), Math.floor(b*256), 1]
    }

    public static randomColor(): RGBA {
        return this.hsv_to_rgb(Math.random(), 0.5, 0.95);
    }
}