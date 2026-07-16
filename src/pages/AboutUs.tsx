import React from 'react';
import { Sparkles, ShieldCheck, RefreshCw, Compass, Heart, Ruler, CheckCircle2 } from 'lucide-react';

export const AboutUs: React.FC = () => {
  const processSteps = [
    {
      title: "Handpicked Curation",
      desc: "Our sourcing crew sifts through containers of curated exports to pick only shoes with strong sole structures, original materials, and beautiful classic colorways.",
      icon: <Compass className="w-6 h-6 text-brand-orange" />
    },
    {
      title: "Manually Scrubbed & Steam Disinfected",
      desc: "Every sneaker goes through a rigorous detailing bath using organic cleaners, steam heated to 130°C to destroy all bacteria, and treated with deep UV-C lamps.",
      icon: <RefreshCw className="w-6 h-6 text-brand-orange" />
    },
    {
      title: "Polished & Restored",
      desc: "We reshape creased leather, repaint fading midsoles, brush suede back to pristine texture, and equip shoes with brand new sanitizing athletic insoles.",
      icon: <Sparkles className="w-6 h-6 text-brand-orange" />
    },
    {
      title: "Drop & Deliver",
      desc: "Once a shoe is Thrifted Kicks Certified, we list it. We shoot multiple high-resolution photos so you know exactly what you are purchasing.",
      icon: <ShieldCheck className="w-6 h-6 text-brand-orange" />
    }
  ];

  const sizeChart = [
    { usMen: "7", usWomen: "8.5", uk: "6", eu: "40", cm: "25.0" },
    { usMen: "7.5", usWomen: "9", uk: "6.5", eu: "40.5", cm: "25.5" },
    { usMen: "8", usWomen: "9.5", uk: "7", eu: "41", cm: "26.0" },
    { usMen: "8.5", usWomen: "10", uk: "7.5", eu: "42", cm: "26.5" },
    { usMen: "9", usWomen: "10.5", uk: "8", eu: "42.5", cm: "27.0" },
    { usMen: "9.5", usWomen: "11", uk: "8.5", eu: "43", cm: "27.5" },
    { usMen: "10", usWomen: "11.5", uk: "9", eu: "44", cm: "28.0" },
    { usMen: "10.5", usWomen: "12", uk: "9.5", eu: "44.5", cm: "28.5" },
    { usMen: "11", usWomen: "12.5", uk: "10", eu: "45", cm: "29.0" },
    { usMen: "12", usWomen: "13.5", uk: "11", eu: "46", cm: "30.0" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24 text-gray-900">
      {/* Brand Story Header */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#ea580c]/10 text-brand-orange border border-[#ea580c]/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            Our Purpose
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl text-gray-900 tracking-tight leading-none uppercase">
            RE-IMAGINING <br />
            <span className="text-brand-orange">SECOND-HAND</span> <br />
            FOOTWEAR.
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Founded by a collective of shoe collectors and eco-advocates, Thrifted Kicks was created to break the high-retail sneaker cycle. We believe second-hand (landa) shopping should feel as premium, authentic, and satisfying as walking into a first-tier boutique.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            By sourcing only authenticated, structurally perfect shoes, and deploying advanced sanitization technology, we prove that saving money and preserving the environment never requires compromising on premium style.
          </p>
        </div>

        <div className="relative flex justify-center">
          <div className="w-full max-w-md aspect-square bg-gray-50 border border-gray-200 rounded-3xl p-6 overflow-hidden flex items-center justify-center shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600"
              alt="Premium sneakers display"
              className="w-full h-full object-cover rounded-2xl transform rotate-[2deg] hover:rotate-0 transition-transform duration-500 shadow-md"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Curation Cleaning Process */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-gray-900">
            The Thrifted Kicks Standard
          </h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Each pair of shoes undergoes our complete detailing cycle before drop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {processSteps.map((step, idx) => (
            <div key={idx} className="bg-white border border-gray-200 p-6 rounded-2xl space-y-4 hover:shadow-md transition-all">
              <div className="bg-brand-orange/5 p-3 rounded-xl w-12 h-12 flex items-center justify-center border border-brand-orange/10">
                {step.icon}
              </div>
              <h3 className="font-display font-bold text-base text-gray-900">{step.title}</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sizing Guide */}
      <section id="sizing" className="bg-gray-50 border border-gray-200/60 rounded-3xl p-8 md:p-12 text-left space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
          <div className="space-y-1">
            <span className="flex items-center gap-1 text-brand-orange text-xs font-mono uppercase tracking-wider font-semibold">
              <Ruler className="w-4.5 h-4.5" /> Sizing Reference
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase text-gray-900">
              International Shoe Sizing Guide
            </h2>
          </div>
          <p className="text-gray-500 text-xs max-w-sm">
            Since thrift shoes are limited drops in unique sizes, please verify your size before purchasing. Lengths are specified in centimeters (CM).
          </p>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left border-collapse text-sm text-gray-600 font-sans">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-mono uppercase text-gray-400 tracking-wider">
                <th className="py-4 px-6">US Men's</th>
                <th className="py-4 px-6">US Women's</th>
                <th className="py-4 px-6">UK Size</th>
                <th className="py-4 px-6">EU Size</th>
                <th className="py-4 px-6">Length (CM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sizeChart.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-gray-900">{row.usMen}</td>
                  <td className="py-3.5 px-6">{row.usWomen}</td>
                  <td className="py-3.5 px-6">{row.uk}</td>
                  <td className="py-3.5 px-6 text-brand-orange font-bold font-mono">{row.eu}</td>
                  <td className="py-3.5 px-6 font-mono text-xs text-gray-400">{row.cm} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white border border-brand-orange/15 rounded text-xs sm:text-sm shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-brand-orange shrink-0" />
          <p className="text-gray-600 leading-relaxed">
            <span className="font-bold text-gray-900">Pro Tip:</span> Most sneakers fit true-to-size. However, vintage designs of Nike or Jordan are slightly narrower. If you have wider feet, we suggest choosing a half-size larger than your standard measurement.
          </p>
        </div>
      </section>
    </div>
  );
};
