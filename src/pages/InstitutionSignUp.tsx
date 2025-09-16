import React from 'react';
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Clock, Send } from 'lucide-react';
import Step1 from '@/components/institution-signup/Step1';
import Step2 from '@/components/institution-signup/Step2';
import Step3 from '@/components/institution-signup/Step3';
import Step4 from '@/components/institution-signup/Step4';
import Step5 from '@/components/institution-signup/Step5';
import Step6 from '@/components/institution-signup/Step6';
import Step7 from '@/components/institution-signup/Step7';
import { toast } from 'sonner';

export default function InstitutionSignup() {
  const { 
    currentStep, 
    totalSteps, 
    nextStep, 
    prevStep, 
    canGoNext, 
    canGoPrev,
    stepCompletionStatus,
    isFormComplete,
    submitAllSteps
  } = useInstitutionSignup();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;
      case 5:
        return <Step5 />;
      case 6:
        return <Step6 />;
      case 7:
        return <Step7 />;
      default:
        return <Step1 />;
    }
  };

  // Get step status icon
  const getStepStatusIcon = (stepNumber: number) => {
    const status = stepCompletionStatus[stepNumber];
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'not_started':
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Get step status color
  const getStepStatusColor = (stepNumber: number) => {
    const status = stepCompletionStatus[stepNumber];
    
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-amber-600';
      case 'not_started':
      default:
        return 'text-muted-foreground';
    }
  };

  // Handle final submission
  const handleFinalSubmit = async () => {
    if (!isFormComplete) {
      toast.error('Please complete all steps before submitting');
      return;
    }

    try {
      const result = await submitAllSteps();
      
      if (result.success) {
        toast.success('Institution signup submitted successfully!');
        // Redirect to success page or dashboard
      } else {
        toast.error(`Submission failed: ${result.message}`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred during submission');
      console.error('Submission error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Institution Signup</h1>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            
            {/* Step Progress with Status */}
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalSteps }, (_, index) => (
                  <div
                    key={index + 1}
                    className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                      index + 1 <= currentStep
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              
              {/* Step Labels with Status Icons */}
              <div className="grid grid-cols-7 gap-2 text-xs">
                <div className={`text-center ${getStepStatusColor(1)}`}>
                  <div className="flex flex-col items-center space-y-1">
                    {getStepStatusIcon(1)}
                    <span>Basic Info</span>
                  </div>
                </div>
                <div className={`text-center ${getStepStatusColor(2)}`}>
                  <div className="flex flex-col items-center space-y-1">
                    {getStepStatusIcon(2)}
                    <span>Infrastructure</span>
                  </div>
                </div>
                <div className={`text-center ${getStepStatusColor(3)}`}>
                  <div className="flex flex-col items-center space-y-1">
                    {getStepStatusIcon(3)}
                    <span>Programs</span>
                  </div>
                </div>
                <div className={`text-center ${getStepStatusColor(4)}`}>
                  <div className="flex flex-col items-center space-y-1">
                    {getStepStatusIcon(4)}
                    <span>Faculty</span>
                  </div>
                </div>
                <div className={`text-center ${getStepStatusColor(5)}`}>
                  <div className="flex flex-col items-center space-y-1">
                    {getStepStatusIcon(5)}
                    <span>Achievements</span>
                  </div>
                </div>
                <div className={`text-center ${getStepStatusColor(6)}`}>
                  <div className="flex flex-col items-center space-y-1">
                    {getStepStatusIcon(6)}
                    <span>Fee Structure</span>
                  </div>
                </div>
                <div className={`text-center ${getStepStatusColor(7)}`}>
                  <div className="flex flex-col items-center space-y-1">
                    {getStepStatusIcon(7)}
                    <span>Contact & Verification</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-card rounded-lg border p-6 mb-6">
            {renderStep()}
          </div>

          {/* Navigation and Submit Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={!canGoPrev}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-3">
              {/* Final Submit Button - Only show on last step */}
              {currentStep === totalSteps && (
                <Button
                  onClick={handleFinalSubmit}
                  disabled={!isFormComplete}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  {/* isSubmitting is removed, so this block is now empty */}
                  <>
                    <Send className="h-4 w-4" />
                    Submit Application
                  </>
                </Button>
              )}
              
              {/* Next Button - Hide on last step */}
              {currentStep < totalSteps && (
                <Button
                  onClick={nextStep}
                  disabled={!canGoNext}
                  className="flex items-center space-x-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Form Completion Status */}
          <div className="mt-6 text-center">
            {isFormComplete ? (
              <div className="flex items-center justify-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">All steps completed! Ready to submit.</span>
              </div>
            ) : (
              <div className="text-muted-foreground">
                <span>Complete all steps to submit your application</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
