import React from 'react';

function Footer() {
  return (
    <footer className="bg-white text-gray-700 py-12 mt-auto border-t-4 border-yellow-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
              <span className="w-8 h-1 bg-yellow-400 mr-2"></span>
              About Done-It
            </h3>
            <p className="text-gray-600 text-sm">
              Done-It connects you with skilled professionals for all your home service needs.
              Quality service, guaranteed satisfaction.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
              <span className="w-8 h-1 bg-yellow-400 mr-2"></span>
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-600 hover:text-yellow-500 transition-colors duration-300">Home</a></li>
              <li><a href="/services" className="text-gray-600 hover:text-yellow-500 transition-colors duration-300">Services</a></li>
              <li><a href="/about" className="text-gray-600 hover:text-yellow-500 transition-colors duration-300">About Us</a></li>
              <li><a href="/contact" className="text-gray-600 hover:text-yellow-500 transition-colors duration-300">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
              <span className="w-8 h-1 bg-yellow-400 mr-2"></span>
              Popular Services
            </h3>
            <ul className="space-y-2">
              <li><a href="/services/plumbing" className="text-gray-600 hover:text-yellow-500 transition-colors duration-300">Plumbing</a></li>
              <li><a href="/services/electrical" className="text-gray-600 hover:text-yellow-500 transition-colors duration-300">Electrical</a></li>
              <li><a href="/services/cleaning" className="text-gray-600 hover:text-yellow-500 transition-colors duration-300">Cleaning</a></li>
              <li><a href="/services/ac" className="text-gray-600 hover:text-yellow-500 transition-colors duration-300">AC Repair</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
              <span className="w-8 h-1 bg-yellow-400 mr-2"></span>
              Connect With Us
            </h3>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-100 p-2 rounded-full text-gray-600 hover:bg-yellow-100 hover:text-yellow-500 transition-all duration-300">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </a>
              <a href="#" className="bg-gray-100 p-2 rounded-full text-gray-600 hover:bg-yellow-100 hover:text-yellow-500 transition-all duration-300">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124-4.09-.193-7.715-2.157-10.141-5.126-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14-7.503 14-14 0-.21-.005-.418-.015-.628.961-.689 1.8-1.56 2.46-2.548l-.047-.02z" />
                </svg>
              </a>
              <a href="#" className="bg-gray-100 p-2 rounded-full text-gray-600 hover:bg-yellow-100 hover:text-yellow-500 transition-all duration-300">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center">
            <div className="bg-yellow-400 h-8 w-8 rounded-full flex items-center justify-center mr-2">
              <span className="font-bold text-white">D</span>
            </div>
            <span className="font-bold text-gray-800">Done-It</span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Done-It. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
