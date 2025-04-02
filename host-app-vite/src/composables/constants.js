export function useConstants(){
    const CONST_ACT_INVALID = -1;
    const CONST_ACT_PROC = 1;
    const CONST_ACT_SETUP = 2;
    const CONST_ACT_MACH = 3;

    const CONST_CODE_PROC = "R";
    const CONST_CODE_SETUP = "S";
    const CONST_CODE_MACH = "M";

    const COLOR_A = [
        "#4472C4", "#ED7D31", "#A5A5A5", "#FFC000", "#5B9BD5",
        "#70AD47", "#264478", "#9E480E", "#636363", "#997300",
        "#255E91", "#43682B", "#698ED0", "#F1975A", "#B7B7B7"
    ]


    return {
        CONST_ACT_INVALID,
        CONST_ACT_PROC,
        CONST_ACT_SETUP,
        CONST_ACT_MACH,

        CONST_CODE_PROC,
        CONST_CODE_SETUP,
        CONST_CODE_MACH,

        COLOR_A
    }
}