
import { defaultLogFormat, verifyFn, verifyPassMode } from "../uni";
import { revertable } from "./utils";

export const wrapWithLogMsg = (passMode, msg, fn)=>{
    if (!fn) { return; }
    return async (a1, a2, ...a)=>{
        await (passMode === "omit" ? a1 : a2)(msg);
        return fn(a1, a2, ...a);
    }
}

export class Revertable extends Array {

    constructor({logger, logFormat, pass="omit"}) {
        super();

        Object.defineProperty(this, "passMode", { value:verifyPassMode(pass) });

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
            rwd:verifyFn("rwd", rwd)
        }));
        return this;
    }

    pushNamed(fwdName, fwd, rwdName, rwd) {
        const { logger, passMode } = this;
        if (!logger) { throw new Error("pushNamed(...) requires opt.logger to be provided"); }
        return this.push(
            wrapWithLogMsg(passMode, fwdName, verifyFn("fwd", fwd, true)),
            wrapWithLogMsg(passMode, rwdName, verifyFn("rwd", rwd))
        )
    }

    async run(value) {
        const { logger, passMode, length } = this;
        const onError = logger ? (err, dir, s, c)=>logger(err, "error", dir, s, c) : undefined;
        const omit = passMode == "omit";

        return revertable(!omit ? value : undefined, length, async (value, dir, s, c)=>{
            const { fwd, rwd } = this[s-1];
            const wd = dir ? fwd : rwd;
            if (!wd) { return !omit ? value : undefined; }
            const a = [];
            if (!omit) { a.push(value); }
            if (logger) { a.push((msg, kind="info")=>logger(msg, kind, dir, s, c)); }
            const r = await wd(...a, s, c);
            if (!omit) { return passMode == "keep" ? value : r; }
        }, onError);
    }

}

export default (opt)=>new Revertable(opt);
