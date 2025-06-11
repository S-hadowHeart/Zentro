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

      <div className="max-w-4xl w-full space-y-12 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 sm:p-10 border border-emerald-200 transform transition-all duration-300 hover:scale-[1.02]">
        <div className="text-center">
          <FaSeedling className="mx-auto h-20 w-20 text-emerald-600 mb-4 animate-bounce-slow" />
          <h1 className="text-4xl font-extrabold text-gray-900 bg-gradient-to-r from-emerald-600 to-green-800 bg-clip-text text-transparent mb-4">
            Welcome to Your Zen Garden of Productivity
          </h1>
          <p className="mt-2 text-xl text-gray-700 leading-relaxed">
            Cultivate focus, grow your goals, and find tranquility in your daily routine.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="p-4 rounded-full bg-emerald-100 mb-4">
              <FaSun className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Flourish with Focus</h2>
            <p className="text-gray-600">
              Our Pomodoro Timer, designed with the calming principles of a Zen Garden, helps you maintain deep focus, segment your work, and cultivate a disciplined approach to your tasks.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <div className="p-4 rounded-full bg-emerald-100 mb-4">
              <FaMoon className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Harvest Your Achievements</h2>
            <p className="text-gray-600">
              Track your progress, visualize your completed "cultivations," and reflect on your growth journey with insightful reports. Witness your garden of achievements bloom over time.
            </p>
          </div>
        </div>

        <div className="text-center mt-10">
          <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-green-700 to-emerald-900 bg-clip-text text-transparent mb-4">
            Ready to Plant Your First Seed?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex items-center justify-center space-x-2"
            >
              <FaLeaf className="h-5 w-5" />
              <span>Begin Your Cultivation</span>
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white border border-emerald-300 text-emerald-700 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex items-center justify-center space-x-2"
            >
              <span>Return to Garden</span>
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-emerald-200 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-3">A Note from the Gardener</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            This app is a creation by Dharmraj Sodha, a computer engineering student with a passion for creativity and a poetic touch to coding. It's built with the vision of helping you find calm and efficiency in your daily tasks.
          </p>
          <div className="flex justify-center space-x-6">
            <a
              href="https://www.linkedin.com/in/dharmraj-sodha/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-800 transition-colors duration-300"
            >
              LinkedIn
            </a>
            <a
              href="https://s-hadowheart.carrd.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-800 transition-colors duration-300"
            >
              My Other Projects
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage; 