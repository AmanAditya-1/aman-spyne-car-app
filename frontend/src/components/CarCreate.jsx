import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Upload, X } from 'lucide-react'

export default function CarCreate() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    images: []
  })
  const [previewImages, setPreviewImages] = useState([])
  const navigate = useNavigate()

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + formData.images.length > 10) {
      console.log("too many images")
      return
    }
    setFormData({ ...formData, images: [...formData.images, ...files] })
    setPreviewImages([...previewImages, ...files.map(file => URL.createObjectURL(file))])
  }

  const removeImage = (index) => {
    const newImages = [...formData.images]
    newImages.splice(index, 1)
    setFormData({ ...formData, images: newImages })

    const newPreviews = [...previewImages]
    URL.revokeObjectURL(newPreviews[index])
    newPreviews.splice(index, 1)
    setPreviewImages(newPreviews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = new FormData()
    form.append('title', formData.title)
    form.append('description', formData.description)
    form.append('tags', formData.tags)
    formData.images.forEach((image, index) => {
      form.append(`images`, image)
    })

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/cars`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: form
      })
      if (response.ok) {
        
        navigate('/cars')
      } else {
        const data = await response.json()
        console.error('Failed to create car:', data);
      }
    } catch (error) {
      console.error('Error creating car:', error)

    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Add New Car</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="car_type, company, dealer"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="images">Images (up to 10)</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Label htmlFor="images" className="cursor-pointer">
                <div className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md">
                  <Upload className="h-4 w-4" />
                  <span>Upload Images</span>
                </div>
              </Label>
              <span className="text-sm text-gray-500">
                {10 - formData.images.length} images remaining
              </span>
            </div>
            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full">Create Car</Button>
        </form>
      </CardContent>
    </Card>
  )
}