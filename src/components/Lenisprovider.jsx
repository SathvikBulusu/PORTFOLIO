import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Singleton reference — lets any component (like Work's full-screen
   overlay) lock/unlock page scroll without needing React Context. */
let lenisInstance = null;
export function getLenis() {
  return lenisInstance;
}

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Lenis normally captures wheel/touch on the whole window to drive
      // its smooth-scroll on the body. Any element matching this predicate
      // is explicitly excluded — Lenis won't touch it, native overflow
      // scroll takes over completely. This is the documented way to nest
      // an independently-scrollable overlay (like a full-screen modal)
      // inside a page that Lenis otherwise owns. Without this, calling
      // lenis.stop() halts Lenis's own animation but does NOT release its
      // window-level listener — scroll input aimed at a nested container
      // gets swallowed by that listener and goes nowhere, which is exactly
      // the "stuck" behavior being reported.
      prevent: node => node.closest("[data-lenis-prevent]"),
    });
    lenisInstance = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}

export function useGsapReveal() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".rv").forEach(el => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.65, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%" } }
        );
      });
    });
    return () => ctx.revert();
  }, []);
}