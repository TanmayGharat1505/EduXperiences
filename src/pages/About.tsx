import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, BookOpen, GraduationCap, Star, Heart, Target, Globe, Award, Lightbulb, TrendingUp, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';

const values = [
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Passion for Education",
    description: "We believe every individual deserves access to quality education and personalized learning experiences"
  },
  {
    icon: <Target className="h-8 w-8" />,
    title: "Excellence in Teaching",
    description: "Committed to connecting students with the most qualified and passionate educators"
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: "Global Accessibility",
    description: "Breaking down geographical barriers to make quality education available worldwide"
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Trust & Quality",
    description: "Maintaining the highest standards through verification and continuous quality assurance"
  }
];

const milestones = [
  {
    year: "2024",
    title: "Platform Launch",
    description: "EduXperience officially launches, connecting students with tutors and institutions"
  },
  {
    year: "2024",
    title: "First 1000 Users",
    description: "Reached our first milestone of 1000 active users across the platform"
  },
  {
    year: "2024",
    title: "Institution Partnerships",
    description: "Established partnerships with leading educational institutions"
  },
  {
    year: "2024",
    title: "Advanced Features",
    description: "Launched advanced matching algorithms and scheduling systems"
  }
];

const team = [
  {
    name: "Education Experts",
    role: "Curriculum & Pedagogy",
    description: "Seasoned educators and curriculum specialists ensuring quality learning experiences"
  },
  {
    name: "Technology Innovators",
    role: "Platform Development",
    description: "Experienced developers building cutting-edge educational technology solutions"
  },
  {
    name: "Student Advocates",
    role: "User Experience",
    description: "Dedicated professionals focused on creating seamless learning journeys"
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              About
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}EduXperience
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Revolutionizing education through technology, connecting passionate learners with expert educators worldwide
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-subtle rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To democratize quality education by creating a seamless platform that connects students, tutors, and institutions. 
                We believe that every individual, regardless of their location or background, should have access to personalized 
                learning experiences that unlock their full potential.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Through innovative technology and a commitment to excellence, we're building bridges between knowledge seekers 
                and knowledge providers, making education more accessible, engaging, and effective than ever before.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-subtle rounded-full flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Our Vision</h2>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To become the world's leading educational platform, where learning knows no boundaries. We envision a future 
                where quality education is accessible to everyone, everywhere, at any time.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                By fostering meaningful connections between learners and educators, we're creating a global community 
                that celebrates knowledge sharing, continuous growth, and lifelong learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at EduXperience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-subtle rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="text-primary">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What We Do
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering education through innovative technology and meaningful connections
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-subtle rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Connect Learners</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We bridge the gap between students seeking knowledge and expert educators who can provide it. 
                  Our platform makes it easy to find the perfect learning match based on subjects, expertise, 
                  and learning preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-subtle rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Facilitate Learning</h3>
                <p className="text-muted-foreground leading-relaxed">
                  From one-on-one tutoring sessions to institutional programs, we provide the tools and 
                  infrastructure needed for effective learning. Our platform supports various learning 
                  formats and schedules to accommodate different needs.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-subtle rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Enable Growth</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We're not just about connecting people—we're about fostering growth. Our platform 
                  provides opportunities for tutors to build their teaching business, institutions to 
                  expand their reach, and students to achieve their educational goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Journey & Milestones */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Key milestones in our mission to transform education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <Card key={index} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-subtle rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="text-primary font-bold text-xl">{milestone.year}</div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{milestone.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{milestone.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team & Expertise */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Team & Expertise
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Behind EduXperience is a dedicated team committed to educational excellence
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-none shadow-soft hover:shadow-medium transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-subtle rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-primary font-medium mb-4">{member.role}</p>
                  <p className="text-muted-foreground leading-relaxed">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Join Our Educational Revolution
            </h2>
            <p className="text-xl opacity-90">
              Be part of the future of education. Whether you're a student, tutor, or institution, 
              we're here to support your educational journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup-choice">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-background text-foreground hover:bg-background/90 shadow-medium text-lg px-8 py-3 h-auto"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all duration-300 text-lg px-8 py-3 h-auto"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
