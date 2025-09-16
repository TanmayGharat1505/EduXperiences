import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { ArrowRight, BookOpen, Users, MapPin, Star, CheckCircle, Globe, Sparkles, Award, Clock, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-learning.jpg";
import { StatsDisplay } from "@/components/StatsDisplay";
import { TutorPreview } from "@/components/TutorPreview";

export default function Home() {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Expert Tutors",
      description: "Connect with verified tutors and institutions across all subjects",
      highlight: "Verified"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-secondary" />,
      title: "Personalized Learning",
      description: "Custom learning paths based on your goals and preferences",
      highlight: "Tailored"
    },
    {
      icon: <MapPin className="h-8 w-8 text-accent" />,
      title: "Flexible Options",
      description: "Online, offline, or hybrid learning modes to fit your schedule",
      highlight: "Flexible"
    }
  ];

  const benefits = [
    {
      icon: <Award className="h-6 w-6" />,
      text: "Quality Assured"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      text: "24/7 Access"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      text: "Instant Matching"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Revolutionizing Education
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                  Connect, Learn,{" "}
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Excel
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                  Connect with expert tutors and leading institutions for personalized learning experiences that unlock your full potential.
                </p>
              </div>
              
              {/* Benefits */}
              <div className="flex flex-wrap items-center gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-8 h-8 bg-gradient-subtle rounded-full flex items-center justify-center">
                      {benefit.icon}
                    </div>
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4">
                {/* Primary CTA */}
                <div className="flex justify-center">
                  <Link to="/signup">
                    <Button 
                      size="lg" 
                      className="bg-gradient-primary shadow-medium hover:shadow-strong hover:scale-105 transition-all duration-300 text-lg px-12 py-4 h-auto rounded-xl w-full sm:w-auto"
                    >
                      Start Learning Today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
                
                {/* Secondary CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/tutors">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-300 text-lg px-8 py-3 h-auto rounded-xl w-full sm:w-auto"
                    >
                      Explore Tutors
                    </Button>
                  </Link>
                  <Link to="/institutions">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all duration-300 text-lg px-8 py-3 h-auto rounded-xl w-full sm:w-auto"
                    >
                      Explore Institutions
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-6">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground ml-2">Trusted by learners worldwide</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <img 
                  src={heroImage} 
                  alt="Students learning together" 
                  className="w-full h-auto object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-full h-full bg-gradient-primary rounded-3xl opacity-20 -z-10"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-secondary rounded-full opacity-30 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-background via-background/50 to-background">
        <StatsDisplay />
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary mb-6">
              <CheckCircle className="h-4 w-4" />
              Why Choose EduXperience?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Revolutionizing Education Through{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Innovation
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're building the future of education by connecting passionate learners with expert educators, 
              creating personalized learning experiences that drive real results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group border-none shadow-soft hover:shadow-strong hover:-translate-y-2 transition-all duration-500 bg-background/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-subtle rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <div className="mb-4">
                      <span className="inline-block bg-gradient-to-r from-primary/10 to-secondary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                        {feature.highlight}
                      </span>
                      <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-lg">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tutor Preview Section */}
      <section className="py-24 bg-gradient-to-r from-background via-background/50 to-background">
        <TutorPreview />
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero text-primary-foreground relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Ready to Begin?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Transform Your Learning Journey Today
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
              Join thousands of learners who have already discovered the power of personalized education 
              with EduXperience. Your future starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/signup-choice">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-background text-foreground hover:bg-background/90 hover:scale-105 shadow-medium text-lg px-10 py-4 h-auto rounded-xl transition-all duration-300"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white/50 text-white hover:bg-white hover:text-primary hover:scale-105 transition-all duration-300 text-lg px-8 py-4 h-auto rounded-xl bg-white/10 backdrop-blur-sm"
                >
                  Learn How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}