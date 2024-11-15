import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { SearchIcon } from 'lucide-react'

export default function CarList() {
  const [cars, setCars] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cars`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCars(data)
      } else {
        console.error('Failed to fetch cars')
        
      }
    } catch (error) {
      console.error('Error fetching cars:', error)
      
    }
  }

  const filteredCars = useMemo(() => {
    return cars.filter(car => 
      car.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [cars, searchTerm])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cars</h1>
      
      <div className="mb-4 relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search cars by title or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {filteredCars.length === 0 && (
        <p className="text-center text-gray-500 my-4">No cars found matching your search.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCars.map((car) => (
          <Card key={car._id}>
            <CardHeader>
              <CardTitle>{car.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <img 
                src={car.images[0]?.url || '/placeholder.png'} 
                alt={car.title} 
                className="w-full h-48 object-cover mb-2 rounded-md"
              />
              <p className="text-gray-600 mb-2">{car.description.substring(0, 100)}...</p>
              <div className="flex flex-wrap gap-2">
                {car.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to={`/cars/${car._id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}