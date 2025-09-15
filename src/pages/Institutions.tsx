import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Building2, ArrowRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';

interface InstitutionProfile {
  id: string;
  user_id: string;
  institution_name: string;
  description: string;
  type: string;
  established_year: number;
  student_count: number;
  verified: boolean;
  created_at: string;
  profile: {
    full_name: string;
    city: string;
    area: string;
  };
  subjects?: string[];
}

export default function Institutions() {
  const [institutions, setInstitutions] = useState<InstitutionProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      
      // First fetch institution profiles
      const { data: institutionData, error: institutionError } = await supabase
        .from('institution_profiles')
        .select('*')
        .eq('verified', true)
        .order('created_at', { ascending: false })
        .limit(6); // Show max 6 institutions

      if (institutionError) {
        console.error('Error fetching institution profiles:', institutionError);
        return;
      }

      if (!institutionData || institutionData.length === 0) {
        console.log('No institution profiles found');
        setInstitutions([]);
        return;
      }

      console.log('Found institution profiles:', institutionData.length);

      // Then fetch the corresponding user profiles
      const userIds = institutionData.map(institution => institution.user_id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, city, area')
        .in('id', userIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        return;
      }

      // Create a map of user_id to profile data
      const profileMap = new Map(profileData?.map(profile => [profile.id, profile]) || []);
      console.log('Found profiles:', profileData?.length || 0);

      // Transform the data to match our interface
      const transformedInstitutions = institutionData.map(institution => {
        const profile = profileMap.get(institution.user_id);
        return {
          ...institution,
          profile: profile || {
            full_name: 'Partner Institution',
            city: 'Various Locations',
            area: 'Online & In-Person'
          },
          // Extract subjects if available
          subjects: institution.subjects || []
        };
      });

      setInstitutions(transformedInstitutions);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInstitutionType = (type: string) => {
    if (!type) return 'Educational Institution';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getSubjects = (institution: InstitutionProfile) => {
    if (institution.subjects && institution.subjects.length > 0) {
      return institution.subjects.join(', ');
    }
    return 'Multiple Subjects';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading institutions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Partner with Leading
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}Institutions
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with verified educational institutions committed to academic excellence
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span>{institutions.length} verified institutions available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Institutions Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {institutions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-muted-foreground mb-4">
                <Building2 className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No institutions available</h3>
                <p>Check back later for available institutions or become one yourself!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {institutions.map((institution) => (
                <Card key={institution.id} className="group hover:shadow-medium hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm">
                  <CardContent className="p-6">
                    {/* Institution Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarFallback className="bg-gradient-subtle text-primary font-semibold text-lg">
                          {institution.institution_name?.split(' ').map(n => n[0]).join('') || 'PI'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {institution.institution_name || 'Partner Institution'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Building2 className="h-4 w-4" />
                          <span className="truncate">{getInstitutionType(institution.type)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{institution.profile.city}, {institution.profile.area}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                      {institution.description || 'Committed to providing quality education and fostering academic excellence'}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">4.9</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Est. {institution.established_year || '2020'}</span>
                        <span>•</span>
                        <span className="text-sm font-medium text-primary">
                          {institution.student_count || '500'}+ students
                        </span>
                      </div>
                    </div>

                    {/* Institution Type */}
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        {getInstitutionType(institution.type)}
                      </Badge>
                      {institution.verified && (
                        <Badge variant="default" className="text-xs">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link to="/signup-choice">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        View Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Signup CTA */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Partner with Top Institutions?
            </h2>
            <p className="text-xl text-muted-foreground">
              Sign up now to access complete institution profiles, explore partnership opportunities, and start your educational journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup-choice">
                <Button 
                  size="lg"
                  className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-medium text-lg px-8 py-3 h-auto"
                >
                  Sign Up Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-lg px-8 py-3 h-auto"
                >
                  Already have an account? Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
