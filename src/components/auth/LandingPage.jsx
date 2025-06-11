import React from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaSeedling, FaSun, FaMoon } from 'react-icons/fa'; // Zen Garden theme icons

function LandingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/2 w-32 h-32 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl w-full space-y-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 sm:p-10 border border-emerald-200 transform transition-all duration-300 hover:scale-[1.02]">
        <div className="text-center">
          <FaLeaf className="mx-auto h-20 w-20 text-emerald-600 mb-4 animate-pulse" />
          <h1 className="text-4xl font-extrabold text-gray-900 bg-gradient-to-r from-emerald-600 to-green-800 bg-clip-text text-transparent mb-4">
            Nurture Your Growth, One Task at a Time
          </h1>
          <p className="mt-2 text-xl text-gray-700 leading-relaxed font-serif">
            Step into your personal Zen Garden of Productivity. Here, every task is a seed, every focus session a ray of sunshine, and every completed goal a blossoming achievement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start group">
            <div className="p-4 rounded-full bg-emerald-100 mb-4 group-hover:scale-110 transition-transform duration-300">
              <FaSun className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-emerald-700 transition-colors duration-300">Cultivate Deep Focus</h2>
            <p className="text-gray-600 font-serif">
              Our unique Pomodoro Timer helps you sow seeds of intention and cultivate uninterrupted focus. Segment your work into serene "growth cycles" and watch your concentration blossom.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start group">
            <div className="p-4 rounded-full bg-emerald-100 mb-4 group-hover:scale-110 transition-transform duration-300">
              <FaMoon className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-emerald-700 transition-colors duration-300">Harvest Your Success</h2>
            <p className="text-gray-600 font-serif">
              Track your efforts and visualize your garden of achievements. Our insightful reports help you reflect on your journey, celebrate completed "cultivations," and see your progress flourish.
            </p>
          </div>
        </div>

        <div className="text-center mt-10">
          <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-green-700 to-emerald-900 bg-clip-text text-transparent mb-4">
            Ready to Begin Your Growth Journey?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex items-center justify-center space-x-2"
            >
              <FaLeaf className="h-5 w-5" />
              <span>Plant Your First Seed</span>
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white border border-emerald-300 text-emerald-700 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex items-center justify-center space-x-2"
            >
              <span>Return to My Garden</span>
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-emerald-200 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-3">From the Gardener's Heart</h3>
          <p className="text-gray-600 leading-relaxed mb-4 font-serif">
            This app is a thoughtful creation by Dharmraj Sodha, a computer engineering student driven by creativity and a belief that coding can be a poetic expression. My aim is to offer you a digital sanctuary where focus flourishes and daily tasks become a serene path to personal growth.
          </p>
          <div className="flex justify-center space-x-6">
            <a
              href="https://www.linkedin.com/in/dharmraj-sodha/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-800 transition-colors duration-300 flex items-center space-x-1"
            >
              LinkedIn <FaLeaf className="w-4 h-4 text-emerald-500"/>
            </a>
            <a
              href="https://s-hadowheart.carrd.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-800 transition-colors duration-300 flex items-center space-x-1"
            >
              My Digital Garden <FaLeaf className="w-4 h-4 text-emerald-500"/>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage; 