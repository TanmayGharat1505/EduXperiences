import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Navigation } from 'lucide-react'

interface LocationPickerProps {
  onLocationSelect: (latitude: number, longitude: number) => void
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect }) => {
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        setLatitude(lat.toFixed(6))
        setLongitude(lng.toFixed(6))
        onLocationSelect(lat, lng)
        setIsGettingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your current location. Please enter coordinates manually.')
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const handleManualSubmit = () => {
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid coordinates')
      return
    }

    if (lat < -90 || lat > 90) {
      alert('Latitude must be between -90 and 90')
      return
    }

    if (lng < -180 || lng > 180) {
      alert('Longitude must be between -180 and 180')
      return
    }

    onLocationSelect(lat, lng)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-gray-500" />
        <Label className="text-sm font-medium">Location Coordinates</Label>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="latitude" className="text-xs">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            placeholder="e.g., 19.0760"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="text-sm"
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="longitude" className="text-xs">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            placeholder="e.g., 72.8777"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="flex-1"
        >
          {isGettingLocation ? (
            'Getting Location...'
          ) : (
            <>
              <Navigation className="h-4 w-4 mr-2" />
              Use Current Location
            </>
          )}
        </Button>
        
        <Button
          type="button"
          size="sm"
          onClick={handleManualSubmit}
          disabled={!latitude || !longitude}
          className="flex-1"
        >
          Set Coordinates
        </Button>
      </div>

      <p className="text-xs text-gray-500">
        Coordinates are optional. You can use your current location or enter manually.
      </p>
    </div>
  )
}
