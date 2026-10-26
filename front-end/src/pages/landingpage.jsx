import { Camera, BookOpen } from "lucide-react";

export default function LandingPage({ onSelectRole }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      <header className="px-6 py-6 md:px-12"></header>

      <main className="px-6 py-12 md:py-20 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-purple-800 mb-6 leading-tight">
          Campus Asset Management Platform
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
          Explore a coursework prototype for reserving equipment and managing loans.
          Student and staff accounts demonstrate the two sides of the workflow.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
          <button
            onClick={() => onSelectRole("student")}
            className="w-full sm:w-64 py-4 px-8 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-200"
          >
            Student Portal
          </button>

          <button
            onClick={() => onSelectRole("staff")}
            className="w-full sm:w-64 py-4 px-8 bg-white text-gray-900 rounded-xl font-semibold border-2 border-purple-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200"
          >
            Staff Portal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Arts Centre</h3>
            <p className="text-gray-600 text-sm">
              DSLR cameras, lighting kits, and creative equipment
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">IM Lab</h3>
            <p className="text-gray-600 text-sm">
              Laptops, tablets, VR headsets, and tech gear
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="w-12 h-12 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-fuchsia-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Library</h3>
            <p className="text-gray-600 text-sm">
              Projectors, study tech, and media equipment
            </p>
          </div>
        </div>
      </main>

      <footer className="px-6 py-8 text-center text-gray-500 text-sm">
        <p>Coursework demo · Local accounts · Fictional transactions</p>
      </footer>
    </div>
  );
}
