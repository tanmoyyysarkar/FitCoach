import { useEffect, useRef } from "react";
import HeroSection from "../components/custom/HeroSection";
import ExploreSection from "../components/custom/ExploreSection";

export default function HomeScreen({
  onOpenSignup,
  onOpenLogin,
  user,
  onLogout,
}) {
  const exploreRef = useRef(null);

  // The home page is a long-form, single-scroll marketing surface; hide the
  // native scrollbar (the project already ships a `.no-scrollbar` utility) so
  // the page feels cleaner while still scrolling normally.
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.add("no-scrollbar");
    body.classList.add("no-scrollbar");
    return () => {
      root.classList.remove("no-scrollbar");
      body.classList.remove("no-scrollbar");
    };
  }, []);

  const handleScrollToExplore = () => {
    if (exploreRef.current) {
      exploreRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full">
      <HeroSection
        onOpenSignup={onOpenSignup}
        onOpenLogin={onOpenLogin}
        onLogout={onLogout}
        user={user}
        onExploreClick={handleScrollToExplore}
      />

      <div ref={exploreRef}>
        <ExploreSection onOpenSignup={onOpenSignup} user={user} />
      </div>
    </div>
  );
}
