import React, { useState } from 'react'
import { Header } from '@/components/layout/Header'
import Step1BasicInfo from './institution-signup/Step1BasicInfo'
import Step2InstitutionDetails from './institution-signup/Step2InstitutionDetails'
import Step3AcademicPrograms from './institution-signup/Step3AcademicPrograms'
import Step4StaffFaculty from './institution-signup/Step4StaffFaculty'
import Step5ResultsAchievements from './institution-signup/Step5ResultsAchievements'
import Step6FeeStructure from './institution-signup/Step6FeeStructure'
import Step7FinalReview from './institution-signup/Step7FinalReview'

export default function InstitutionDashboard() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 7

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo onNext={nextStep} />
      case 2:
        return <Step2InstitutionDetails onNext={nextStep} onPrev={prevStep} />
      case 3:
        return <Step3AcademicPrograms onNext={nextStep} onPrev={prevStep} />
      case 4:
        return <Step4StaffFaculty onNext={nextStep} onPrev={prevStep} />
      case 5:
        return <Step5ResultsAchievements onNext={nextStep} onPrev={prevStep} />
      case 6:
        return <Step6FeeStructure onNext={nextStep} onPrev={prevStep} />
      case 7:
        return <Step7FinalReview onPrev={prevStep} />
      default:
        return <Step1BasicInfo onNext={nextStep} />
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Institution Registration</h1>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            
            {/* Step Indicators */}
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalSteps }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => goToStep(index + 1)}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    index + 1 <= currentStep
                      ? 'bg-primary'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            
            {/* Step Labels */}
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Basic Info</span>
              <span>Details</span>
              <span>Programs</span>
              <span>Staff</span>
              <span>Achievements</span>
              <span>Fees</span>
              <span>Review</span>
            </div>
          </div>

          {/* Step Content */}
          {renderStep()}
        </div>
      </div>
    </div>
  )
}
