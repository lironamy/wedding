"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Camera, User, Upload, Check, AlertTriangle, Loader2, Download } from "lucide-react"

export default function GuestPhotosPage() {
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null) // For image preview
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatusMessage, setUploadStatusMessage] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // This state will be used when fetching actual photos later
  const [photosReady, setPhotosReady] = useState(false)
  const [guestPhotos, setGuestPhotos] = useState<string[]>([]) // Mock for now
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])


  const fileInputRef = useRef<HTMLInputElement>(null)
  const params = useParams()
  const token = params?.token as string | undefined

  useEffect(() => {
    if (!token) {
      setUploadStatusMessage("שגיאה: לא זוהה טוקן הזמנה. אנא השתמשו בקישור שקיבלתם בהזמנה.")
    }
  }, [token])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setUploadStatusMessage(null); // Clear previous messages on new file select
    }
  };

  const handleSelfieSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!fileInputRef.current?.files?.length || !fileInputRef.current.files[0]) {
      setUploadStatusMessage("אנא בחרו קובץ תמונה להעלאה.")
      return
    }
    const file = fileInputRef.current.files[0]

    if (!token) {
      setUploadStatusMessage("שגיאה: טוקן הזמנה חסר. אנא השתמשו בקישור המקורי.")
      return
    }

    setIsUploading(true)
    setUploadStatusMessage("מעלה את הסלפי שלך...")
    setUploadSuccess(false)

    const formData = new FormData()
    formData.append("files", file)
    formData.append("token", token)

    try {
      const response = await fetch('/api/photos/upload-selfie', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (response.ok && result.faceDetected) {
        setUploadStatusMessage(result.message || "סלפי הועלה בהצלחה! אנחנו נאבד אותו ונחפש את התמונות שלך.")
        setUploadSuccess(true)
        // Simulate delay then show "photos ready" (replace with actual photo fetching later)
        setTimeout(() => {
          setPhotosReady(true);
          // Mock photo list for UI development
          setGuestPhotos([
            result.selfieUrl, // Show the uploaded selfie as one of the "found" photos for now
            "/placeholder.svg?height=300&width=300",
            "/placeholder.svg?height=300&width=300",
          ]);
        }, 2000);
      } else if (response.ok && !result.faceDetected) {
         setUploadStatusMessage(result.message || "הסלפי הועלה, אך לא הצלחנו לזהות פנים בתמונה. אנא נסו להעלות תמונה ברורה יותר של הפנים שלכם.")
         setUploadSuccess(false)
         setProfileImagePreview(null) // Clear preview if face not detected
      }
      else {
        setUploadStatusMessage(result.message || "העלאת הסלפי נכשלה. אנא נסו שוב.")
        setUploadSuccess(false)
      }
    } catch (error) {
      console.error("Selfie upload error:", error)
      setUploadStatusMessage("אירעה שגיאה במהלך העלאת הסלפי. אנא בדקו את חיבור האינטרנט ונסו שוב.")
      setUploadSuccess(false)
    } finally {
      setIsUploading(false)
      fileInputRef.current.value = ""; // Clear file input
    }
  }

  // --- Mock photo display logic ---
   const togglePhotoSelection = (photo: string) => {
    setSelectedPhotos((prev) => (prev.includes(photo) ? prev.filter((p) => p !== photo) : [...prev, photo]))
  }

  const downloadSelected = () => {
    alert(`מדמה הורדה של ${selectedPhotos.length} תמונות נבחרות...`)
  }
  // --- End mock photo display logic ---


  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 py-8" dir="rtl">
      <header className="container mx-auto px-4 text-center mb-10">
        <Heart className="h-16 w-16 text-pink-500 mx-auto mb-4 animate-pulse" />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">העלאת סלפי וצפייה בתמונות</h1>
        <p className="text-lg text-gray-600">ברוכים הבאים לאזור התמונות האישי שלכם מהחתונה של [שם החתן] ו[שם הכלה]!</p>
      </header>

      <main className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {!photosReady ? (
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-center text-2xl">
                  <User className="h-7 w-7 ml-3 text-pink-500" />
                  שלב 1: העלאת תמונת סלפי
                </CardTitle>
                <CardDescription className="text-center mt-2">
                  כדי שנוכל למצוא את התמונות שלכם מהאירוע, אנא העלו תמונת סלפי ברורה ועדכנית שלכם.
                  הפנים שלכם צריכות להיות גלויות היטב.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSelfieSubmit} className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors">
                    {profileImagePreview ? (
                      <div className="mb-4">
                        <img src={profileImagePreview} alt="תצוגה מקדימה של סלפי" className="w-40 h-40 rounded-full object-cover mx-auto border-4 border-pink-200 shadow-sm" />
                      </div>
                    ) : (
                      <Camera className="h-20 w-20 mx-auto mb-3 text-gray-400" />
                    )}
                    <label htmlFor="selfieInput" className="cursor-pointer text-pink-600 hover:text-pink-700 font-medium">
                      {profileImagePreview ? "בחרו תמונה אחרת" : "בחרו קובץ תמונה"}
                    </label>
                    <input
                      id="selfieInput"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <p className="text-xs text-gray-500 mt-1">תומך ב-JPG, PNG. גודל מקסימלי 5MB.</p>
                  </div>

                  <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white" disabled={isUploading || !profileImagePreview || !token}>
                    {isUploading ? (
                      <><Loader2 className="h-5 w-5 ml-2 animate-spin" />מעלה ומעבד...</>
                    ) : (
                      <><Upload className="h-5 w-5 ml-2" />העלה סלפי ובדוק התאמות</>
                    )}
                  </Button>
                </form>
                {uploadStatusMessage && (
                  <div className={`mt-4 p-3 rounded-md text-sm flex items-center gap-2 ${
                    uploadSuccess ? "bg-green-50 text-green-700" :
                    uploadStatusMessage.includes("שגיאה") || uploadStatusMessage.includes("נכשל") ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                  }`}>
                    {uploadSuccess ? <Check className="h-5 w-5" /> :
                     uploadStatusMessage.includes("שגיאה") || uploadStatusMessage.includes("נכשל") ? <AlertTriangle className="h-5 w-5" /> :
                     <Loader2 className="h-5 w-5 animate-spin"/>
                    }
                    {uploadStatusMessage}
                  </div>
                )}
                <div className="text-xs text-gray-500 space-y-1 text-center mt-4 p-3 bg-gray-50 rounded-md">
                  <p><strong>כיצד זה עובד?</strong></p>
                  <p>1. העלו סלפי ברור שלכם.</p>
                  <p>2. המערכת שלנו תנתח את תווי הפנים שלכם (באופן מאובטח ופרטי).</p>
                  <p>3. לאחר מכן, נסרוק את מאגר תמונות החתונה ונציג לכם את התמונות בהן אתם מופיעים.</p>
                  <p>המידע שלכם נשמר באופן מאובטח ולא ישותף עם גורמים חיצוניים.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            // This part is for displaying photos once "photosReady" is true
            // For now, it's a placeholder based on the mock data.
            // This will be fully reviewed in the next step (Part 3)
            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center text-2xl">
                        <Check className="h-7 w-7 ml-3 text-green-500" />
                        מצאנו תמונות שלך!
                    </CardTitle>
                    <CardDescription className="text-center mt-2">
                        אלו התמונות מהחתונה שבהן זוהית. לחצו על תמונה כדי לבחור אותה להורדה.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {guestPhotos.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                {guestPhotos.map((photo, index) => (
                                <div
                                    key={index}
                                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all aspect-square group ${
                                    selectedPhotos.includes(photo)
                                        ? "ring-4 ring-pink-500 ring-offset-2"
                                        : "hover:ring-2 hover:ring-pink-300"
                                    }`}
                                    onClick={() => togglePhotoSelection(photo)}
                                >
                                    <img
                                    src={photo}
                                    alt={`תמונת חתונה ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    />
                                    {selectedPhotos.includes(photo) && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <Check className="h-10 w-10 text-white" />
                                    </div>
                                    )}
                                     <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-30 text-white p-1 text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        בחר/בטל בחירה
                                    </div>
                                </div>
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button variant="outline" onClick={downloadSelected} disabled={selectedPhotos.length === 0}>
                                    <Download className="h-4 w-4 ml-2" />
                                    הורד נבחרות ({selectedPhotos.length})
                                </Button>
                                {/* Add download all functionality if needed */}
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-gray-600">לא נמצאו תמונות כרגע. נסו לרענן מאוחר יותר.</p>
                    )}
                </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
