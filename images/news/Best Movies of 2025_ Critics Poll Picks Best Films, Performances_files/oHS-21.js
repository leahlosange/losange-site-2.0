( () => {
  (async () => {
        window.googletag = window.googletag || {
            cmd: []
        },
        console.log("oivt0", window.googletag.pubadsReady);
        let t = "0";
		try{
			const hc = window.navigator.hardwareConcurrency;
			if (typeof hc === 'number'){
				if (hc == 1 || hc > 24) {
					t = "1";
				}
			}
		} catch (o) {
			console.log("oivt1", window.googletag.pubadsReady, o.message)
		}
	  	try {
		  let m = "";
		  try { m = (new URL(location.href)).searchParams.get('utm_medium') || ""; } catch(_){}
		  if (!m && document.referrer) {
		    try { m = (new URL(document.referrer, location.href)).searchParams.get('utm_medium') || ""; } catch(_){}
		  }
		  if (m && m.trim().toLowerCase() === "email") t = "1";
		} catch (err) {
		  console.log("oivt-utm", window.googletag.pubadsReady, err.message);
		}
        window.googletag.cmd.push( () => {
            try {
                console.log("oivt3", window.googletag.pubadsReady),
                window.googletag.pubads().setTargeting("OIVT", t)
            } catch (o) {
                console.log("oivt2", window.googletag.pubadsReady, o.message)
            }
        }
        )
    }
    )();
}
)();