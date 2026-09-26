"use client";

import { useEffect } from "react";
import { useConsent } from "@/lib/consent";

// Measurement and marketing tools load only after consent for their category
// (design 9g). IDs come from the environment; a tool without an ID never loads.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type W = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; fbq?: unknown };

function addScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

export function Trackers() {
  const consent = useConsent();

  useEffect(() => {
    if (!consent) return;
    const w = window as W;
    const google = (consent.analytics && GA_ID) || (consent.marketing && ADS_ID);
    if (google) {
      w.dataLayer = w.dataLayer || [];
      // eslint-disable-next-line prefer-rest-params
      w.gtag = w.gtag || function () { w.dataLayer!.push(arguments); };
      // Consent Mode v2: everything denied until the visitor's choice.
      w.gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" });
      w.gtag("consent", "update", {
        analytics_storage: consent.analytics ? "granted" : "denied",
        ad_storage: consent.marketing ? "granted" : "denied",
        ad_user_data: consent.marketing ? "granted" : "denied",
        ad_personalization: consent.marketing ? "granted" : "denied",
      });
      w.gtag("js", new Date());
      if (consent.analytics && GA_ID) w.gtag("config", GA_ID);
      if (consent.marketing && ADS_ID) w.gtag("config", ADS_ID);
      addScript("gtag-js", `https://www.googletagmanager.com/gtag/js?id=${google}`);
    }
    if (consent.marketing && PIXEL_ID && !w.fbq) {
      const fbq = function (...args: unknown[]) {
        const f = fbq as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] };
        if (f.callMethod) f.callMethod(...args);
        else f.queue.push(args);
      } as unknown as { queue: unknown[]; loaded: boolean; version: string; push: unknown } & ((...a: unknown[]) => void);
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.push = fbq;
      w.fbq = fbq;
      addScript("fb-pixel", "https://connect.facebook.net/en_US/fbevents.js");
      fbq("init", PIXEL_ID);
      fbq("track", "PageView");
    }
  }, [consent]);

  return null;
}
