
import { revertable } from "./utils";

const _passes = ["omit", "keep", "reduce"];

const verifyFn = (argMsg, fn, req=false)=>{
    if (typeof fn === "function") { return fn; }
    if (fn == null && !req) { return; }
    throw new Error(`${argMsg} must be typeof function`);
}

const defaultLogFormat = (kind, data, dir, s, c)=>{
    const symbol = kind === "error" ? (dir ? "─" : "⤫") : (dir ? "↓" :"↑");
    return (`${symbol} ${s}/${c} [${kind}] ${data?.message || data}`);
};

export class Revertable extends Array {

    constructor({logger, logFormat, pass="omit"}) {
        super();

        if (!_passes.includes(pass)) {
            throw new Error(`Option pass '${pass}' must be one of '${pass.join("', '")}'`);
        }

        Object.defineProperty(this, "pass", { value:pass });

        logger = verifyFn("Option logger", logger);

        if (logger) {
            logFormat = verifyFn("Option logFormat", logFormat) || defaultLogFormat;
            Object.defineProperty(this, "logger", {
                value:(data, kind, dir, s, c)=>logger(logFormat(kind, data, dir, s, c), kind, data, dir, s, c)
            });
        }
    }
    
    push(fwd, rwd) {
        super.push(Object.freeze({
            fwd:verifyFn("fwd", fwd, true),
            rwd:verifyFn("rwd", rwd, true)
        }));
        return this;
    }

    async run(value) {
        const { logger, pass, length } = this;
        const onError = logger ? (err, dir, s, c)=>{logger(err, "error", dir, s, c)} : undefined;
        const omit = pass == "omit";

        return revertable(!omit ? value : undefined, length, async (value, dir, s, c)=>{
            const { fwd, rwd } = this[s-1];
            const a = [];
            if (!omit) { a.push(value); }
            if (logger) { a.push((msg, kind="info")=>{logger(msg, kind, dir, s, c)}); }
            const r = await (dir ? fwd : rwd)(...a, s, c);
            if (!omit) { return pass == "keep" ? value : r; }
        }, onError);
    }

}

export default (opt)=>new Revertable(opt);
