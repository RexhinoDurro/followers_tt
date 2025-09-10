// pages/Contact.tsx - Fully Responsive Contact Page
import React, { useState } from 'react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const contactMethods = [
    {
      title: "General Support",
      description: "Get help with your account, billing, or technical issues",
      email: "support@yourplatform.com",
      responseTime: "Within 24 hours",
      icon: "🎧",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Sales Inquiries",
      description: "Discuss pricing, enterprise solutions, or custom plans",
      email: "sales@yourplatform.com",
      responseTime: "Within 4 hours",
      icon: "💼",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Partnership",
      description: "Explore integration opportunities or business partnerships",
      email: "partners@yourplatform.com",
      responseTime: "Within 48 hours",
      icon: "🤝",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Media & Press",
      description: "Press inquiries, media kits, and interview requests",
      email: "press@yourplatform.com",
      responseTime: "Within 24 hours",
      icon: "📰",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const offices = [
    {
      city: "San Francisco",
      address: "123 Tech Street, Suite 400",
      zipcode: "San Francisco, CA 94105",
      phone: "+1 (555) 123-4567",
      flag: "🇺🇸"
    },
    {
      city: "London",
      address: "45 Innovation Lane",
      zipcode: "London, EC1A 1BB, UK",
      phone: "+44 20 7123 4567",
      flag: "🇬🇧"
    },
    {
      city: "Singapore",
      address: "88 Marina Bay Street",
      zipcode: "Singapore 018981",
      phone: "+65 6123 4567",
      flag: "🇸🇬"
    }
  ];

  const faqs = [
    {
      question: "How quickly do you respond to support requests?",
      answer: "We aim to respond to all support requests within 24 hours during business days. Premium users receive priority support with responses within 4 hours."
    },
    {
      question: "Do you offer phone support?",
      answer: "Yes! Phone support is available for Enterprise customers. Please contact your account manager or email sales@yourplatform.com to set up a call."
    },
    {
      question: "Can I schedule a demo?",
      answer: "Absolutely! We offer personalized demos for businesses and teams. Use our contact form or email sales@yourplatform.com to schedule your demo."
    },
    {
      question: "How do I report a bug or technical issue?",
      answer: "Please use our contact form with 'Technical Support' selected, or email support@yourplatform.com with detailed information about the issue."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 sm:mb-6">
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light px-2">
            We're here to help! Get in touch with our team for support, sales inquiries, partnerships, or just to say hello.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-12">Get In Touch</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${method.color} rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4`}>
                  {method.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">{method.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{method.description}</p>
                <div className="space-y-1 sm:space-y-2">
                  <a href={`mailto:${method.email}`} className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm block break-all">
                    {method.email}
                  </a>
                  <div className="text-green-600 text-xs font-medium">
                    ⚡ {method.responseTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Send Us a Message</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">Fill out the form below and we'll get back to you as soon as possible.</p>
            
            {isSubmitted && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-700">
                  <span className="mr-2">✅</span>
                  <span className="font-medium text-xs sm:text-sm">Message sent successfully! We'll respond within 24 hours.</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Inquiry Type</label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  >
                    <option value="general">General Support</option>
                    <option value="sales">Sales Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="press">Media & Press</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="Brief subject of your message"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
                  placeholder="Please provide details about your inquiry..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6 sm:space-y-8">
            {/* Office Locations */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Our Offices</h3>
              <div className="space-y-4 sm:space-y-6">
                {offices.map((office, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-b-0 pb-3 sm:pb-4 last:pb-0">
                    <div className="flex items-center mb-1 sm:mb-2">
                      <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{office.flag}</span>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800">{office.city}</h4>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm mb-1">{office.address}</p>
                    <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">{office.zipcode}</p>
                    <p className="text-blue-600 font-medium text-xs sm:text-sm">{office.phone}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Times */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Quick Response Guarantee</h3>
              <div className="space-y-2 sm:space-y-4">
                <div className="flex items-center text-sm sm:text-base">
                  <span className="mr-2 sm:mr-3">⚡</span>
                  <span>Sales inquiries: 4 hours</span>
                </div>
                <div className="flex items-center text-sm sm:text-base">
                  <span className="mr-2 sm:mr-3">🎧</span>
                  <span>Support requests: 24 hours</span>
                </div>
                <div className="flex items-center text-sm sm:text-base">
                  <span className="mr-2 sm:mr-3">🚨</span>
                  <span>Critical issues: 2 hours</span>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-3 sm:mb-4">🚨 Emergency Support</h3>
              <p className="text-red-700 mb-3 sm:mb-4 text-sm sm:text-base">For critical issues affecting your business operations:</p>
              <div className="space-y-1 sm:space-y-2">
                <p className="text-red-800 font-semibold text-sm sm:text-base">Emergency Hotline:</p>
                <p className="text-red-700 text-sm sm:text-base">+1 (555) 911-HELP</p>
                <p className="text-red-600 text-xs sm:text-sm">Available 24/7 for Enterprise customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4 sm:space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alternative Contact Methods */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-12">Other Ways to Connect</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl">💬</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">Chat with our support team in real-time</p>
              <button className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
                Start Chat
              </button>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl">📱</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">Social Media</h3>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">Follow us for updates and quick support</p>
              <div className="flex justify-center space-x-3 sm:space-x-4">
                <button className="text-blue-600 hover:text-blue-800 text-sm sm:text-base">Twitter</button>
                <button className="text-blue-600 hover:text-blue-800 text-sm sm:text-base">LinkedIn</button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl">📚</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">Help Center</h3>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">Browse our knowledge base and tutorials</p>
              <button className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base">
                Visit Help Center
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;