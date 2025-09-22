// import { Link } from "react-router-dom";

// export default function HomePage() {
//   return (
//     <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-purple-700 text-white">
//       {/* Logo / Title */}
//       <h1 className="text-5xl font-extrabold mb-6 tracking-wide drop-shadow-lg">
//         CollabCode
//       </h1>

//       {/* Short Description */}
//       <p className="text-lg md:text-2xl max-w-xl text-center mb-10 opacity-90">
//         Write, run, and share code together in real-time.  
//         A simple and powerful collaborative coding workspace.
//       </p>

//       {/* CTA Buttons */}
//       <div className="flex gap-4">
      
//         <Link
//           to="/login"
//           className="bg-blue-900/50 border border-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-800/60 transition"
//         >
//           Login
//         </Link>
//       </div>

//       {/* Footer */}
//       <footer className="absolute bottom-4 text-sm text-white/70">
//         © {new Date().getFullYear()} CollabCode. All rights reserved.
//       </footer>
//     </div>
//   );
// }



import React from "react";
import { Code, Users, Zap, Shield, MessageCircle, Play, ArrowRight, Github, Star, CheckCircle } from "lucide-react";

const HomePage = () => {
  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Real-time Collaboration",
      description: "Code together with your team in real-time with live cursors and instant synchronization",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Multi-language Support", 
      description: "Support for JavaScript, Python, Java, C++, and more with instant code execution",
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Integrated Chat",
      description: "Communicate seamlessly with built-in project chat and team collaboration tools",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Enterprise-grade security with encrypted connections and private workspaces",
      gradient: "from-red-500 to-rose-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized performance with instant execution and minimal latency for smooth coding",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: "Instant Execution",
      description: "Run your code directly in the browser with immediate results and output",
      gradient: "from-pink-500 to-purple-500"
    }
  ];

  const stats = [
    { number: "100+", label: "Active Developers" },
    { number: "50+", label: "Projects Created" },
    { number: "99.9%", label: "Uptime" },
    { number: "5+", label: "Languages Supported" }
  ];

  const codeExample = `// Real-time collaboration in action
function collaborateWithTeam() {
  const project = createProject("My App");
  const team = inviteMembers(["alice", "bob"]);
  
  team.forEach(member => {
    member.joinProject(project.id);
    member.startCoding();
  });
  
  return "Happy coding together! 🚀";
}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-full px-4 py-2 w-fit">
                  <Star className="w-4 h-4" />
                  Now supporting 5+ programming languages
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Code Together
                  </span>
                  <br />
                  <span className="text-gray-900">Build Amazing</span>
                  <br />
                  <span className="text-gray-900">Things</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                  The ultimate collaborative coding platform where teams come together to write, 
                  share, and execute code in real-time. Start building your next big project today.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
                  Start Coding Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:border-gray-400 hover:bg-white transition-all duration-300 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Code Preview */}
            <div className="relative">
              <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1"></div>
                  <div className="text-gray-400 text-sm">main.js</div>
                </div>
                
                <pre className="text-sm text-gray-300 leading-relaxed">
                  <code>{codeExample}</code>
                </pre>
                
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  3 developers coding live
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Everything you need to <span className="text-blue-600">collaborate</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to make team coding seamless, productive, and enjoyable
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-2xl hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">How it works</h2>
            <p className="text-xl text-gray-600">Get started in minutes and start collaborating immediately</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create Your Project",
                description: "Sign up and create a new project in seconds. Choose your programming language and invite your team.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                step: "02", 
                title: "Invite Team Members",
                description: "Share your project's invite code with team members. They can join instantly and start collaborating.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                step: "03",
                title: "Code & Execute Together",
                description: "Write code together in real-time, see live changes, and execute your code directly in the browser.",
                gradient: "from-green-500 to-emerald-500"
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 bg-gradient-to-r ${item.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Trusted by developers worldwide
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are already using our platform to build amazing projects together
            </p>
            
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="bg-white rounded-3xl p-12 shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl">
                <Code className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to revolutionize your team's coding workflow?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start collaborating today and experience the future of team development
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              {[
                "Real-time collaboration",
                "15+ languages supported", 
                "Instant code execution",
                "Built-in team chat"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="hidden sm:block">{feature}</span>
                </div>
              ))}
            </div>
            
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg">
              Get Started Now - It's Free!
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;