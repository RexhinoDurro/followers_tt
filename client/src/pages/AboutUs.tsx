
const AboutUs = () => {
  const stats = [
    { number: "500K+", label: "Active Users", icon: "👥" },
    { number: "50M+", label: "Posts Managed", icon: "📱" },
    { number: "150+", label: "Countries", icon: "🌍" },
    { number: "99.9%", label: "Uptime", icon: "⚡" }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "👩‍💼",
      bio: "Former Head of Social at Meta with 10+ years in digital marketing. Passionate about democratizing social media success.",
      linkedin: "#"
    },
    {
      name: "Marcus Chen",
      role: "CTO & Co-Founder",
      image: "👨‍💻",
      bio: "Ex-Google engineer specializing in AI and automation. Built scalable systems used by millions worldwide.",
      linkedin: "#"
    },
    {
      name: "Elena Rodriguez",
      role: "Head of Product",
      image: "👩‍🎨",
      bio: "Former product lead at Twitter with expertise in user experience and social media analytics.",
      linkedin: "#"
    },
    {
      name: "David Park",
      role: "VP of Engineering",
      image: "👨‍🔬",
      bio: "10+ years building robust platforms. Previously at Netflix, focused on scaling creator tools.",
      linkedin: "#"
    }
  ];

  const values = [
    {
      title: "Innovation First",
      description: "We constantly push boundaries to deliver cutting-edge social media management tools.",
      icon: "🚀"
    },
    {
      title: "User-Centric",
      description: "Every decision we make is driven by our users' needs and feedback.",
      icon: "❤️"
    },
    {
      title: "Transparency",
      description: "We believe in honest communication and clear pricing with no hidden fees.",
      icon: "🔍"
    },
    {
      title: "Reliability",
      description: "Your content is precious. We ensure 99.9% uptime and enterprise-grade security.",
      icon: "🛡️"
    }
  ];

  const milestones = [
    {
      year: "2019",
      title: "The Beginning",
      description: "Founded by two passionate creators who struggled with managing multiple social accounts.",
      icon: "🌱"
    },
    {
      year: "2020",
      title: "First 10K Users",
      description: "Reached our first major milestone during the creator economy boom.",
      icon: "🎯"
    },
    {
      year: "2021",
      title: "Series A Funding",
      description: "Raised $15M to expand our team and develop AI-powered features.",
      icon: "💰"
    },
    {
      year: "2022",
      title: "Global Expansion",
      description: "Launched in 50+ countries with multi-language support.",
      icon: "🌍"
    },
    {
      year: "2023",
      title: "AI Integration",
      description: "Introduced advanced AI analytics and content optimization tools.",
      icon: "🤖"
    },
    {
      year: "2024",
      title: "Industry Leader",
      description: "Became the #1 choice for creators and businesses worldwide.",
      icon: "👑"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
            About Us
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light">
            We're on a mission to empower creators and businesses to build authentic, engaging social media presences that drive real results.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Social media has transformed how we connect, share, and build communities. Yet for many creators and businesses, managing multiple platforms feels overwhelming and time-consuming.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                We founded this platform because we believe everyone deserves access to professional-grade social media management tools, regardless of their size or budget.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Today, we're proud to serve hundreds of thousands of creators, small businesses, and enterprises worldwide, helping them save time, increase engagement, and grow their audiences authentically.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-12 text-white shadow-2xl transform rotate-3">
                <div className="transform -rotate-3">
                  <h3 className="text-2xl font-bold mb-4">🎯 Our Vision</h3>
                  <p className="text-lg opacity-90">
                    "To democratize social media success by making professional management tools accessible to everyone, from individual creators to global brands."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">Our Journey</h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-600 hidden lg:block"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative lg:ml-20">
                  {/* Timeline Dot */}
                  <div className="absolute -left-24 top-6 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hidden lg:block"></div>
                  
                  <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-6">
                      <div className="text-4xl">{milestone.icon}</div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">{milestone.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">Meet Our Leadership</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Our team combines decades of experience from top tech companies with a passion for empowering creators and businesses.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-6xl mb-6 text-center">{member.image}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{member.name}</h3>
                <div className="text-blue-600 font-semibold mb-4 text-center">{member.role}</div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{member.bio}</p>
                <div className="text-center">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Connect on LinkedIn →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Join Our Community?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Be part of the next chapter in our story. Join hundreds of thousands of creators and businesses who trust us with their social media success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg">
              Start Your Free Trial
            </button>
            <button className="border-2 border-white text-white font-semibold py-4 px-8 rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200">
              Contact Our Team
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-6 opacity-80">
            Questions? Email us at hello@yourplatform.com
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;