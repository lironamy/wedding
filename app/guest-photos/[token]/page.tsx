"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Camera, Download, User, Upload, Check } from "lucide-react"

export default function GuestPhotosPage() {
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [photosReady, setPhotosReady] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock guest photos - in real app these would be filtered by AI
  const guestPhotos = [
    "/placeholder.svg?height=300&width=300",
    "/placeholder.svg?height=300&width=300",
    "/placeholder.svg?height=300&width=300",
    "/placeholder.svg?height=300&width=300",
    "/placeholder.svg?height=300&width=300",
    "/placeholder.svg?height=300&width=300",
  ]

  const handleProfileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
        setIsProcessing(true)

        // Simulate AI processing
        setTimeout(() => {
          setIsProcessing(false)
          setPhotosReady(true)
        }, 3000)
      }
      reader.readAsDataURL(file)
    }
  }

  const togglePhotoSelection = (photo: string) => {
    setSelectedPhotos((prev) => (prev.includes(photo) ? prev.filter((p) => p !== photo) : [...prev, photo]))
  }

  const downloadSelected = () => {
    console.log("Downloading selected photos:", selectedPhotos)
    alert(`מוריד ${selectedPhotos.length} תמונות נבחרות...`)
  }

  const downloadAll = () => {
    console.log("Downloading all photos")
    alert("מוריד את כל התמונות שלכם...")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 text-center">
          <Heart className="h-12 w-12 text-pink-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">התמונות שלכם מהחתונה</h1>
          <p className="text-gray-600">חתונת שרה ויוחנן - 15 באוגוסט 2024</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!profileImage ? (
            /* Profile Upload Step */
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  <User className="h-6 w-6 ml-2" />
                  העלו את תמונת הפרופיל שלכם
                </CardTitle>
                <CardDescription>
                  העלו תמונה ברורה שלכם כדי שהבינה המלאכותית תוכל למצוא את כל התמונות שלכם מהחתונה
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">בחרו תמונה ברורה ועדכנית שבה הפנים שלכם נראות בבירור</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileUpload}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 ml-2" />
                    העלו תמונת פרופיל
                  </Button>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• התמונה שלכם תשמש רק לזיהוי שלכם בתמונות החתונה</p>
                  <p>• אנחנו משתמשים בעיבוד בינה מלאכותית מאובטח ולא שומרים את תמונת הפרופיל שלכם</p>
                  <p>• התהליך בדרך כלל לוקח 1-2 דקות</p>
                </div>
              </CardContent>
            </Card>
          ) : isProcessing ? (
            /* Processing Step */
            <Card className="text-center">
              <CardHeader>
                <CardTitle>מעבד את התמונות שלכם</CardTitle>
                <CardDescription>הבינה המלאכותית שלנו סורקת את כל תמונות החתונה כדי למצוא אתכם...</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <img
                    src={profileImage || "/placeholder.svg"}
                    alt="תמונת הפרופיל שלכם"
                    className="w-32 h-32 rounded-full object-cover border-4 border-pink-200"
                  />
                </div>
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                  <p className="text-gray-600">מנתח תמונות... זה עלול לקחת כמה רגעים.</p>
                </div>
              </CardContent>
            </Card>
          ) : photosReady ? (
            /* Photos Display Step */
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Check className="h-6 w-6 ml-2 text-green-500" />
                      התמונות שלכם מוכנות!
                    </span>
                    <div className="space-x-2 space-x-reverse">
                      <Button variant="outline" onClick={downloadSelected} disabled={selectedPhotos.length === 0}>
                        הורד נבחרות ({selectedPhotos.length})
                      </Button>
                      <Button onClick={downloadAll}>
                        <Download className="h-4 w-4 ml-2" />
                        הורד הכל
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    מצאנו {guestPhotos.length} תמונות שבהן אתם מופיעים! לחצו על תמונות כדי לבחור אותן להורדה.
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guestPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
                      selectedPhotos.includes(photo)
                        ? "ring-4 ring-pink-500 ring-offset-2"
                        : "hover:ring-2 hover:ring-gray-300"
                    }`}
                    onClick={() => togglePhotoSelection(photo)}
                  >
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`תמונת חתונה ${index + 1}`}
                      className="w-full h-64 object-cover"
                    />
                    {selectedPhotos.includes(photo) && (
                      <div className="absolute top-2 left-2 bg-pink-500 text-white rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center text-sm text-gray-500 space-y-1">
                <p>לחצו על תמונות כדי לבחור אותן, ואז השתמשו בכפתורי ההורדה למעלה</p>
                <p>כל התמונות זמינות ברזולוציה גבוהה</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
