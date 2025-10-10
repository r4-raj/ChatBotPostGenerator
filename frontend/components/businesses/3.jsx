// DefineBrandForm.jsx
"use client";
import React, { useState, useRef, useEffect } from 'react';
// To use icons as seen in the images, install heroicons: npm install @heroicons/react
import { ArrowUpTrayIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const DefineBrandForm = () => {
  // progress steps configuration (this page = step 3)
  const steps = ['Name & Website','Basic Info','Branding','Audience','Schedule'];
  const currentStep = 3;
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  // --- 1. STATE MANAGEMENT for form inputs ---
  const [logo, setLogo] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#EF4444');
  const [brandTone, setBrandTone] = useState('Professional & Formal');

  // --- 2. HANDLE SUBMIT FUNCTION ---
  const handleSubmit = (e) => {
    e.preventDefault();
    // Save step 3 data to localStorage with backend field names
    const reader = logo
      ? new Promise((resolve) => {
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result);
          fr.readAsDataURL(logo);
        })
      : Promise.resolve(null);
    reader.then((logoDataUrl) => {
      const brandData = {
        // logo: logoDataUrl, // If you want to store logo, add backend support for it
        primaryBrandColor: primaryColor,
        secondaryBrandColor: secondaryColor,
        brandTone,
      };
      localStorage.setItem('onboardingStep3', JSON.stringify(brandData));
      // Navigate to the next step
      window.location.href = '/businesses/create/4';
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen">
     

      <main className="py-12">
        <div className="max-w-3xl mx-auto px-6">

          {/* Progress steps */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="w-full">
              <div className="flex items-center justify-between select-none">
                {steps.map((label, idx) => (
                  <div key={label} className="flex flex-col items-center w-1/5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${idx < currentStep ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative mt-4 h-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-1 rounded bg-slate-200" />
                </div>
                <div className="absolute left-0 top-0 h-1 rounded bg-blue-600" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                {steps.map((label) => (
                  <div key={label} className="w-1/5 text-center">{label}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="mx-auto w-full max-w-lg bg-white rounded-2xl shadow-lg border border-slate-100">
            <div className="p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Define your brand</h1>
                <p className="text-sm text-slate-500 mt-2">Upload your logo and fine-tune your brand colors</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Upload box */}
                  <div>
                    {/* <label className="block text-sm font-medium text-slate-600 mb-2">Business Logo</label> */}
                    <div className="rounded-lg border-2 border-dashed border-slate-200 p-6">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-48 h-28 rounded-md border border-slate-100 bg-slate-50 flex items-center justify-center mx-auto mb-3">
                            <ArrowUpTrayIcon className="h-8 w-8 text-slate-400" />
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            <label htmlFor="file-upload" className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm font-medium text-blue-600 hover:bg-slate-50 cursor-pointer">
                              Choose file
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" aria-label="Business Logo" onChange={e => setLogo(e.target.files[0])} />
                            </label>
                            <div className="text-sm text-slate-500">or drag and drop</div>
                          </div>
                          <p className="text-xs text-slate-400 mt-2">PNG, JPG, SVG up to 10MB</p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Upload your business logo (PNG, JPG, or SVG recommended)</p>
                  </div>

                  {/* Color inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="primary-color" className="block text-sm font-medium text-slate-600 mb-2">Primary Brand Color</label>
                        <div>
                          <input type="text" name="primary-color" id="primary-color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        </div>
                      <p className="mt-2 text-xs text-slate-500">Your main brand color (will be used in posts and templates)</p>
                    </div>

                    <div>
                      <label htmlFor="secondary-color" className="block text-sm font-medium text-slate-600 mb-2">Secondary Color</label>
                      <div>
                        <input type="text" name="secondary-color" id="secondary-color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Secondary accent color for variety in designs</p>
                    </div>
                  </div>

                  {/* Custom Select (scrolls when many items) */}
                  <div>
                    <label htmlFor="brand-tone" className="block text-sm font-medium text-slate-600 mb-2">Brand Tone & Voice*</label>
                    {/* We'll implement a small custom dropdown to allow styling + scroll */}
                    <BrandToneDropdown value={brandTone} onValueChange={setBrandTone} />
                    <p className="mt-2 text-xs text-slate-500">The overall tone and voice for your content</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button type="button" className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50">
                    <ChevronLeftIcon className="h-4 w-4 text-slate-400" />
                    Back
                  </button>
                  <button type="submit" className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700">
                    Continue
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DefineBrandForm;

// Small custom dropdown component placed in the same file for convenience
function BrandToneDropdown({ value, onValueChange }) {
  const options = [
    'Professional & Formal',
    'Casual & Friendly',
    'Witty & Humorous',
    'Inspirational & Uplifting',
    'Educational & Informative',
    'Playful & Energetic',
    'Warm & Empathetic',  
    'Bold & Confident',
    'Minimal & Quiet',
    'Luxurious & Elegant',
  ];

  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(options.indexOf(value) || 0);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!btnRef.current) return;
      if (btnRef.current.contains(e.target)) return;
      if (panelRef.current && panelRef.current.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (open && panelRef.current) {
      const node = panelRef.current.children[highlighted];
      if (node) node.scrollIntoView({ block: 'nearest' });
    }
  }, [highlighted, open]);

  useEffect(() => {
    // Keep highlighted in sync with value
    const idx = options.indexOf(value);
    if (idx !== -1) setHighlighted(idx);
  }, [value]);

  function toggle() {
    setOpen((v) => !v);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlighted((h) => Math.min(h + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onValueChange(options[highlighted]);
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="relative"> 
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className="w-full text-left rounded-md border border-slate-200 px-3 py-2 pr-10 bg-white flex items-center justify-between text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
      >
        <span className="truncate">{value}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          ref={panelRef}
          tabIndex={-1}
          className="absolute z-40 mt-2 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-52 overflow-auto focus:outline-none"
          onKeyDown={onKeyDown}
        >
          {options.map((opt, i) => (
            <li
              key={opt}
              role="option"
              aria-selected={value === opt}
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => { onValueChange(opt); setOpen(false); }}
              className={`px-3 py-2 text-sm cursor-pointer ${highlighted === i ? 'bg-indigo-50 text-slate-900' : 'text-slate-700'} ${value === opt ? 'font-semibold' : ''}`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}