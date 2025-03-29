

export const revertable = async (value, steps, fn, onError)=>{
    let dir=true, s = 1;
    const r = { status:"pass", pass:value };

    while (s > 0 && s <= steps) {
        try { r.pass = await fn(r.pass, dir, s, steps); }
        catch (err) {
            if (onError) { await onError(err, dir, s, steps); }
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


export const sleep = async ms=>new Promise(res=>setTimeout(res, ms));

export const attempt = async (exec, attemptCount=3, delay=2000)=>{
    let a = 1, e;

    while (true) {
        try { return await exec(a); }
        catch(err) { e = err; }
        if (a >= attemptCount) { throw e; }
        await sleep(delay);
        a ++;
    }
}