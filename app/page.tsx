'use client';

import Scene from '@/components/Scene';
import Loader from '@/components/Loader';
import Navbar from '@/components/Navbar';
import ScrollProgress from '@/components/ScrollProgress';
import Hero from '@/components/Hero';
import Teardown from '@/components/Teardown';
import Features from '@/components/Features';
import CameraSection from '@/components/CameraSection';
import GalaxyAI from '@/components/GalaxyAI';
import Specs from '@/components/Specs';

export default function Home() {
  return (
    <>
      <Loader />
      <Navbar />
      <ScrollProgress />

      {/* Animasyon konteyneri: sadece 4 ekran, başka hiçbir şey eklenmemeli */}
      <main id="main-scroll-container" className="relative w-full h-auto bg-[#030303]">
        {/* 3D Canvas Sabit Katman */}
        <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
          <Scene />
        </div>

        {/* 4 Aşamalı HTML Scroll Bölümleri */}
        <div className="relative z-10 w-full flex flex-col pointer-events-auto">
          <Hero />
          <Teardown />
          <Features />
          <CameraSection />
        </div>
      </main>

      {/* Animasyon bittikten sonra gelen bölümler (opak zeminle canvas'ı örter) */}
      <GalaxyAI />
      <Specs />
    </>
  );
}