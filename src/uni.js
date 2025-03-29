


const _passModes = ["omit", "keep", "reduce"];

export const verifyFn = (argMsg, fn, req=false)=>{
    if (typeof fn === "function") { return fn; }
    if (fn == null && !req) { return; }
    throw new Error(`${argMsg} must be typeof function`);
}

export const verifyPassMode = (passMode)=>{
    if (_passModes.includes(passMode)) { return passMode; }
    throw new Error(`Option pass '${passMode}' must be one of '${_passModes.join("', '")}'`);
}

export const defaultLogFormat = (kind, data, dir, s, c)=>{
    const symbol = kind === "error" ? (dir ? "─" : "⤫") : (dir ? "↓" :"↑");
    return (`${symbol} ${s}/${c} [${kind}] ${data?.message || data}`);
};
