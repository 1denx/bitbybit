"use client";

import { LandingNav } from "@/src/components/landing/LandingNav";
import { HeroSection } from "@/src/components/landing/HeroSection";
import { FeaturesSection } from "@/src/components/landing/FeaturesSection";
import { TimeLineSection } from "@/src/components/landing/TimelineSection";
import { ShowcaseSection } from "@/src/components/landing/ShowcaseSection";
import { FaqSection } from "@/src/components/landing/FaqSection";
import { CtaSection } from "@/src/components/landing/CtaSection";
import { Footer } from "@/src/components/landing/Footer";
import { ScrollReveal } from "@/src/components/landing/ScrollReveal";
import "./landing.css";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <TimeLineSection />
      <ShowcaseSection />
      <FaqSection />
      <CtaSection />
      <Footer />
      <ScrollReveal />
    </div>
  );
}
