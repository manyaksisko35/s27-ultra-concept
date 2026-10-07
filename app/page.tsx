'use client';

import Scene from '@/components/Scene';
import Loader from '@/components/Loader';
import Navbar from '@/components/Navbar';
import ScrollProgress from '@/components/ScrollProgress';
import Hero from '@/components/Hero';
import Teardown from '@/components/Teardown';
import Features from '@/components/Features';
import CameraSection from '@/components/CameraSection';
import SPenSection from '@/components/SPenSection';
import ColorSection from '@/components/ColorSection';
import GalaxyAI from '@/components/GalaxyAI';
import CompareSection from '@/components/CompareSection';
import Specs from '@/components/Specs';

export default function Home() {
  return (
    <>
      <Loader />
      <Navbar />
      <ScrollProgress />

      {/* Animasyon konteyneri: sadece 6 bölüm (Hero, Teardown, Features, Camera, S Pen, Colors), başka hiçbir şey eklenmemeli */}
      <main id="main-scroll-container" className="relative w-full h-auto bg-[#030303]">
        {/* 3D Canvas Sabit Katman */}
        <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
          <Scene />
        </div>

        {/* 6 Aşamalı HTML Scroll Bölümleri */}
        <div className="relative z-10 w-full flex flex-col pointer-events-auto">
          <Hero />
          <Teardown />
          <Features />
          <CameraSection />
          <SPenSection />
          <ColorSection />
        </div>
      </main>

      {/* Animasyon bittikten sonra gelen bölümler (opak zeminle canvas'ı örter) */}
      <GalaxyAI />
      <CompareSection />
      <Specs />
    </>
  );
}