'use client';
import React from 'react';
import Header from './homepage/Header';
import Hero from './homepage/Hero';
import Features from './homepage/Features';
import CTA from './homepage/CTA';
import Footer from './homepage/Footer';



export default function App() {
  return (
    <div className="bg-white text-gray-800 font-sans antialiased">
      <Header />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
