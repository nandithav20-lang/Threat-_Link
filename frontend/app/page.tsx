import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { CapabilityStrip } from '@/components/landing/CapabilityStrip';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ThreatCorrelationSection } from '@/components/landing/ThreatCorrelationSection';
import { BlockchainEvidenceSection } from '@/components/landing/BlockchainEvidenceSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata = {
  title: 'ThreatLink AI — Connected Cyber Threat & Financial Crime Intelligence',
  description: 'Unify threat intelligence, Dark Web indicators, banking fraud analytics, AI agent findings, and EVM smart contract evidence verification into one platform.',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#060a12] text-white selection:bg-[#e4e4e7] selection:text-slate-950 font-sans">
      <LandingNavbar />
      <HeroSection />
      <CapabilityStrip />
      <ProblemSection />
      <HowItWorksSection />
      <ThreatCorrelationSection />
      <BlockchainEvidenceSection />
      <FinalCTASection />
      <LandingFooter />
    </main>
  );
}
