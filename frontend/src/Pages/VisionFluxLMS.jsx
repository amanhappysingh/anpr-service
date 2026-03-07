import React, { useState } from "react";
import { Menu, BookOpen, Users, MessageSquare, BarChart, Settings, Check, Zap, Shield, Database, Cpu, Globe } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const sampleStats = [
  { name: "Week 1", active: 40 },
  { name: "Week 2", active: 55 },
  { name: "Week 3", active: 72 },
  { name: "Week 4", active: 65 },
  { name: "Week 5", active: 80 },
];

const courses = [
  { id: 1, title: "Intro to Computer Vision", instructor: "Dr. Priya Rao", progress: 72 },
  { id: 2, title: "Deep Learning for Images", instructor: "Aman Singh", progress: 38 },
  { id: 3, title: "Ethics in AI", instructor: "Rina Patel", progress: 92 },
];

const products = [
  {
    icon: <BookOpen size={24} />,
    title: "Course Studio",
    desc: "Powerful authoring tools with WYSIWYG editor, Markdown support, and version control. Import existing content or start fresh.",
    features: ["Rich text editing", "Markdown support", "Media embedding", "Version history"]
  },
  {
    icon: <Database size={24} />,
    title: "Dataset Manager",
    desc: "Store, version, and share datasets directly within your courses. Support for images, videos, CSVs, and custom formats.",
    features: ["Version control", "Access permissions", "Format validation", "Quick previews"]
  },
  {
    icon: <Cpu size={24} />,
    title: "GPU Lab Runtime",
    desc: "Cloud-based Jupyter environments with GPU acceleration. Pre-configured with PyTorch, TensorFlow, and popular CV libraries.",
    features: ["GPU acceleration", "Pre-installed libraries", "Auto-save notebooks", "Resource monitoring"]
  },
  {
    icon: <Users size={24} />,
    title: "Cohort Management",
    desc: "Organize students into cohorts, manage enrollments, track progress, and communicate efficiently with built-in messaging.",
    features: ["Batch enrollment", "Role-based access", "Progress tracking", "Group messaging"]
  },
  {
    icon: <BarChart size={24} />,
    title: "Analytics Dashboard",
    desc: "Real-time insights into student engagement, assignment completion, and learning outcomes with exportable reports.",
    features: ["Engagement metrics", "Custom reports", "Export data", "Predictive insights"]
  },
  {
    icon: <Shield size={24} />,
    title: "Enterprise Security",
    desc: "SSO integration, role-based permissions, audit logs, and compliance with SOC 2, GDPR, and FERPA standards.",
    features: ["SSO support", "Audit logs", "GDPR compliant", "Data encryption"]
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    period: "per instructor/month",
    desc: "Perfect for individual instructors and small courses",
    features: [
      "Up to 50 students",
      "3 courses",
      "10GB dataset storage",
      "Basic analytics",
      "Email support",
      "Community access"
    ],
    cta: "Start free trial",
    popular: false
  },
  {
    name: "Professional",
    price: "$99",
    period: "per instructor/month",
    desc: "For growing teams and departments",
    features: [
      "Up to 300 students",
      "Unlimited courses",
      "100GB dataset storage",
      "Advanced analytics",
      "Priority support",
      "GPU lab access (20hrs/mo)",
      "Custom branding",
      "SSO integration"
    ],
    cta: "Start free trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact sales",
    desc: "For universities and large organizations",
    features: [
      "Unlimited students",
      "Unlimited courses",
      "Unlimited storage",
      "White-label solution",
      "Dedicated support",
      "GPU lab access (unlimited)",
      "Custom integrations",
      "SLA guarantee",
      "Training & onboarding"
    ],
    cta: "Contact sales",
    popular: false
  }
];

function IconCard({ icon, title, desc }) {
  return (
    <div className="bg-white/60 backdrop-blur rounded-2xl p-5 shadow-sm border border-white/10">
      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">{icon}</div>
      <h4 className="mt-4 font-semibold">{title}</h4>
      <p className="mt-2 text-sm text-slate-400">{desc}</p>
    </div>
  );
}

function ProductCard({ icon, title, desc, features }) {
  return (
    <div className="bg-white/3 rounded-2xl p-6 hover:bg-white/5 transition-all">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 flex items-center justify-center text-indigo-400">
        {icon}
      </div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-slate-300">{desc}</p>
      <ul className="mt-4 space-y-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
            <Check size={16} className="text-indigo-400" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PricingCard({ plan }) {
  return (
    <div className={`bg-white/3 rounded-2xl p-8 ${plan.popular ? 'ring-2 ring-indigo-500 relative' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-black text-sm font-semibold rounded-full">
          Most Popular
        </div>
      )}
      <div>
        <h3 className="text-2xl font-bold">{plan.name}</h3>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold">{plan.price}</span>
          <span className="text-slate-400">{plan.period}</span>
        </div>
        <p className="mt-3 text-sm text-slate-300">{plan.desc}</p>
      </div>
      
      <ul className="mt-8 space-y-3">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check size={20} className="text-indigo-400 flex-shrink-0 mt-0.5" />
            <span className="text-slate-300">{f}</span>
          </li>
        ))}
      </ul>
      
      <button className={`mt-8 w-full py-3 rounded-lg font-semibold ${
        plan.popular 
          ? 'bg-indigo-600 text-black hover:bg-indigo-500' 
          : 'bg-white/5 hover:bg-white/10'
      } transition-colors`}>
        {plan.cta}
      </button>
    </div>
  );
}

function HomePage({ setPage }) {
  return (
    <>
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-12 gap-8 items-center py-12">
        <div className="col-span-7">
          <h2 className="text-4xl font-extrabold leading-tight">Build, teach, and scale AI courses with VisionFlux LMS</h2>
          <p className="mt-4 text-slate-300 text-lg">A Canvas-inspired learning platform tuned for AI teams: assignments with dataset support, GPU-backed lab integrations, collaborative notebooks, and an instructor-gradebook that just works.</p>
          <div className="mt-6 flex gap-3">
            <button className="px-6 py-3 rounded-lg bg-indigo-600 text-black font-semibold">Create a course</button>
            <button className="px-6 py-3 rounded-lg bg-white/5">See demo</button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <IconCard icon={<BookOpen size={20} />} title="Course Authoring" desc="WYSIWYG + Markdown, dataset attachments" />
            <IconCard icon={<Users size={20} />} title="Cohort Management" desc="Groups, roles, and batch invites" />
            <IconCard icon={<BarChart size={20} />} title="Analytics" desc="Engagement, completion and performance" />
          </div>
        </div>

        <div className="col-span-5">
          <div className="rounded-2xl p-6 bg-gradient-to-br from-white/5 to-white/2 border border-white/5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Instructor Dashboard</h3>
                <p className="text-sm text-slate-400">Overview · Active cohort · Upcoming</p>
              </div>
              <div className="text-sm text-slate-400">Last updated: Nov 2, 2025</div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white/3 p-4 rounded-lg">
                <p className="text-xs text-slate-300">Active students</p>
                <div className="mt-2 text-2xl font-bold">1,284</div>
              </div>
              <div className="bg-white/3 p-4 rounded-lg">
                <p className="text-xs text-slate-300">Avg completion</p>
                <div className="mt-2 text-2xl font-bold">68%</div>
              </div>
            </div>

            <div className="mt-4 h-36">
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={sampleStats}>
                  <XAxis dataKey="name" tick={{ fill: '#cbd5e1' }} />
                  <YAxis tick={{ fill: '#cbd5e1' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="active" stroke="#60a5fa" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <button className="py-2 rounded-lg bg-white/5 text-sm">Manage cohort</button>
              <button className="py-2 rounded-lg bg-white/5 text-sm">Gradebook</button>
              <button className="py-2 rounded-lg bg-indigo-600 text-black text-sm">Open course</button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES + COURSE LIST */}
      <main className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-12 gap-8">
          {/* SIDEBAR */}
          <aside className="col-span-3 hidden md:block sticky top-24">
            <div className="bg-white/3 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-white/5 flex items-center justify-center">P</div>
                <div>
                  <div className="font-semibold">Priya Rao</div>
                  <div className="text-xs text-slate-400">Instructor</div>
                </div>
              </div>

              <nav className="mt-6 grid gap-3">
                <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"><Menu size={18} /> Overview</a>
                <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"><BookOpen size={18} /> Courses</a>
                <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"><Users size={18} /> Cohorts</a>
                <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"><MessageSquare size={18} /> Messages</a>
                <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"><Settings size={18} /> Settings</a>
              </nav>
            </div>
          </aside>

          {/* CONTENT */}
          <section className="col-span-12 md:col-span-9">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Your Courses</h3>
              <div className="text-sm text-slate-400">3 courses</div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <div key={c.id} className="bg-white/3 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{c.title}</h4>
                      <div className="text-xs text-slate-400">{c.instructor}</div>
                    </div>
                    <div className="text-xs text-slate-300">{c.progress}%</div>
                  </div>

                  <div className="mt-3 h-2 bg-white/6 rounded-full overflow-hidden">
                    <div style={{ width: `${c.progress}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 py-2 rounded-lg bg-white/5">Open</button>
                    <button className="py-2 px-3 rounded-lg bg-white/5">Share</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick assignment card */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/3 rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">New assignment: Image Classification Lab</h4>
                    <p className="text-sm text-slate-400 mt-2">Deadline: Nov 14, 2025 · 11:59 PM</p>
                    <p className="text-sm text-slate-300 mt-3">Attach datasets, create rubric, and enable GPU-run notebooks for graded labs.</p>
                  </div>
                  <div className="text-sm text-slate-300">Draft</div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button className="py-2 px-4 rounded-lg bg-indigo-600 text-black">Edit</button>
                  <button className="py-2 px-4 rounded-lg bg-white/5">Publish</button>
                </div>
              </div>

              <div className="bg-white/3 rounded-2xl p-6">
                <h4 className="font-semibold">Recent messages</h4>
                <ul className="mt-4 space-y-3">
                  <li className="text-sm text-slate-300">Ankit: "I can't access the dataset — permission denied"</li>
                  <li className="text-sm text-slate-300">Sofia: "Will the midterm include notebooks?"</li>
                  <li className="text-sm text-slate-300">Team: "New GPU quota available for cohort B"</li>
                </ul>
                <div className="mt-4">
                  <button className="py-2 px-4 rounded-lg bg-white/5">Open inbox</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function ProductsPage({ setPage }) {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-4xl font-extrabold">Everything you need to teach AI</h2>
        <p className="mt-4 text-lg text-slate-300">
          A complete suite of tools designed specifically for computer vision and machine learning courses. 
          From authoring to grading, we've got you covered.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p, i) => (
          <ProductCard key={i} {...p} />
        ))}
      </div>

      <div className="mt-20 bg-gradient-to-br from-indigo-500/10 to-cyan-400/10 rounded-3xl p-12 text-center border border-indigo-500/20">
        <Zap size={48} className="mx-auto text-indigo-400" />
        <h3 className="mt-6 text-3xl font-bold">Ready to get started?</h3>
        <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
          Join hundreds of instructors already using VisionFlux to deliver world-class AI education.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <button className="px-8 py-3 rounded-lg bg-indigo-600 text-black font-semibold">Start free trial</button>
          <button 
            onClick={() => setPage('pricing')}
            className="px-8 py-3 rounded-lg bg-white/5 font-semibold"
          >
            View pricing
          </button>
        </div>
      </div>
    </main>
  );
}

function PricingPage({ setPage }) {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-4xl font-extrabold">Simple, transparent pricing</h2>
        <p className="mt-4 text-lg text-slate-300">
          Choose the plan that fits your needs. All plans include a 14-day free trial with no credit card required.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingPlans.map((plan, i) => (
          <PricingCard key={i} plan={plan} />
        ))}
      </div>

      <div className="mt-16 bg-white/3 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-center">Frequently asked questions</h3>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold">Can I switch plans later?</h4>
            <p className="mt-2 text-sm text-slate-300">Yes, you can upgrade or downgrade at any time. Changes take effect immediately.</p>
          </div>
          <div>
            <h4 className="font-semibold">What payment methods do you accept?</h4>
            <p className="mt-2 text-sm text-slate-300">We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.</p>
          </div>
          <div>
            <h4 className="font-semibold">Is there a setup fee?</h4>
            <p className="mt-2 text-sm text-slate-300">No setup fees for any plan. Enterprise customers get free onboarding and training.</p>
          </div>
          <div>
            <h4 className="font-semibold">What happens after the trial?</h4>
            <p className="mt-2 text-sm text-slate-300">Your trial converts to the Starter plan unless you choose a different plan or cancel.</p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-slate-300">Have questions about Enterprise plans?</p>
        <button className="mt-4 px-6 py-3 rounded-lg bg-white/5 font-semibold">Contact sales team</button>
      </div>
    </main>
  );
}

export default function VisionFluxLMS() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100 font-sans">
      {/* NAVBAR */}
      <header className="max-w-7xl mx-auto p-6 flex items-center justify-between">
        <div 
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setCurrentPage('home')}
        >
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center font-bold text-black">VF</div>
          <div>
            <h1 className="text-xl font-semibold">VisionFlux</h1>
            <p className="text-xs text-slate-400">Modern LMS for AI-first teams</p>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentPage('products')}
            className={`px-4 py-2 rounded-lg text-sm ${currentPage === 'products' ? 'bg-white/10' : 'bg-white/5'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setCurrentPage('pricing')}
            className={`px-4 py-2 rounded-lg text-sm ${currentPage === 'pricing' ? 'bg-white/10' : 'bg-white/5'}`}
          >
            Pricing
          </button>
          <button className="px-4 py-2 rounded-lg text-sm bg-indigo-600 text-black font-medium">Get Started</button>
        </nav>
      </header>

      {currentPage === 'home' && <HomePage setPage={setCurrentPage} />}
      {currentPage === 'products' && <ProductsPage setPage={setCurrentPage} />}
      {currentPage === 'pricing' && <PricingPage setPage={setCurrentPage} />}

      {/* FOOTER */}
      <footer className="border-t border-white/5 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-semibold">VisionFlux</div>
            <div className="text-sm text-slate-400">© {new Date().getFullYear()} visionflux.ai — Learning, elevated.</div>
          </div>
          <div className="flex gap-4 text-sm text-slate-400">
            <a className="cursor-pointer hover:text-slate-300">Terms</a>
            <a className="cursor-pointer hover:text-slate-300">Privacy</a>
            <a className="cursor-pointer hover:text-slate-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}