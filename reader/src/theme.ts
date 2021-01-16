import {createMuiTheme} from "@material-ui/core/styles";
import {green, indigo} from "@material-ui/core/colors";

export const factorFunc = (factor: number ): number => {
    switch(factor) {
        case 0:
            return 0;
        case 1:
            // --space-xxxs: calc(0.25 * var(--space-unit));
            return 0.25;
        case 2:
            // --space-xxs: calc(0.375 * var(--space-unit));
            return 0.375;
        case 3:
            // --space-xs: calc(0.5 * var(--space-unit));
            return 0.5;
        case 4:
            // --space-sm: calc(0.75 * var(--space-unit));
            return 0.75;
        case 5:
            // --space-md: calc(1.25 * var(--space-unit));
            return 1.25;
        case 6:
            // --space-lg: calc(2 * var(--space-unit));
            return 2;
        case 7:
            // --space-xl: calc(3.25 * var(--space-unit));
            return 3.25;
        case 8:
            // --space-xxl: calc(5.25 * var(--space-unit));
            return 5.25;
        case 9:
            // --space-xxxl: calc(8.5 * var(--space-unit));
            return 8.5;
        default:
            throw new Error(`Bad factor ${factor}`)
    }
}

export const theme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: green,
    },
/*
    spacing: factor => {
        return `${factorFunc(factor)}rem`;
    },
*/
    typography: {
        fontFamily: '"Noto Sans", "Noto Sans CJK JP", sans-serif'
    },
});