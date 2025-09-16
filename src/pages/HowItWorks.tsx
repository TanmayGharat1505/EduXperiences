import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, BookOpen, GraduationCap, Star, Clock, MapPin, Building2, UserCheck, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';

const steps = [
  {
    icon: <Users className="h-8 w-8" />,
    title: "1. Choose Your Path",
    description: "Sign up as a Student, Tutor, or Institution based on your role in education",
    details: "Select from three distinct user types, each with tailored features and capabilities"
  },
  {
    icon: <UserCheck className="h-8 w-8" />,
    title: "2. Complete Your Profile",
    description: "Build a comprehensive profile showcasing your expertise, experience, and goals",
    details: "Add qualifications, subjects, availability, and personal information to stand out"
  },
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "3. Discover & Connect",
    description: "Browse through verified profiles and find your perfect learning match",
    details: "Use advanced filters to find tutors, institutions, or students that match your criteria"
  },
  {
    icon: <GraduationCap className="h-8 w-8" />,
    title: "4. Start Learning",
    description: "Book sessions, enroll in courses, and begin your educational journey",
    details: "Schedule one-on-one sessions, join group classes, or explore institutional programs"
  }
];

const features = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Verified Profiles",
    description: "All tutors and institutions are thoroughly verified for quality and authenticity"
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Instant Matching",
    description: "Smart algorithms connect you with the best educational partners quickly"
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Flexible Scheduling",
    description: "Book sessions at your convenience with real-time availability tracking"
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: "Quality Assurance",
    description: "Built-in review system ensures continuous improvement and accountability"
  }
];

const userTypes = [
  {
    icon: <Users className="h-12 w-12" />,
    title: "Students",
    description: "Find personalized learning experiences with expert tutors and institutions",
    benefits: [
      "Access to verified tutors and institutions",
      "Flexible scheduling and booking",
      "Progress tracking and feedback",
      "Multiple learning formats"
    ],
    cta: "Start Learning",
    link: "/signup-choice"
  },
  {
    icon: <GraduationCap className="h-12 w-12" />,
    title: "Tutors",
    description: "Share your expertise and build a successful teaching business",
    benefits: [
      "Create professional profiles",
      "Manage bookings and schedules",
      "Set your own rates",
      "Build student relationships"
    ],
    cta: "Become a Tutor",
    link: "/signup-choice"
  },
  {
    icon: <Building2 className="h-12 w-12" />,
    title: "Institutions",
    description: "Partner with us to expand your reach and offer quality education",
    benefits: [
      "Institutional profile management",
      "Course and program listings",
      "Student enrollment tools",
      "Partnership opportunities"
    ],
    cta: "Partner With Us",
    link: "/signup-choice"
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              How
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}EduXperience
              </span>
              {" "}Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your complete guide to navigating the platform and maximizing your educational experience
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our streamlined onboarding process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 bg-background text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-subtle rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="text-primary">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground mb-3 leading-relaxed">{step.description}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose EduXperience?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with modern technology and user experience in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-soft hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Designed for Everyone
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're learning, teaching, or managing an institution, we have you covered
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {userTypes.map((userType, index) => (
              <Card key={index} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 bg-background">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-subtle rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="text-primary">
                      {userType.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{userType.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{userType.description}</p>
                  
                  <div className="space-y-3 mb-8 text-left">
                    {userType.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Link to={userType.link}>
                    <Button 
                      className="w-full bg-gradient-primary hover:bg-gradient-primary/90 shadow-medium"
                    >
                      {userType.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started CTA */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of learners, tutors, and institutions already using EduXperience
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup-choice">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-background text-foreground hover:bg-background/90 shadow-medium text-lg px-8 py-3 h-auto"
                >
                  Create Your Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all duration-300 text-lg px-8 py-3 h-auto"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
