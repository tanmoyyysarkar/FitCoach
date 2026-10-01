import { useRef } from "react"
import HeroSection from "../components/custom/HeroSection"
import ExploreSection from "../components/custom/ExploreSection"

export default function HomeScreen({ onOpenSignup, onOpenLogin, user }) {
  const exploreRef = useRef(null)

  const handleScrollToExplore = () => {
    if (exploreRef.current) {
      exploreRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="w-full">
      <HeroSection
        onOpenSignup={onOpenSignup}
        onOpenLogin={onOpenLogin}
        onExploreClick={handleScrollToExplore}
      />

      <div ref={exploreRef}>
        <ExploreSection
          onOpenSignup={onOpenSignup}
          user={user}
        />
      </div>
    </div>
  )
}
