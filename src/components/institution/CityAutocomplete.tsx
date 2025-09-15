import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CityAutocompleteProps {
  value: string
  onChange: (city: string, state: string) => void
  className?: string
}

interface CityData {
  city: string
  state: string
}

const indianCities: CityData[] = [
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Bangalore', state: 'Karnataka' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Surat', state: 'Gujarat' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Kanpur', state: 'Uttar Pradesh' },
  { city: 'Nagpur', state: 'Maharashtra' },
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Thane', state: 'Maharashtra' },
  { city: 'Bhopal', state: 'Madhya Pradesh' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { city: 'Pimpri-Chinchwad', state: 'Maharashtra' },
  { city: 'Patna', state: 'Bihar' },
  { city: 'Vadodara', state: 'Gujarat' },
  { city: 'Ghaziabad', state: 'Uttar Pradesh' },
  { city: 'Ludhiana', state: 'Punjab' },
  { city: 'Agra', state: 'Uttar Pradesh' },
  { city: 'Nashik', state: 'Maharashtra' },
  { city: 'Faridabad', state: 'Haryana' },
  { city: 'Meerut', state: 'Uttar Pradesh' },
  { city: 'Rajkot', state: 'Gujarat' },
  { city: 'Kalyan-Dombivali', state: 'Maharashtra' },
  { city: 'Vasai-Virar', state: 'Maharashtra' },
  { city: 'Varanasi', state: 'Uttar Pradesh' },
  { city: 'Srinagar', state: 'Jammu and Kashmir' },
  { city: 'Aurangabad', state: 'Maharashtra' },
  { city: 'Navi Mumbai', state: 'Maharashtra' },
  { city: 'Solapur', state: 'Maharashtra' },
  { city: 'Ranchi', state: 'Jharkhand' },
  { city: 'Chandigarh', state: 'Chandigarh' },
  { city: 'Coimbatore', state: 'Tamil Nadu' },
  { city: 'Jabalpur', state: 'Madhya Pradesh' },
  { city: 'Gwalior', state: 'Madhya Pradesh' },
  { city: 'Vijayawada', state: 'Andhra Pradesh' },
  { city: 'Jodhpur', state: 'Rajasthan' },
  { city: 'Madurai', state: 'Tamil Nadu' },
  { city: 'Raipur', state: 'Chhattisgarh' },
  { city: 'Kota', state: 'Rajasthan' },
  { city: 'Guwahati', state: 'Assam' },
  { city: 'Chandrapur', state: 'Maharashtra' },
  { city: 'Amritsar', state: 'Punjab' },
  { city: 'Kolhapur', state: 'Maharashtra' },
  { city: 'Ajmer', state: 'Rajasthan' },
  { city: 'Loni', state: 'Uttar Pradesh' },
  { city: 'Siliguri', state: 'West Bengal' },
  { city: 'Jhansi', state: 'Uttar Pradesh' },
  { city: 'Ulhasnagar', state: 'Maharashtra' },
  { city: 'Jammu', state: 'Jammu and Kashmir' },
  { city: 'Sangli-Miraj & Kupwad', state: 'Maharashtra' },
  { city: 'Mangalore', state: 'Karnataka' },
  { city: 'Erode', state: 'Tamil Nadu' },
  { city: 'Belgaum', state: 'Karnataka' },
  { city: 'Ambattur', state: 'Tamil Nadu' },
  { city: 'Tirunelveli', state: 'Tamil Nadu' },
  { city: 'Malegaon', state: 'Maharashtra' },
  { city: 'Gaya', state: 'Bihar' },
  { city: 'Jalgaon', state: 'Maharashtra' },
  { city: 'Udaipur', state: 'Rajasthan' },
  { city: 'Maheshtala', state: 'West Bengal' },
  { city: 'Tirupur', state: 'Tamil Nadu' },
  { city: 'Davanagere', state: 'Karnataka' },
  { city: 'Kozhikode', state: 'Kerala' },
  { city: 'Akola', state: 'Maharashtra' },
  { city: 'Kurnool', state: 'Andhra Pradesh' },
  { city: 'Rajpur Sonarpur', state: 'West Bengal' },
  { city: 'Bokaro Steel City', state: 'Jharkhand' },
  { city: 'South Dumdum', state: 'West Bengal' },
  { city: 'Bellary', state: 'Karnataka' },
  { city: 'Patiala', state: 'Punjab' },
  { city: 'Gopalpur', state: 'West Bengal' },
  { city: 'Agartala', state: 'Tripura' },
  { city: 'Bhagalpur', state: 'Bihar' },
  { city: 'Muzaffarnagar', state: 'Uttar Pradesh' },
  { city: 'Bhatpara', state: 'West Bengal' },
  { city: 'Panihati', state: 'West Bengal' },
  { city: 'Latur', state: 'Maharashtra' },
  { city: 'Dhule', state: 'Maharashtra' },
  { city: 'Rohtak', state: 'Haryana' },
  { city: 'Korba', state: 'Chhattisgarh' },
  { city: 'Bhilwara', state: 'Rajasthan' },
  { city: 'Brahmapur', state: 'Odisha' },
  { city: 'Muzaffarpur', state: 'Bihar' },
  { city: 'Ahmednagar', state: 'Maharashtra' },
  { city: 'Mathura', state: 'Uttar Pradesh' },
  { city: 'Kollam', state: 'Kerala' },
  { city: 'Avadi', state: 'Tamil Nadu' },
  { city: 'Kadapa', state: 'Andhra Pradesh' },
  { city: 'Anantapur', state: 'Andhra Pradesh' },
  { city: 'Tiruchengode', state: 'Tamil Nadu' },
  { city: 'Bharatpur', state: 'Rajasthan' },
  { city: 'Bijapur', state: 'Karnataka' },
  { city: 'Rampur', state: 'Uttar Pradesh' },
  { city: 'Shivamogga', state: 'Karnataka' },
  { city: 'Thrissur', state: 'Kerala' },
  { city: 'Alwar', state: 'Rajasthan' },
  { city: 'Vellore', state: 'Tamil Nadu' },
  { city: 'Karnal', state: 'Haryana' },
  { city: 'Kottayam', state: 'Kerala' },
  { city: 'Hapur', state: 'Uttar Pradesh' },
  { city: 'Ujjain', state: 'Madhya Pradesh' },
  { city: 'Bhiwandi', state: 'Maharashtra' },
  { city: 'Shahjahanpur', state: 'Uttar Pradesh' },
  { city: 'Guntur', state: 'Andhra Pradesh' },
  { city: 'Amroha', state: 'Uttar Pradesh' },
  { city: 'Eluru', state: 'Andhra Pradesh' },
  { city: 'Raurkela', state: 'Odisha' },
  { city: 'Jhunjhunu', state: 'Rajasthan' },
  { city: 'Bhiwani', state: 'Haryana' },
  { city: 'Rewa', state: 'Madhya Pradesh' },
  { city: 'Gangtok', state: 'Sikkim' },
  { city: 'Shillong', state: 'Meghalaya' },
  { city: 'Aizawl', state: 'Mizoram' },
  { city: 'Kohima', state: 'Nagaland' },
  { city: 'Imphal', state: 'Manipur' },
  { city: 'Itanagar', state: 'Arunachal Pradesh' },
  { city: 'Dispur', state: 'Assam' },
  { city: 'Panaji', state: 'Goa' },
  { city: 'Port Blair', state: 'Andaman and Nicobar Islands' },
  { city: 'Kavaratti', state: 'Lakshadweep' },
  { city: 'Daman', state: 'Dadra and Nagar Haveli and Daman and Diu' },
  { city: 'Silvassa', state: 'Dadra and Nagar Haveli and Daman and Diu' },
  { city: 'Chandigarh', state: 'Chandigarh' },
  { city: 'New Delhi', state: 'Delhi' },
  { city: 'Puducherry', state: 'Puducherry' }
]

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onChange,
  className
}) => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [filteredCities, setFilteredCities] = useState<CityData[]>([])
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (value) {
      const city = indianCities.find(c => c.city === value)
      if (city) {
        setSelectedCity(city)
        setInputValue(city.city)
      }
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setInputValue(input)
    
    if (input.length > 0) {
      const filtered = indianCities.filter(city =>
        city.city.toLowerCase().includes(input.toLowerCase()) ||
        city.state.toLowerCase().includes(input.toLowerCase())
      )
      setFilteredCities(filtered.slice(0, 10))
      setOpen(true)
    } else {
      setFilteredCities([])
      setOpen(false)
    }
  }

  const handleCitySelect = (city: CityData) => {
    setSelectedCity(city)
    setInputValue(city.city)
    setOpen(false)
    onChange(city.city, city.state)
  }

  const handleInputFocus = () => {
    if (inputValue.length > 0) {
      setOpen(true)
    }
  }

  const handleInputBlur = () => {
    // Delay closing to allow click on dropdown items
    setTimeout(() => setOpen(false), 200)
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder="Search for a city..."
        className={cn("pr-10", className)}
      />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        onClick={() => setOpen(!open)}
      >
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </Button>

      {open && filteredCities.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredCities.map((city, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
              onClick={() => handleCitySelect(city)}
            >
              <div className="flex-1">
                <div className="font-medium">{city.city}</div>
                <div className="text-gray-500 text-xs">{city.state}</div>
              </div>
              {selectedCity?.city === city.city && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
