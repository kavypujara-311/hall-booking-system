import React, { useRef } from 'react';

// Sub-Components
import HeroSection from '../components/landing/HeroSection';
import GalleryMarquee from '../components/landing/GalleryMarquee';
import FeaturedSection from '../components/landing/FeaturedSection';
import TrustSection from '../components/landing/TrustSection';
import AboutSection from '../components/landing/AboutSection';
import ServicesSection from '../components/landing/ServicesSection';
import ContactSection from '../components/landing/ContactSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import ExperienceSection from '../components/landing/ExperienceSection';
import MembershipSection from '../components/landing/MembershipSection';
import FAQSection from '../components/landing/FAQSection';

const LandingPage = () => {
    const scrollRef = useRef(null);

    return (
        <div ref={scrollRef} className="bg-black min-h-screen text-white font-sans selection:bg-luxury-blue selection:text-black overflow-x-hidden relative">
            {/* Background Atmosphere Layers - Fixed across the entire landing page */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-black"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-luxury-blue/5 blur-[200px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-luxury-blue/5 blur-[200px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
            </div>

            <main className="relative z-10">
                <HeroSection />
                <GalleryMarquee />
                <FeaturedSection />
                <TrustSection />
                <ExperienceSection />
                <ServicesSection />
                <MembershipSection />
                <HowItWorksSection />
                <AboutSection />
                <FAQSection />
                <ContactSection />
            </main>
        </div>
    );
};

export default LandingPage;
