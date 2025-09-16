import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import SignUpChoice from "@/pages/SignUpChoice";
import StudentSignUp from "@/pages/StudentSignUp";
import TutorSignUp from "@/pages/TutorSignUp";
import InstitutionSignup from "@/pages/InstitutionSignUp";
import { InstitutionSignupProvider } from "@/contexts/InstitutionSignupContext";

import StudentDashboard from "@/pages/StudentDashboard";
import TutorDashboard from "@/pages/TutorDashboard";
import InstitutionDashboard from "@/pages/InstitutionDashboardNew";
import InquiryDashboard from "@/pages/InquiryDashboard";
import InquiryDetailPage from "@/pages/InquiryDetailPage";
import CoursesBatchesPage from "@/pages/CoursesBatchesPage";

import NotFound from "@/pages/NotFound";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminRoute from "@/components/admin/AdminRoute";
import UserRegistration from "@/pages/UserRegistration";
import ContentUpload from "@/pages/ContentUpload";
import LeaveReview from "@/pages/LeaveReview";
import FeatureShowcase from "@/pages/FeatureShowcase";
import VerificationPage from "@/pages/VerificationPage";
import VerificationStatus from "@/components/verification/VerificationStatus";
import PricingPage from '@/pages/PricingPage';
import Tutors from '@/pages/Tutors';
import Institutions from '@/pages/Institutions';
import HowItWorks from '@/pages/HowItWorks';
import About from '@/pages/About';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<FeatureShowcase />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup-choice" element={<SignUpChoice />} />
        <Route path="/student-signup" element={<StudentSignUp />} />
        <Route path="/tutor-signup" element={<TutorSignUp />} />
        <Route path="/institution-signup" element={
          <InstitutionSignupProvider>
            <InstitutionSignup />
          </InstitutionSignupProvider>
        } />

        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/tutor-dashboard" element={<TutorDashboard />} />
        <Route path="/institution-dashboard" element={<InstitutionDashboard />} />
        <Route path="/institution-dashboard/inquiries" element={<InquiryDashboard />} />
        <Route path="/institution-dashboard/inquiries/:id" element={<InquiryDetailPage />} />
        <Route path="/institution/courses" element={<CoursesBatchesPage />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route path="/register" element={<UserRegistration />} />
        <Route path="/upload-content" element={<ContentUpload />} />
        <Route path="/review/:tutorId" element={<LeaveReview />} />
        <Route path="/verification" element={<VerificationPage userType="tutor" />} />
        <Route path="/verification-status" element={<VerificationStatus userType="tutor" />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/tutors" element={<Tutors />} />
        <Route path="/institutions" element={<Institutions />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
