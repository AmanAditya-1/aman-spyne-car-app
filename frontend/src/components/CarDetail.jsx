import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { ScrollArea } from "./ui/scroll-area"
import { ChevronLeft, ChevronRight, X, Edit, Trash2, Upload } from 'lucide-react'

export default function CarDetail() {
  const [car, setCar] = useState(null)
  const [editedCar, setEditedCar] = useState(null)
  const [newImages, setNewImages] = useState([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  useEffect(() => {
    fetchCar()
  }, [id])

  const fetchCar = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cars/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCar(data)
        setEditedCar(data)
      } else {
        console.error('Failed to fetch car details')
      }
    } catch (error) {
      console.error('Error fetching car details:', error)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('title', editedCar.title)
      formData.append('description', editedCar.description)
      formData.append('tags', editedCar.tags.join(','))
      formData.append('existingImages', JSON.stringify(editedCar.images))
      
      newImages.forEach((image, index) => {
        formData.append(`newImages`, image)
      })

      const response = await fetch(`${process.env.REACT_APP_API_URL}/cars/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })
      if (response.ok) {
        const updatedCar = await response.json()
        setCar(updatedCar)
        setEditedCar(updatedCar)
        setNewImages([])
        setIsEditDialogOpen(false)
        
      } else {
        console.error('Failed to update car')
        
      }
    } catch (error) {
      console.error('Error updating car:', error)
      
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cars/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        navigate('/cars')
        
      } else {
        console.error('Failed to delete car')
        
      }
    } catch (error) {
      console.error('Error deleting car:', error)
      
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (editedCar.images.length + newImages.length + files.length > 10) {
      console.log("too many images")
      return
    }
    setNewImages([...newImages, ...files])
  }

  const removeExistingImage = (index) => {
    setEditedCar({
      ...editedCar,
      images: editedCar.images.filter((_, i) => i !== index)
    })
  }

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index))
  }

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  if (!car) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader className="relative">
        <div className="embla overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex">
            {car.images.map((image, index) => (
              <div key={index} className="embla__slide flex-[0_0_100%] min-w-0">
                <img
                  src={image.url}
                  alt={`${car.title} - Image ${index + 1}`}
                  className="w-full h-[400px] object-cover rounded-t-lg"
                />
              </div>
            ))}
          </div>
        </div>
        {car.images.length > 1 && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        )}
        {car.images.length > 1 && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
          onClick={scrollNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        )}
        <CardTitle className="text-3xl font-bold mt-4">{car.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Description</h3>
          <p className="text-gray-700">{car.description}</p>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {car.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Edit Car
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px] bg-slate-100">
            <DialogHeader>
              <DialogTitle>Edit Car</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editedCar.title}
                      onChange={(e) => setEditedCar({ ...editedCar, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editedCar.description}
                      onChange={(e) => setEditedCar({ ...editedCar, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={editedCar.tags.join(',')}
                      onChange={(e) => setEditedCar({ ...editedCar, tags: e.target.value.split(',') })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Images</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {editedCar.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.url}
                            alt={`Current Image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1"
                            onClick={() => removeExistingImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newImages">Add New Images</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="newImages"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Label htmlFor="newImages" className="cursor-pointer">
                        <div className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md">
                          <Upload className="h-4 w-4" />
                          <span>Upload Images</span>
                        </div>
                      </Label>
                      <span className="text-sm text-gray-500">
                        {10 - (editedCar.images.length + newImages.length)} images remaining
                      </span>
                    </div>
                    {newImages.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {newImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`New Image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1"
                              onClick={() => removeNewImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex items-center">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Car
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-slate-100">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your car
                and remove all associated data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}