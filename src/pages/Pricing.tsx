import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, X, Sparkles, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import tullyLogo from "@/assets/tully-logo.png";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      monthlyPrice: 29,
      annualPrice: 23,
      users: "Up to 25",
      popular: false,
      features: {
        skillPaths: "Basic (5 paths)",
        analytics: "Core",
        integrations: false,
        support: "Email",
      },
    },
    {
      name: "Growth",
      monthlyPrice: 79,
      annualPrice: 63,
      users: "26-100",
      popular: true,
      features: {
        skillPaths: "Custom paths",
        analytics: "Retention reports",
        integrations: "Gusto/Slack",
        support: "Priority chat",
      },
    },
    {
      name: "Pro",
      monthlyPrice: 149,
      annualPrice: 119,
      users: "101-250",
      popular: false,
      features: {
        skillPaths: "Advanced + gamification",
        analytics: "Manager dashboards",
        integrations: "Full API",
        support: "Dedicated onboarding",
      },
    },
  ];

  const faqs = [
    {
      question: "How is billing calculated?",
      answer: "Billing is calculated per active hourly user per month. You only pay for employees who actively use the platform during that billing cycle.",
    },
    {
      question: "What's the ROI?",
      answer: "On average, our customers see a 20% drop in turnover, which saves approximately $500 per employee per year in reduced hiring and training costs.",
    },
    {
      question: "Can I pause seasonally?",
      answer: "Yes! We offer flexible billing that allows you to pause your subscription during slow seasons and resume when you need it.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={tullyLogo} alt="Tully" className="w-10 h-10 object-contain" />
            <span className="font-semibold text-gray-900 font-serif text-lg">Tully</span>
          </Link>
          <Button variant="outline" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 via-teal-700 to-blue-800 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6 font-serif leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Upskill Hourly Teams for Promotions – Cut Turnover 20%
          </motion.h1>
          <motion.p 
            className="text-xl text-teal-100 font-serif"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Affordable AI coaching from frontline to manager. ROI in weeks, not months.
          </motion.p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-teal-600"
            />
            <span className={`font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>
              Annual <span className="text-teal-600 text-sm font-semibold">(Save 20%)</span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative rounded-2xl border-2 p-8 ${
                  plan.popular 
                    ? 'border-teal-500 bg-teal-50/50 shadow-xl scale-105' 
                    : 'border-gray-200 bg-white'
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900 font-serif mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-gray-500">/user/mo</span>
                  {isAnnual && (
                    <p className="text-sm text-gray-400 line-through">
                      ${plan.monthlyPrice}/user/mo monthly
                    </p>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
                  <span className="font-semibold">Team Size:</span> {plan.users}
                </p>

                <ul className="space-y-4 mb-8">
                  <FeatureRow label="Core Skill Paths" value={plan.features.skillPaths} />
                  <FeatureRow label="Analytics" value={plan.features.analytics} />
                  <FeatureRow label="Integrations" value={plan.features.integrations} />
                  <FeatureRow label="Support" value={plan.features.support} />
                  <FeatureRow label="Trial" value="14 days free" />
                </ul>

                <Button 
                  className={`w-full h-12 text-base font-semibold ${
                    plan.popular 
                      ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  Start 14-day Free Trial
                </Button>
                <p className="text-xs text-gray-400 text-center mt-3">No credit card required</p>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-gray-500 mt-10 font-serif">
            Cancel anytime. Custom pricing for 250+ staff.{" "}
            <button className="text-teal-600 hover:underline inline-flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> Chat now
            </button>
          </p>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 font-serif mb-12">
            Compare All Features
          </h2>
          
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Starter</th>
                    <th className="text-center py-4 px-4 font-semibold text-teal-600">Growth</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow 
                    feature="Team Size" 
                    starter="Up to 25" 
                    growth="26-100" 
                    pro="101-250" 
                  />
                  <ComparisonRow 
                    feature="Core Skill Paths" 
                    starter="Basic (5 paths)" 
                    growth="Custom paths" 
                    pro="Advanced + gamification" 
                  />
                  <ComparisonRow 
                    feature="Analytics" 
                    starter="Core" 
                    growth="Retention reports" 
                    pro="Manager dashboards" 
                  />
                  <ComparisonRow 
                    feature="Integrations" 
                    starter={false} 
                    growth="Gusto/Slack" 
                    pro="Full API" 
                  />
                  <ComparisonRow 
                    feature="Support" 
                    starter="Email" 
                    growth="Priority chat" 
                    pro="Dedicated onboarding" 
                  />
                  <ComparisonRow 
                    feature="Free Trial" 
                    starter="14 days" 
                    growth="14 days" 
                    pro="14 days" 
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 font-serif mb-12">
            Frequently Asked Questions
          </h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="bg-white border border-gray-200 rounded-xl px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-gradient-to-br from-teal-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-serif mb-12">
            Trusted by Growing Businesses
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <p className="text-xl font-serif italic mb-4">
                "Saved $15K in hiring costs"
              </p>
              <p className="text-teal-200 font-semibold">— Retail Chain Owner</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <p className="text-xl font-serif italic mb-4">
                "Our turnover dropped 25% in 3 months"
              </p>
              <p className="text-teal-200 font-semibold">— Restaurant Group Manager</p>
            </div>
          </div>

          {/* Logo placeholders */}
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="w-24 h-8 bg-white/20 rounded"></div>
            <div className="w-28 h-8 bg-white/20 rounded"></div>
            <div className="w-20 h-8 bg-white/20 rounded"></div>
            <div className="w-24 h-8 bg-white/20 rounded"></div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-6 bg-gray-900 text-white text-center">
        <p className="text-gray-400 mb-4">Ready to reduce turnover and grow your team?</p>
        <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white h-14 px-8 text-lg">
          Start Your Free Trial Today
        </Button>
      </section>
    </div>
  );
}

function FeatureRow({ label, value }: { label: string; value: string | boolean }) {
  return (
    <li className="flex items-start gap-3">
      {value ? (
        <Check className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
      ) : (
        <X className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
      )}
      <div>
        <span className="text-sm text-gray-500">{label}</span>
        {typeof value === 'string' && (
          <p className="text-sm font-medium text-gray-900">{value}</p>
        )}
      </div>
    </li>
  );
}

function ComparisonRow({ 
  feature, 
  starter, 
  growth, 
  pro 
}: { 
  feature: string; 
  starter: string | boolean; 
  growth: string | boolean; 
  pro: string | boolean; 
}) {
  const renderCell = (value: string | boolean) => {
    if (value === false) return <X className="w-5 h-5 text-gray-300 mx-auto" />;
    if (value === true) return <Check className="w-5 h-5 text-teal-600 mx-auto" />;
    return <span className="text-sm text-gray-700">{value}</span>;
  };

  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-4 px-6 text-sm font-medium text-gray-900">{feature}</td>
      <td className="py-4 px-4 text-center">{renderCell(starter)}</td>
      <td className="py-4 px-4 text-center bg-teal-50/50">{renderCell(growth)}</td>
      <td className="py-4 px-4 text-center">{renderCell(pro)}</td>
    </tr>
  );
}