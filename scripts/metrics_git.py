import os, sys, json, subprocess, statistics, argparse
from datetime import datetime, timedelta, timezone
from collections import Counter

def sh(cmd): return subprocess.check_output(cmd, shell=True, text=True).strip()

def commits_since(days):
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    fmt = "%H|%ct|%an|%s"
    out = sh(f"git log --since='{since}' --pretty=format:'{fmt}' --no-merges") if days else \
          sh(f"git log --pretty=format:'{fmt}' --no-merges")
    items=[]
    if out:
        for line in out.splitlines():
            try:
                h, ts, an, msg = line.split("|",3)
                files = sh(f"git diff-tree --no-commit-id --name-only -r {h}")
                scope = "frontend" if any(p.startswith("frontend/") for p in files.splitlines()) else \
                        "backend"  if any(p.startswith("backend/")  for p in files.splitlines()) else "mixed"
                items.append((h,int(ts),an,msg,scope))
            except Exception: pass
    return items

def numstat_since(days):
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    out = sh(f"git log --since='{since}' --numstat --pretty=format:'COMMIT:%H' --no-merges") if days else \
          sh(f"git log --numstat --pretty=format:'COMMIT:%H' --no-merges")
    add=del_ = 0; file_hits=Counter()
    for ln in out.splitlines():
        if not ln or ln.startswith("COMMIT:"): continue
        p=ln.split("\t")
        if len(p)==3:
            a,d,f=p
            if a.isdigit(): add+=int(a)
            if d.isdigit(): del_+=int(d)
            file_hits[f]+=1
    return add, del_, file_hits.most_common(20)

def envf(k):
    v=os.getenv(k); return float(v) if v else None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--window-days", type=int, default=90)
    ap.add_argument("--out", default="metrics.json")
    args=ap.parse_args()

    cs=commits_since(args.window_days)
    ts=sorted(t for _,t,_,_,_ in cs)
    gaps=[t2-t1 for t1,t2 in zip(ts, ts[1:])]
    avg_gap_h=(sum(gaps)/len(gaps)/3600.0) if gaps else None
    weeks=max(args.window_days/7.0,1.0)
    per_week=len(cs)/weeks
    authors=Counter(a for *_,a,_,_ in cs).most_common(10)
    scopes=Counter(s for *_,s in cs)
    added,deleted,hot=numstat_since(args.window_days)

    bench={
        "SP":{"commits_wk":envf("SP_COMMITS_WK"),"time_between_h":envf("EU_TIME_BETWEEN_H")},
        "EU":{"commits_wk":envf("EU_COMMITS_WK"),"time_between_h":envf("EU_TIME_BETWEEN_H")},
        "US":{"commits_wk":envf("US_COMMITS_WK"),"time_between_h":envf("US_TIME_BETWEEN_H")},
    }
    def comp(r, v, k):
        b=bench[r][k]; return round(v-b,2) if (v is not None and b is not None) else None

    data={
        "window_days":args.window_days,
        "commits_total":len(cs),
        "commits_per_week":round(per_week,2),
        "avg_gap_hours": round(avg_gap_h,2) if avg_gap_h else None,
        "authors_top":authors,
        "scope_counts":scopes,
        "added_lines":added,"deleted_lines":deleted,"hot_files":hot,
        "comparisons":{
            r:{"commits_wk_delta":comp(r,per_week,"commits_wk"),
               "time_between_delta_h":comp(r,avg_gap_h,"time_between_h")}
            for r in ("SP","EU","US")
        },
    }
    open(args.out,"w").write(json.dumps(data, indent=2))
    print(f"Wrote {args.out}")

if __name__=="__main__": main()
