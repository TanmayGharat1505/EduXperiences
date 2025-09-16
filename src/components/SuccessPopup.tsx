import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function SuccessPopup({
  isOpen,
  onClose,
  title = "Application Submitted Successfully!",
  message = "Your institution application has been submitted and is now under review. Our team will contact you within 2-3 business days.",
  buttonText = "Go to Login",
  onButtonClick
}: SuccessPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            {message}
          </p>
          
          <div className="flex flex-col space-y-3 pt-4">
            <Button 
              onClick={onButtonClick || onClose}
              className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
            >
              {buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Stay on Page
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
