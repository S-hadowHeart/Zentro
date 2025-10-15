import React from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaShieldAlt, FaChartLine, FaHeart, FaStar, FaUserAstronaut } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="bg-gradient-to-br from-zen-sand-light via-white to-zen-sand-light/70 font-sans">
      <Header />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

const Header = () => (
  <header className="container mx-auto px-6 py-6 flex justify-between items-center">
    <div className="flex items-center space-x-3">
      <FaLeaf className="h-8 w-8 text-zen-green" />
      <span className="text-2xl font-bold text-zen-charcoal tracking-wider">Zen Garden</span>
    </div>
    <nav className="hidden md:flex items-center space-x-8">
      <a href="#features" className="text-zen-charcoal/80 hover:text-zen-green transition-colors">Features</a>
      <a href="#testimonials" className="text-zen-charcoal/80 hover:text-zen-green transition-colors">Testimonials</a>
      <a href="#about" className="text-zen-charcoal/80 hover:text-zen-green transition-colors">About</a>
    </nav>
    <Link to="/login" className="px-6 py-2.5 bg-zen-green text-white font-semibold rounded-full shadow-md hover:bg-zen-green-dark transition-all transform hover:scale-105">
      Enter Garden
    </Link>
  </header>
);

const Hero = () => (
  <section className="py-20 text-center">
    <div className="container mx-auto px-6">
      <FaLeaf className="mx-auto h-24 w-24 text-zen-green mb-6 animate-pulse" />
      <h1 className="text-5xl md:text-6xl font-extrabold text-zen-charcoal mb-4">
        Cultivate Your Focus, Blossom into Your Best Self.
      </h1>
      <p className="text-xl text-zen-charcoal/70 leading-relaxed max-w-3xl mx-auto mb-10">
        Welcome to your personal sanctuary for productivity. Here, every task is a seed, every focus session is sunlight, and every goal achieved is a beautiful bloom.
      </p>
      <Link to="/register" className="px-10 py-5 bg-gradient-to-r from-zen-green to-teal-500 text-white font-bold rounded-full shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out text-lg flex items-center justify-center space-x-3 mx-auto w-fit">
        <FaLeaf className="h-6 w-6" />
        <span>Plant Your First Seed & Start Growing</span>
      </Link>
    </div>
  </section>
);

const featuresData = [
  { title: "The Pomodoro Technique, Reimagined", description: "Our timer helps you work in focused bursts, with mindful breaks. It's not just about time; it's about quality and intention.", icon: FaShieldAlt },
  { title: "Gamified Task Management", description: "Turn your to-do list into a garden. 'Plant' your tasks, 'nurture' them with focus, and 'harvest' your accomplishments.", icon: FaChartLine },
  { title: "Mindful Rewards & Gentle Discipline", description: "Stay motivated with a system of rewards for consistency and gentle reminders for when you get sidetracked.", icon: FaHeart }
];

const Features = () => (
  <section id="features" className="py-24 bg-white/60 backdrop-blur-md">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-zen-charcoal">A Garden of Features to Help You Flourish</h2>
        <p className="text-lg text-zen-charcoal/60 mt-4">Tools designed for tranquility and peak performance.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-12">
        {featuresData.map((feature, i) => (
          <div key={i} className="text-center p-8 bg-white rounded-3xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-shadow transform hover:-translate-y-2 duration-300">
            <div className="p-5 rounded-full bg-zen-green/10 mb-6 inline-block">
              <feature.icon className="h-10 w-10 text-zen-green-dark" />
            </div>
            <h3 className="text-2xl font-bold text-zen-charcoal mb-4">{feature.title}</h3>
            <p className="text-zen-charcoal/70">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const testimonialsData = [
  { name: "Alex, Software Developer", quote: "Zen Garden has transformed my workday. The focus cycles keep me on track, and the garden theme is surprisingly motivating. I'm getting more done and feeling less stressed.", avatar: FaUserAstronaut },
  { name: "Priya, Student", quote: "As a student juggling multiple subjects, this app is a lifesaver. It makes studying feel less like a chore and more like a game. My grades have actually improved!", avatar: FaUserAstronaut },
  { name: "David, Freelance Writer", quote: "The rewards and punishments system is genius. It provides that little extra push I need to stay disciplined. I finally feel in control of my deadlines.", avatar: FaUserAstronaut }
];

const Testimonials = () => (
  <section id="testimonials" className="py-24">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-zen-charcoal">Stories of Growth from Our Gardeners</h2>
        <p className="text-lg text-zen-charcoal/60 mt-4">See what others have cultivated with Zen Garden.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {testimonialsData.map((testimonial, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-lg border border-gray-200/50 flex flex-col items-center text-center">
            <testimonial.avatar className="h-16 w-16 text-zen-green mb-5" />
            <div className="text-yellow-500 flex space-x-1 mb-5">
              {[...Array(5)].map((_, i) => <FaStar key={i} />)}
            </div>
            <p className="text-zen-charcoal/80 mb-6 font-serif italic">"{testimonial.quote}"</p>
            <h4 className="font-bold text-zen-charcoal text-lg">- {testimonial.name}</h4>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CTA = () => (
  <section className="py-24 bg-zen-green/10">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-4xl font-bold text-zen-charcoal mb-4">Ready to Plant the Seeds of Success?</h2>
      <p className="text-xl text-zen-charcoal/70 mb-10">Your journey to a more focused, productive, and peaceful life begins now.</p>
      <Link to="/register" className="px-10 py-5 bg-gradient-to-r from-zen-green to-teal-500 text-white font-bold rounded-full shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out text-lg inline-block">
        Start Your Free Trial & Cultivate Your Garden
      </Link>
    </div>
  </section>
);

const Footer = () => (
  <footer id="about" className="bg-white py-12">
    <div className="container mx-auto px-6 text-center text-zen-charcoal/70">
      <h3 className="text-xl font-bold text-zen-charcoal mb-3">From the Gardener's Heart</h3>
      <p className="max-w-2xl mx-auto leading-relaxed mb-6 font-serif">
        Welcome to my digital sanctuary. I'm Dharmraj Sodha, a student with a passion for coding and a belief that technology can be a force for good. I created this app to help you find focus, cultivate discipline, and grow into the best version of yourself. I hope it brings you as much peace as it brought me to create it.
      </p>
      <div className="flex justify-center space-x-6 mb-8">
        <a href="https://www.linkedin.com/in/dharmraj-sodha/" target="_blank" rel="noopener noreferrer" className="hover:text-zen-green transition-colors">LinkedIn</a>
        <a href="https://s-hadowheart.carrd.co/" target="_blank" rel="noopener noreferrer" className="hover:text-zen-green transition-colors">Portfolio</a>
      </div>
      <p>&copy; {new Date().getFullYear()} Zen Garden. All Rights Reserved.</p>
    </div>
  </footer>
);

export default LandingPage;
