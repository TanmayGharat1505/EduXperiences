import React, { useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useInstitutionSignup } from '@/contexts/InstitutionSignupContext';

export default function Step6() {
  const { updateStep6Data, formData } = useInstitutionSignup();
  
  const [courses, setCourses] = React.useState([
    {
      id: 1,
      courseName: '',
      admissionFee: '',
      monthlyFee: '',
      quarterlyFee: '',
      annualFee: '',
      materialCharges: '',
      examFee: '',
      otherCharges: ''
    }
  ]);

  const [scholarshipAvailable, setScholarshipAvailable] = React.useState('');
  const [scholarshipCriteria, setScholarshipCriteria] = React.useState('');
  
  const [paymentModes, setPaymentModes] = React.useState({
    cash: false,
    cheque: false,
    bankTransfer: false,
    onlinePayment: false,
    upi: false,
    creditDebitCards: false
  });
  
  const [emiAvailable, setEmiAvailable] = React.useState('');
  const [paymentSchedule, setPaymentSchedule] = React.useState('');
  const [latePaymentPenalty, setLatePaymentPenalty] = React.useState('');
  const [refundPolicy, setRefundPolicy] = React.useState('');
  const [discountMultipleCourses, setDiscountMultipleCourses] = React.useState('');
  const [siblingDiscount, setSiblingDiscount] = React.useState('');
  const [earlyBirdDiscount, setEarlyBirdDiscount] = React.useState('');
  const [educationLoanAssistance, setEducationLoanAssistance] = React.useState('');
  const [installmentFacility, setInstallmentFacility] = React.useState('');
  const [hardshipSupport, setHardshipSupport] = React.useState('');
  
  // Load from context on mount and when context changes
  useEffect(() => {
    if (formData.step6) {
      const step6Data = formData.step6;
      setCourses(step6Data.courses || []);
      setScholarshipAvailable(step6Data.scholarshipAvailable || '');
      setScholarshipCriteria(step6Data.scholarshipCriteria || '');
      setPaymentModes(step6Data.paymentModes || {
        cash: false,
        cheque: false,
        bankTransfer: false,
        onlinePayment: false,
        upi: false,
        creditDebitCards: false
      });
      setEmiAvailable(step6Data.emiAvailable || '');
      setPaymentSchedule(step6Data.paymentSchedule || '');
      setLatePaymentPenalty(step6Data.latePaymentPenalty || '');
      setRefundPolicy(step6Data.refundPolicy || '');
      setDiscountMultipleCourses(step6Data.discountMultipleCourses || '');
      setSiblingDiscount(step6Data.siblingDiscount || '');
      setEarlyBirdDiscount(step6Data.earlyBirdDiscount || '');
      setEducationLoanAssistance(step6Data.educationLoanAssistance || '');
      setInstallmentFacility(step6Data.installmentFacility || '');
      setHardshipSupport(step6Data.hardshipSupport || '');
      
      console.log('Step 6 data synced from context:', step6Data);
    }
  }, [formData.step6]);

  // Save progress to localStorage
  const handleSaveStep6 = () => {
    const step6Data = {
      courses,
      scholarshipAvailable,
      scholarshipCriteria,
      paymentModes,
      emiAvailable,
      paymentSchedule,
      latePaymentPenalty,
      refundPolicy,
      discountMultipleCourses,
      siblingDiscount,
      earlyBirdDiscount,
      educationLoanAssistance,
      installmentFacility,
      hardshipSupport
    };
    
    localStorage.setItem('step6Data', JSON.stringify(step6Data));
    updateStep6Data(step6Data);
  };

  // Submit to Supabase
  const handleSubmitToSupabase = async () => {
    // This function is no longer used as per the edit hint
    // The original code had a submitStep6 function from useInstitutionSignup
    // which is removed from imports.
    // Keeping the function signature but removing the call as it's no longer available.
    // If the intent was to remove the entire submit logic, this function would also be removed.
    // Given the edit hint, I'm only removing the imports and state variables.
    // The submit logic itself is not part of the requested edit.
    console.warn('handleSubmitToSupabase is called, but submitStep6 is no longer available.');
  };

  const addCourse = () => {
    const newCourse = {
      id: Date.now(),
      courseName: '',
      admissionFee: '',
      monthlyFee: '',
      quarterlyFee: '',
      annualFee: '',
      materialCharges: '',
      examFee: '',
      otherCharges: ''
    };
    setCourses([...courses, newCourse]);
  };

  const removeCourse = (id: number) => {
    if (courses.length > 1) {
      setCourses(courses.filter(course => course.id !== id));
    }
  };

  const updateCourse = (id: number, field: string, value: string) => {
    setCourses(courses.map(course =>
      course.id === id ? { ...course, [field]: value } : course
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fee Structure & Policies
          </h1>
          <p className="text-gray-600">
            Configure your institution's fee structure, payment policies, and financial terms
          </p>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {/* Detailed Fee Structure Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 text-center">
              Detailed Fee Structure
            </h2>
            
            <div className="space-y-6">
              {courses.map((course, index) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">
                      Course/Subject {index + 1}
                    </h3>
                    {courses.length > 1 && (
                      <button
                        onClick={() => removeCourse(course.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Course/Subject Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Course/Subject Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter course or subject name"
                        value={course.courseName}
                        onChange={(e) => updateCourse(course.id, 'courseName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* One-time Admission Fee */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        One-time Admission Fee <span className="text-red-500">*</span> (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={course.admissionFee}
                        onChange={(e) => updateCourse(course.id, 'admissionFee', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Monthly Fee */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Monthly Fee <span className="text-red-500">*</span> (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={course.monthlyFee}
                        onChange={(e) => updateCourse(course.id, 'monthlyFee', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Quarterly Fee */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Quarterly Fee <span className="text-red-500">*</span> (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={course.quarterlyFee}
                        onChange={(e) => updateCourse(course.id, 'quarterlyFee', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Annual Fee */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Annual Fee <span className="text-red-500">*</span> (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={course.annualFee}
                        onChange={(e) => updateCourse(course.id, 'annualFee', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Material/Book Charges */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Material/Book Charges (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={course.materialCharges}
                        onChange={(e) => updateCourse(course.id, 'materialCharges', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Exam Fee */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Exam Fee (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={course.examFee}
                        onChange={(e) => updateCourse(course.id, 'examFee', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Other Charges */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Other Charges (specify, ₹)
                      </label>
                      <input
                        type="text"
                        placeholder="Specify other charges and amount"
                        value={course.otherCharges}
                        onChange={(e) => updateCourse(course.id, 'otherCharges', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
                             {/* Add Course Button */}
               <div className="text-center">
                 <button
                   onClick={addCourse}
                   className="flex items-center space-x-2"
                 >
                   <Plus className="h-4 w-4" />
                   Add Another Course/Subject
                 </button>
               </div>
             </div>
           </div>

           {/* Payment Options Section */}
           <div className="space-y-6 pt-8 border-t border-gray-200">
             <h2 className="text-2xl font-semibold text-gray-900 text-center">
               Payment Options
             </h2>
             
             <div className="space-y-6">
                               {/* Payment Modes Accepted */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700">
                    Payment Modes Accepted <span className="text-red-500">*</span>
                  </label>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       {/* Cash */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="payment-cash"
                        checked={paymentModes.cash}
                        onChange={(e) => setPaymentModes(prev => ({ ...prev, cash: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="payment-cash" className="text-sm font-medium text-gray-700">
                        Cash
                      </label>
                    </div>

                    {/* Cheque */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="payment-cheque"
                        checked={paymentModes.cheque}
                        onChange={(e) => setPaymentModes(prev => ({ ...prev, cheque: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="payment-cheque" className="text-sm font-medium text-gray-700">
                        Cheque
                      </label>
                    </div>

                    {/* Bank Transfer */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="payment-bank-transfer"
                        checked={paymentModes.bankTransfer}
                        onChange={(e) => setPaymentModes(prev => ({ ...prev, bankTransfer: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="payment-bank-transfer" className="text-sm font-medium text-gray-700">
                        Bank Transfer
                      </label>
                    </div>

                    {/* Online Payment */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="payment-online"
                        checked={paymentModes.onlinePayment}
                        onChange={(e) => setPaymentModes(prev => ({ ...prev, onlinePayment: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="payment-online" className="text-sm font-medium text-gray-700">
                        Online Payment
                      </label>
                    </div>

                    {/* UPI */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="payment-upi"
                        checked={paymentModes.upi}
                        onChange={(e) => setPaymentModes(prev => ({ ...prev, upi: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="payment-upi" className="text-sm font-medium text-gray-700">
                        UPI
                      </label>
                    </div>

                    {/* Credit/Debit Cards */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="payment-cards"
                        checked={paymentModes.creditDebitCards}
                        onChange={(e) => setPaymentModes(prev => ({ ...prev, creditDebitCards: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="payment-cards" className="text-sm font-medium text-gray-700">
                        Credit/Debit Cards
                      </label>
                    </div>
                 </div>
               </div>

                               {/* EMI Available */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    EMI Available
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="emi-yes"
                        name="emi-available"
                        value="yes"
                        checked={emiAvailable === 'yes'}
                        onChange={(e) => setEmiAvailable(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="emi-yes" className="text-sm text-gray-700">
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="emi-no"
                        name="emi-available"
                        value="no"
                        checked={emiAvailable === 'no'}
                        onChange={(e) => setEmiAvailable(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="emi-no" className="text-sm text-gray-700">
                        No
                      </label>
                    </div>
                  </div>
                </div>

                               {/* Payment Schedule */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Payment Schedule <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="schedule-monthly"
                        name="payment-schedule"
                        value="monthly"
                        checked={paymentSchedule === 'monthly'}
                        onChange={(e) => setPaymentSchedule(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="schedule-monthly" className="text-sm text-gray-700">
                        Monthly
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="schedule-quarterly"
                        name="payment-schedule"
                        value="quarterly"
                        checked={paymentSchedule === 'quarterly'}
                        onChange={(e) => setPaymentSchedule(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="schedule-quarterly" className="text-sm text-gray-700">
                        Quarterly
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="schedule-half-yearly"
                        name="payment-schedule"
                        value="half-yearly"
                        checked={paymentSchedule === 'half-yearly'}
                        onChange={(e) => setPaymentSchedule(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="schedule-half-yearly" className="text-sm text-gray-700">
                        Half-yearly
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="schedule-annual"
                        name="payment-schedule"
                        value="annual"
                        checked={paymentSchedule === 'annual'}
                        onChange={(e) => setPaymentSchedule(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="schedule-annual" className="text-sm text-gray-700">
                        Annual
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="schedule-flexible"
                        name="payment-schedule"
                        value="flexible"
                        checked={paymentSchedule === 'flexible'}
                        onChange={(e) => setPaymentSchedule(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="schedule-flexible" className="text-sm text-gray-700">
                        Flexible
                      </label>
                    </div>
                  </div>
                </div>
             </div>
           </div>

           {/* Fee Policies Section */}
           <div className="space-y-6 pt-8 border-t border-gray-200">
             <h2 className="text-2xl font-semibold text-gray-900 text-center">
               Fee Policies
             </h2>
             
             <div className="space-y-6">
                               {/* Late Payment Penalty */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Late Payment Penalty (₹ or %)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., ₹500 or 5% per month"
                    value={latePaymentPenalty}
                    onChange={(e) => setLatePaymentPenalty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500">
                    Specify the penalty amount or percentage for late payments
                  </p>
                </div>

                               {/* Refund Policy */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Refund Policy <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Detail your institution's refund policy including conditions, timeframes, refund amounts, and any administrative charges..."
                    value={refundPolicy}
                    onChange={(e) => setRefundPolicy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    Provide comprehensive details about your refund policy, conditions, and procedures
                  </p>
                </div>

               {/* Scholarship Available */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">
                   Scholarship Available
                 </label>
                 <div className="flex items-center space-x-4">
                   <div className="flex items-center space-x-2">
                     <input
                       type="radio"
                       id="scholarship-yes"
                       name="scholarship-available"
                       value="yes"
                       checked={scholarshipAvailable === 'yes'}
                       onChange={(e) => setScholarshipAvailable(e.target.value)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                     <label htmlFor="scholarship-yes" className="text-sm text-gray-700">
                       Yes
                     </label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <input
                       type="radio"
                       id="scholarship-no"
                       name="scholarship-available"
                       value="no"
                       checked={scholarshipAvailable === 'no'}
                       onChange={(e) => setScholarshipAvailable(e.target.value)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                     <label htmlFor="scholarship-no" className="text-sm text-gray-700">
                       No
                     </label>
                   </div>
                 </div>
               </div>

               {/* Scholarship Criteria - Only show if scholarship is available */}
               {scholarshipAvailable === 'yes' && (
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700">
                     Scholarship Criteria
                   </label>
                   <textarea
                     rows={4}
                     placeholder="Detail your scholarship criteria including academic requirements, financial need, application process, and scholarship amounts..."
                     value={scholarshipCriteria}
                     onChange={(e) => setScholarshipCriteria(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                   />
                   <p className="text-xs text-gray-500">
                     Provide details about scholarship eligibility, application process, and award amounts
                 </p>
                 </div>
               )}

               {/* Discount for Multiple Courses */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">
                   Discount for Multiple Courses
                 </label>
                 <div className="flex items-center space-x-4">
                   <div className="flex items-center space-x-2">
                     <input
                       type="radio"
                       id="discount-yes"
                       name="discount-multiple-courses"
                       value="yes"
                       checked={discountMultipleCourses === 'yes'}
                       onChange={(e) => setDiscountMultipleCourses(e.target.value)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                     <label htmlFor="discount-yes" className="text-sm text-gray-700">
                       Yes
                     </label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <input
                       type="radio"
                       id="discount-no"
                       name="discount-multiple-courses"
                       value="no"
                       checked={discountMultipleCourses === 'no'}
                       onChange={(e) => setDiscountMultipleCourses(e.target.value)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                     <label htmlFor="discount-no" className="text-sm text-gray-700">
                       No
                     </label>
                   </div>
                 </div>
               </div>

               {/* Sibling Discount */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">
                   Sibling Discount
                 </label>
                 <div className="flex items-center space-x-4">
                   <div className="flex items-center space-x-2">
                     <input
                       type="radio"
                       id="sibling-discount-yes"
                       name="sibling-discount"
                       value="yes"
                       checked={siblingDiscount === 'yes'}
                       onChange={(e) => setSiblingDiscount(e.target.value)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                     <label htmlFor="sibling-discount-yes" className="text-sm text-gray-700">
                       Yes
                     </label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <input
                       type="radio"
                       id="sibling-discount-no"
                       name="sibling-discount"
                       value="no"
                       checked={siblingDiscount === 'no'}
                       onChange={(e) => setSiblingDiscount(e.target.value)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                     <label htmlFor="sibling-discount-no" className="text-sm text-gray-700">
                       No
                     </label>
                   </div>
                 </div>
               </div>

               {/* Early Bird Discount */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">
                   Early Bird Discount
                 </label>
                 <div className="flex items-center space-x-4">
                   <div className="flex items-center space-x-2">
                     <input
                       type="radio"
                       id="early-bird-discount-yes"
                       name="early-bird-discount"
                       value="yes"
                       checked={earlyBirdDiscount === 'yes'}
                       onChange={(e) => setEarlyBirdDiscount(e.target.value)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                     <label htmlFor="early-bird-discount-yes" className="text-sm text-gray-700">
                       Yes
                     </label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <input
                       type="radio"
                       id="early-bird-discount-no"
                       name="early-bird-discount"
                       value="no"
                       checked={earlyBirdDiscount === 'no'}
                       onChange={(e) => setEarlyBirdDiscount(e.target.value)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                     <label htmlFor="early-bird-discount-no" className="text-sm text-gray-700">
                       No
                     </label>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* Financial Aid Section */}
           <div className="space-y-6">
             <h2 className="text-2xl font-semibold text-gray-900 text-center">
               Financial Aid
             </h2>
             
             <div className="space-y-6">
               {/* Education Loan Assistance */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">
                   Education Loan Assistance
                 </label>
                 <div className="flex items-center space-x-4">
                   <div className="flex items-center space-x-2">
                     <input
                       type="radio"
                       id="loan-assistance-yes"
                       name="loan-assistance"
                       value="yes"
                       checked={educationLoanAssistance === 'yes'}
                       onChange={(e) => setEducationLoanAssistance(e.target.value)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                     <label htmlFor="loan-assistance-yes" className="text-sm text-gray-700">
                       Yes
                     </label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <input
                       type="radio"
                       id="loan-assistance-no"
                       name="loan-assistance"
                       value="no"
                       checked={educationLoanAssistance === 'no'}
                       onChange={(e) => setEducationLoanAssistance(e.target.value)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                     <label htmlFor="loan-assistance-no" className="text-sm text-gray-700">
                       No
                     </label>
                   </div>
                 </div>
               </div>

               {/* Installment Facility */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">
                   Installment Facility
                 </label>
                 <div className="flex items-center space-x-4">
                   <div className="flex items-center space-x-2">
                     <input
                       type="radio"
                       id="installment-facility-yes"
                       name="installment-facility"
                       value="yes"
                       checked={installmentFacility === 'yes'}
                       onChange={(e) => setInstallmentFacility(e.target.value)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                     <label htmlFor="installment-facility-yes" className="text-sm text-gray-700">
                       Yes
                     </label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <input
                       type="radio"
                       id="installment-facility-no"
                       name="installment-facility"
                       value="no"
                       checked={installmentFacility === 'no'}
                       onChange={(e) => setInstallmentFacility(e.target.value)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                     <label htmlFor="installment-facility-no" className="text-sm text-gray-700">
                       No
                     </label>
                   </div>
                 </div>
               </div>

               {/* Hardship Support */}
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">
                   Hardship Support
                 </label>
                 <div className="flex items-center space-x-4">
                   <div className="flex items-center space-x-2">
                     <input
                       type="radio"
                       id="hardship-support-yes"
                       name="hardship-support"
                       value="yes"
                       checked={hardshipSupport === 'yes'}
                       onChange={(e) => setHardshipSupport(e.target.value)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                     <label htmlFor="hardship-support-yes" className="text-sm text-gray-700">
                       Yes
                     </label>
                   </div>
                   <div className="flex items-center space-x-2">
                     <input
                       type="radio"
                       id="hardship-support-no"
                       name="hardship-support"
                       value="no"
                       checked={hardshipSupport === 'no'}
                       onChange={(e) => setHardshipSupport(e.target.value)}
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                     />
                     <label htmlFor="hardship-support-no" className="text-sm text-gray-700">
                       No
                     </label>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 }
