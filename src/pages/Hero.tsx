import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Import the logo
import Logo from "/ReviveMedicalTech.png";
import DrMurtaza from "../assets/DrMurtaza.jpeg";
import Wajahat from "../assets/Wajahat.jpg";
import soal from "../assets/soal.jpg";
// Define TypeScript interfaces
interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string; // This should accept both emoji and image paths
}

const RMTFileManagementSystem: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features: Feature[] = [
    {
      id: 1,
      title: "Granular Permissions",
      description:
        "Control access at the file and folder level with precision, ensuring the right people have the right access.",
      icon: "🔐",
    },
    {
      id: 2,
      title: "User Management",
      description:
        "Easily create and manage user accounts with customizable permission sets for different roles.",
      icon: "👥",
    },
    {
      id: 3,
      title: "Hierarchical Structure",
      description:
        "Organize files in nested folders with inherited permissions that can be customized at any level.",
      icon: "📁",
    },
    {
      id: 4,
      title: "Secure File Sharing",
      description:
        "Share files securely with internal and external stakeholders with controlled access permissions.",
      icon: "📤",
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Dr. Murtaza Najabat Ali",
      role: "Chief Executive Officer",
      content:
        "This system has revolutionized how we manage our research documents and medical files. The file sharing capabilities are incredibly secure yet remarkably intuitive.",
      avatar: DrMurtaza, // Using DrMurtaza image for CEO
    },
    {
      id: 2,
      name: "Wajahat Ali Khan",
      role: "Head of Software Department",
      content:
        "Reliable document control is essential to our operations. This platform gives our teams clear ownership, disciplined access, and the confidence that controlled records remain secure and accountable.",
      avatar: Wajahat,
    },
    {
      id: 3,
      name: "Suhail Meghwar",
      role: "Quality Manager",
      content:
        "We went from struggling with chaotic file sharing methods to having a streamlined, secure system. Sharing large project files across teams is now instantaneous and foolproof.",
      avatar: soal, // Using Abdullah.png for Asad Abdullah
    },
  ];

  // File structure visualization component
  const FileStructureVisualization = () => (
    <div className="mt-16 bg-white p-6 rounded-2xl shadow-2xl">
      <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Visual Permission Management
      </h3>

      <div className="flex flex-col md:flex-row gap-8 justify-center">
        {/* Folder Structure */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h4 className="text-lg font-semibold mb-4 text-blue-600">
            Folder Hierarchy
          </h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-2xl mr-2">📁</span>
              <span className="font-medium">Research</span>
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Admin: Full Access
              </span>
            </div>
            <div className="ml-6 space-y-2">
              <div className="flex items-center">
                <span className="text-xl mr-2">📁</span>
                <span>Clinical Trials</span>
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Researchers: Read/Write
                </span>
              </div>
              <div className="ml-6 space-y-2">
                <div className="flex items-center">
                  <span className="text-xl mr-2">📁</span>
                  <span>Phase 1</span>
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Team A Only
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl mr-2">📁</span>
                  <span>Phase 2</span>
                  <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    Team B Only
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xl mr-2">📁</span>
                <span>Patient Records</span>
                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  Restricted Access
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-2xl mr-2">📁</span>
              <span className="font-medium">Administration</span>
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                HR: Full Access
              </span>
            </div>
          </div>
        </div>

        {/* Permission Visualization */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h4 className="text-lg font-semibold mb-4 text-blue-600">
            Permission Types
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center">
                <span className="text-xl mr-2">👁️</span>
                <span>View Files</span>
              </div>
              <div className="flex space-x-1">
                <span className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center text-white text-xs">
                  ✓
                </span>
                <span className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center text-white text-xs">
                  ✓
                </span>
                <span className="w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-white text-xs">
                  ✗
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center">
                <span className="text-xl mr-2">✏️</span>
                <span>Edit Files</span>
              </div>
              <div className="flex space-x-1">
                <span className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center text-white text-xs">
                  ✓
                </span>
                <span className="w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-white text-xs">
                  ✗
                </span>
                <span className="w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-white text-xs">
                  ✗
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center">
                <span className="text-xl mr-2">📤</span>
                <span>Download Files</span>
              </div>
              <div className="flex space-x-1">
                <span className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center text-white text-xs">
                  ✓
                </span>
                <span className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center text-white text-xs">
                  ✓
                </span>
                <span className="w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-white text-xs">
                  ✗
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center">
                <span className="text-xl mr-2">👥</span>
                <span>Manage Users</span>
              </div>
              <div className="flex space-x-1">
                <span className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center text-white text-xs">
                  ✓
                </span>
                <span className="w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-white text-xs">
                  ✗
                </span>
                <span className="w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-white text-xs">
                  ✗
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 flex justify-between">
            <span>Super Admin</span>
            <span>Researcher</span>
            <span>Intern</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header
        className={`w-full transition-all duration-300 z-50 ${
          isScrolled ? "bg-white shadow-md" : ""
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            {/* Logo in Header */}
            <img
              src={Logo}
              alt="Revive Medical Technologies"
              className="h-12 md:h-16 lg:h-20 xl:h-24 2xl:h-28 w-auto transition-all duration-300"
            />
          </div>

          <div>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-10 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-10 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Electronic Document Management System for
            <br />{" "}
            <span className="text-blue-600">Revive Meditech Pvt Ltd</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Advanced file and folder management system with granular
            permissions, designed specifically for Revive Medical Technologies.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/login"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl text-center"
            >
              Get Started
            </Link>
          </div>

          <FileStructureVisualization />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600">
              Designed with medical research and data security in mind, our
              system offers unparalleled control over your files.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
                  activeFeature === index
                    ? "bg-blue-600 text-white shadow-xl transform -translate-y-2"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p
                  className={
                    activeFeature === index ? "text-blue-100" : "text-gray-600"
                  }
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white"
      >
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Team Says</h2>
            <p className="text-lg text-blue-100">
              Hear from the professionals using our system daily at Revive
              Medical Technologies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white bg-opacity-10 p-6 rounded-2xl backdrop-filter backdrop-blur-sm"
              >
                <div className="mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto border-2 border-white"
                  />
                </div>
                <p className="mb-4 text-black italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <h4 className="font-semibold text-lg text-black">
                    {testimonial.name}
                  </h4>
                  <p className="text-black">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CEO Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
            <div className="flex-1">
              <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-8xl overflow-hidden">
                <img
                  src={DrMurtaza}
                  alt="Dr. Murtaza Najabat Ali"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Leadership Message
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                "At Revive Medical Technologies, we understand the critical
                importance of secure file management in medical research and
                innovation. Our system is designed to provide the highest level
                of security while maintaining ease of use for our team."
              </p>
              <div>
                <h4 className="font-semibold text-xl text-gray-800">
                  Dr. Murtaza Najabat Ali
                </h4>
                <p className="text-gray-600">CEO, CEng (UK), FIMechE, PE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Join Revive Medical Technologies in revolutionizing medical file
            management with our secure, permission-based system.
          </p>
          <Link
            to="/login"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
          >
            Start Using The System
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            {/* <p>
              Developed with <span className="text-red-500">❤️</span> by Mehtab
            </p> */}
            <p className="mt-2">
              &copy; 2025 Revive Meditech Pvt Ltd . All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RMTFileManagementSystem;
