import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Tutorium</h3>
            <p className="text-blue-200 mb-4">
              Connecting Nigerian engineering students with certified lecturers for quality education and mentorship.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-blue-200 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-blue-200 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-blue-200 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-blue-200 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-blue-200 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/questions" className="text-blue-200 hover:text-white transition-colors">
                  Questions
                </Link>
              </li>
              <li>
                <Link href="/lessons" className="text-blue-200 hover:text-white transition-colors">
                  Video Lessons
                </Link>
              </li>
              <li>
                <Link href="/study-groups" className="text-blue-200 hover:text-white transition-colors">
                  Study Groups
                </Link>
              </li>
            </ul>
          </div>

          {/* For Students */}
          <div>
            <h4 className="text-lg font-semibold mb-4">For Students</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/ask" className="text-blue-200 hover:text-white transition-colors">
                  Ask a Question
                </Link>
              </li>
              <li>
                <Link href="/student/lecturers" className="text-blue-200 hover:text-white transition-colors">
                  Find Lecturers
                </Link>
              </li>
              <li>
                <Link href="/achievements" className="text-blue-200 hover:text-white transition-colors">
                  Achievements
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-blue-200 hover:text-white transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-200" />
                <span className="text-blue-200">support@tutorium.ng</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-200" />
                <span className="text-blue-200">+234 800 123 4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-200" />
                <span className="text-blue-200">Lagos, Nigeria</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-200 text-sm">© {new Date().getFullYear()} Tutorium. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-blue-200 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-blue-200 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/help" className="text-blue-200 hover:text-white text-sm transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
