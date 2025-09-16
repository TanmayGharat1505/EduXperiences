import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface TutorCard {
  id: string;
  name: string;
  subject: string;
  tagline: string;
  rating: number;
  location: string;
  avatarUrl?: string;
  experience: string;
  price: string;
}

export function TutorPreview() {
  const [isVisible, setIsVisible] = useState(false);
  const [tutors, setTutors] = useState<TutorCard[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const fetchSampleTutors = async () => {
    try {
      setLoading(true);
      
      // Simple approach - just fetch a few tutor profiles
      const { data: tutorData, error: tutorError } = await supabase
        .from('tutor_profiles')
        .select('*')
        .eq('verified', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (tutorError) {
        console.error('Error fetching tutor profiles:', tutorError);
        return;
      }

      if (!tutorData || tutorData.length === 0) {
        console.log('No tutor profiles found for preview');
        setTutors([]);
        return;
      }

      console.log('Found tutor profiles for preview:', tutorData.length);

      // Transform the data to match our interface
      const transformedTutors: TutorCard[] = tutorData.map(tutor => ({
        id: tutor.id,
        name: 'Expert Tutor', // Generic name for preview
        subject: getSubjects(tutor),
        tagline: tutor.bio || 'Passionate educator dedicated to student success',
        rating: 4.8, // Default rating for now
        location: 'Various Locations',
        avatarUrl: undefined,
        experience: `${tutor.experience_years || 2}+ years`,
        price: getPriceRange(tutor.hourly_rate_min || 25, tutor.hourly_rate_max || 50)
      }));

      setTutors(transformedTutors);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjects = (tutor: any) => {
    if (tutor.qualifications?.subjects && tutor.qualifications.subjects.length > 0) {
      return tutor.qualifications.subjects.join(', ');
    }
    return 'General Tutoring';
  };

  const getPriceRange = (min: number, max: number) => {
    if (min === max) return `$${min}/hr`;
    return `$${min}-${max}/hr`;
  };

  // Fetch tutors when preview becomes visible
  useEffect(() => {
    if (isVisible && tutors.length === 0) {
      fetchSampleTutors();
    }
  }, [isVisible, tutors.length]);

  if (!isVisible) {
    return (
      <section className="py-16 bg-gradient-subtle" data-tutor-preview>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Meet Our Expert Tutors
            </h2>
            <p className="text-xl text-muted-foreground">
              Discover passionate educators ready to guide your learning journey
            </p>
            <Button 
              onClick={toggleVisibility}
              size="lg"
              className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-medium text-lg px-8 py-3 h-auto"
            >
              Find Tutors
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-subtle" data-tutor-preview>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Meet Our Expert Tutors
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover passionate educators ready to guide your learning journey
          </p>
        </div>

        {/* Tutor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-16 w-16 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                    <div className="flex justify-between mt-4">
                      <div className="h-4 bg-muted rounded w-16"></div>
                      <div className="h-4 bg-muted rounded w-20"></div>
                    </div>
                    <div className="h-8 bg-muted rounded mt-4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : tutors.length > 0 ? (
            tutors.map((tutor) => (
              <Card key={tutor.id} className="group hover:shadow-medium hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  {/* Tutor Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={tutor.avatarUrl} alt={tutor.name} />
                      <AvatarFallback className="bg-gradient-subtle text-primary font-semibold text-lg">
                        {tutor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {tutor.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{tutor.subject}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{tutor.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tagline */}
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {tutor.tagline}
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{tutor.rating}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{tutor.experience}</span>
                      <span>•</span>
                      <span className="font-medium text-primary">{tutor.price}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <div className="text-muted-foreground">
                <BookOpen className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tutors available</h3>
                <p>Check back later for available tutors or become one yourself!</p>
              </div>
            </div>
          )}
        </div>

        {/* View More Button */}
        <div className="text-center">
          <Link to="/tutors">
            <Button 
              size="lg"
              className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-medium text-lg px-8 py-3 h-auto"
            >
              View More Tutors
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-3">
            Join thousands of students already learning with our expert tutors
          </p>
        </div>

        {/* Hide Preview Button */}
        <div className="text-center mt-8">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleVisibility}
            className="text-muted-foreground hover:text-foreground"
          >
            Hide Preview
          </Button>
        </div>
      </div>
    </section>
  );
}
