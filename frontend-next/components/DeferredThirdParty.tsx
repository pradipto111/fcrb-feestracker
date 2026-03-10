"use client";

import { useEffect } from "react";

let loaded = false;

function loadAnalyticsScript() {
  if (loaded) return;
  loaded = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-REALVERSE";
  document.head.appendChild(script);
}

export function DeferredThirdParty() {
  useEffect(() => {
    const trigger = () => loadAnalyticsScript();
    const timer = window.setTimeout(trigger, 5000);
    const options: AddEventListenerOptions = { once: true, passive: true };
    window.addEventListener("scroll", trigger, options);
    window.addEventListener("click", trigger, options);
    window.addEventListener("touchstart", trigger, options);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", trigger);
      window.removeEventListener("click", trigger);
      window.removeEventListener("touchstart", trigger);
    };
  }, []);

  return null;
}
