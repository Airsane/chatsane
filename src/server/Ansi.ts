import * as util from "util";

var
    CSI = '\x1B[';

function esc(param: any) {
    return CSI + param;
}

export default class Ansi {
    private static out = process.stdout;

    public static row(num: number) {
        return this.move(num);
    }

    public static move(row: number, col: number = 0) {
        const cmd = util.format('%d;%df', row, col);
        this.out.write(esc(cmd));
        return this;
    }

    public static clear(){
        this.out.write(esc('2J'));
        return this;
    }

    public static clearLine() {
        this.out.write(esc('2K'));
        return this;
    }
}