// Converted to sync


export const revertable = (value, steps, fn, onError)=>{
    let dir=true, s = 1;
    const r = { status:"pass", pass:value };

    while (s > 0 && s <= steps) {
        try { r.pass = fn(r.pass, dir, s, steps); }
        catch (err) {
            if (onError) { onError(err, dir, s, steps); }
            r.status = dir ? "undo" : "fail";
            r[r.status] = err;
            r[r.status + "Step"] = s;
            if (dir) { dir = false; } else { break; }
        }
        s += dir*2-1;
    }

    if (r.pass === undefined) { delete r.pass; }

    return Object.freeze(r);
}

export const attempt = (exec, attemptCount=3, delay=2000)=>{
    let a = 1, e;

    while (true) {
        try { return exec(a); }
        catch(err) { e = err; }
        if (a >= attemptCount) { throw e; }
        a ++;
    }
}