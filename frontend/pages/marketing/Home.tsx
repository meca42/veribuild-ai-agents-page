import { useEffect } from "react";
import Header from "../../components/marketing/Header";
import Hero from "../../components/marketing/Hero";
import LogoCloud from "../../components/marketing/LogoCloud";
import FeatureCards from "../../components/marketing/FeatureCards";
import HowItWorks from "../../components/marketing/HowItWorks";
import SolutionsByRole from "../../components/marketing/SolutionsByRole";
import Integrations from "../../components/marketing/Integrations";
import SecurityBand from "../../components/marketing/SecurityBand";
import Testimonials from "../../components/marketing/Testimonials";
import CTABand from "../../components/marketing/CTABand";
import Footer from "../../components/marketing/Footer";

export default function Home() {
  useEffect(() => {
    document.title = "VeriBuild - AI Agents for Construction | Drawings, RFIs, Inventory & Field Ops";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Centralize drawings, automate RFIs and submittals, track materials, and empower field teams with AI agents. Built for modern construction projects.");
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = "Centralize drawings, automate RFIs and submittals, track materials, and empower field teams with AI agents. Built for modern construction projects.";
      document.head.appendChild(meta);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:title");
      meta.content = "VeriBuild - AI Agents for Construction";
      document.head.appendChild(meta);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:description");
      meta.content = "Centralize drawings, automate RFIs and submittals, track materials, and empower field teams with AI agents.";
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <LogoCloud />
        <FeatureCards />
        <HowItWorks />
        <SolutionsByRole />
        <Integrations />
        <SecurityBand />
        <Testimonials />
        <CTABand />
      </main>
      <Footer />
      <script id="analytics">{`/* add analytics later */`}</script>
    </div>
  );
}
