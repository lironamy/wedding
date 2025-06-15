"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Calendar, Users, Camera, Settings, LogOut, Upload, Loader2, Mail, ListPlus, Send, Zap } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  // State for wedding photo uploader
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])

  // State for contact management
  const [contactsJson, setContactsJson] = useState<string>('[\n  {\n    "name": "Yossi Cohen",\n    "phoneNumber": "+972501234567"\n  },\n  {\n    "name": "Sara Levi",\n    "phoneNumber": "+972529876543"\n  }\n]')
  const [contactUploadMessage, setContactUploadMessage] = useState<string | null>(null)
  const [isUploadingContacts, setIsUploadingContacts] = useState(false)
  const [invitationSendMessage, setInvitationSendMessage] = useState<string | null>(null)
  const [isSendingInvitations, setIsSendingInvitations] = useState(false)

  // State for batch photo notifications
  const [photoNotificationMessage, setPhotoNotificationMessage] = useState<string | null>(null)
  const [isSendingPhotoNotifications, setIsSendingPhotoNotifications] = useState(false)

  // State for triggering wedding photo processing
  const [processingPhotosMessage, setProcessingPhotosMessage] = useState<string | null>(null)
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  const handleLogout = () => {
    logout()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files)
    setUploadMessage(null)
    setUploadedImageUrls([])
  }

  const handleSubmitWeddingPhotos = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedFiles || selectedFiles.length === 0) {
      setUploadMessage("אנא בחרו קבצים להעלאה.")
      return
    }

    setUploading(true)
    setUploadMessage(`מעלה ${selectedFiles.length} קבצים...`)
    const formData = new FormData()
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i])
    }

    try {
      const response = await fetch('/api/photos/upload-wedding-photos', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      if (response.ok) {
        setUploadMessage(result.message || `${selectedFiles.length} קבצים הועלו בהצלחה!`)
        if (result.photos && Array.isArray(result.photos)) {
          setUploadedImageUrls(result.photos.map((p: any) => p.imageUrl))
        }
      } else {
        setUploadMessage(result.message || "העלאת הקבצים נכשלה.")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadMessage("אירעה שגיאה במהלך ההעלאה.")
    } finally {
      setUploading(false)
      // Do not clear selectedFiles here so user can see what they selected if there was an error
    }
  }

  const handleContactsJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContactsJson(event.target.value)
    setContactUploadMessage(null)
  }

  const handleUploadContacts = async () => {
    setIsUploadingContacts(true)
    setContactUploadMessage("מעלה רשימת אנשי קשר...")
    try {
      const contacts = JSON.parse(contactsJson)
      const response = await fetch('/api/contacts/upload-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contacts),
      })
      const result = await response.json()
      setContactUploadMessage(result.message || (response.ok ? "רשימת אנשי הקשר הועלתה בהצלחה." : "העלאת רשימת אנשי הקשר נכשלה."))
    } catch (error) {
      console.error("Contact upload error:", error)
      setContactUploadMessage("שגיאה בעיבוד ה-JSON או בהעלאת אנשי הקשר. אנא בדקו את הפורמט ונסו שוב.")
    } finally {
      setIsUploadingContacts(false)
    }
  }

  const handleSendInvitations = async () => {
    setIsSendingInvitations(true)
    setInvitationSendMessage("שולח הזמנות ראשוניות בוואטסאפ...")
    try {
      const response = await fetch('/api/contacts/send-invitations', {
        method: 'POST',
      })
      const result = await response.json()
      setInvitationSendMessage(result.message || (response.ok ? "תהליך שליחת ההזמנות החל." : "כישלון בתחילת תהליך שליחת ההזמנות."))
    } catch (error) {
      console.error("Send invitations error:", error)
      setInvitationSendMessage("אירעה שגיאה בניסיון לשלוח הזמנות.")
    } finally {
      setIsSendingInvitations(false)
    }
  }

  const handleNotifyGuestsForNewPhotos = async () => {
    setIsSendingPhotoNotifications(true);
    setPhotoNotificationMessage("שולח התראות על תמונות חדשות שזוהו...");
    try {
      const response = await fetch('/api/notifications/notify-guests-with-new-photos', {
        method: 'POST',
      });
      const result = await response.json();
      setPhotoNotificationMessage(result.message || (response.ok ? "תהליך שליחת ההתראות על תמונות חדשות הושלם." : "כישלון בשליחת התראות על תמונות חדשות."));
    } catch (error) {
      console.error("Photo match notification error:", error);
      setPhotoNotificationMessage("אירעה שגיאה במהלך שליחת התראות על תמונות חדשות.");
    } finally {
      setIsSendingPhotoNotifications(false);
    }
  };

  const handleProcessWeddingPhotos = async () => {
    setIsProcessingPhotos(true);
    setProcessingPhotosMessage("מתחיל עיבוד תמונות חתונה וזיהוי פנים... זה עשוי לקחת זמן מה.");
    try {
      const response = await fetch('/api/photos/process-wedding-photos', {
        method: 'POST',
      });
      const result = await response.json();
      setProcessingPhotosMessage(result.message || (response.ok ? "עיבוד תמונות החתונה החל בהצלחה." : "כישלון בתחילת עיבוד תמונות החתונה."));
    } catch (error) {
      console.error("Wedding photo processing error:", error);
      setProcessingPhotosMessage("אירעה שגיאה בניסיון לעבד את תמונות החתונה.");
    } finally {
      setIsProcessingPhotos(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Heart className="h-8 w-8 text-pink-500" />
            <span className="text-2xl font-bold text-gray-800">חתונה שלי</span>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <span className="text-gray-600">שלום, {user.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 ml-2" />
              התנתקות
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">לוח הבקרה של החתונה</h1>
          <p className="text-gray-600">נהלו את תכנון החתונה וחוויית האורחים שלכם.</p>
        </div>

        <Tabs defaultValue="photos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 text-xs sm:text-sm">
            <TabsTrigger value="rsvp">אישורי הגעה</TabsTrigger>
            <TabsTrigger value="invitation">הזמנה</TabsTrigger>
            <TabsTrigger value="photos">העלאת תמונות חתונה</TabsTrigger>
            <TabsTrigger value="processing">עיבוד תמונות חתונה</TabsTrigger>
            <TabsTrigger value="contacts">אנשי קשר והזמנות</TabsTrigger>
            <TabsTrigger value="settings">הגדרות</TabsTrigger>
          </TabsList>

          <TabsContent value="rsvp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Users className="h-5 w-5 ml-2" />תגובות אישור הגעה</CardTitle>
                <CardDescription>צפו ונהלו את תגובות האורחים להזמנת החתונה שלכם.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder for RSVP content */}
                <p>בקרוב...</p>
                <Link href="/rsvp-responses"><Button variant="link">צפו בכל התגובות (דמו)</Button></Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Calendar className="h-5 w-5 ml-2" />הזמנת החתונה</CardTitle>
                <CardDescription>צרו או העלו את הזמנת החתונה שלכם.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 {/* Placeholder for Invitation content */}
                <p>בקרוב...</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/create-invitation"><Button className="w-full h-24 flex flex-col"><Calendar className="h-8 w-8 mb-2" />צרו הזמנה חדשה (דמו)</Button></Link>
                  <Link href="/upload-invitation"><Button variant="outline" className="w-full h-24 flex flex-col"><Calendar className="h-8 w-8 mb-2" />העלו עיצוב קיים (דמו)</Button></Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Camera className="h-5 w-5 ml-2" />העלאת תמונות חתונה</CardTitle>
                <CardDescription>
                    העלו כאן את כל תמונות החתונה שלכם. המערכת תנסה לזהות אורחים בתמונות לאחר שתפעילו את תהליך העיבוד בלשונית "עיבוד תמונות חתונה".
                    <br />
                    טיפ: העלו תמונות באיכות טובה. ניתן להעלות מספר קבצים בו זמנית.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <form onSubmit={handleSubmitWeddingPhotos} className="space-y-3 text-center">
                    <label htmlFor="weddingPhotoInput" className="block text-sm font-medium text-gray-700 mb-2">
                      בחרו קבצי תמונות (ניתן לבחור מספר קבצים):
                    </label>
                    <input
                      id="weddingPhotoInput" type="file" multiple onChange={handleFileChange}
                      className="block w-full max-w-md mx-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                      disabled={uploading}
                    />
                    <Button type="submit" disabled={uploading || !selectedFiles || selectedFiles.length === 0} className="mt-4">
                      {uploading ? (
                        <><Loader2 className="h-4 w-4 ml-2 animate-spin" />מעלה ({selectedFiles?.length || 0} קבצים)...</>
                      ) : (
                        <><Upload className="h-4 w-4 ml-2" />העלה {selectedFiles?.length ? `${selectedFiles.length} קבצים נבחרים` : 'קבצים נבחרים'}</>
                      )}
                    </Button>
                  </form>
                  {uploadMessage && (
                    <p className={`mt-3 text-sm font-medium ${uploadMessage.includes("נכשלה") || uploadMessage.includes("שגיאה") ? "text-red-600" : "text-green-600"}`}>
                      {uploadMessage}
                    </p>
                  )}
                </div>
                {uploadedImageUrls.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">תצוגה מקדימה של תמונות שהועלו בבאצ' האחרון:</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {uploadedImageUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden shadow">
                          <img src={url} alt={`Uploaded wedding photo preview ${index + 1}`} className="object-cover w-full h-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                 <div className="mt-4 text-sm text-gray-600">
                  <p>לאחר העלאת התמונות, יש להפעיל את תהליך עיבוד התמונות בלשונית "עיבוד תמונות חתונה" כדי לזהות אורחים.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Zap className="h-5 w-5 ml-2" />עיבוד תמונות חתונה וזיהוי פנים</CardTitle>
                <CardDescription>
                  הפעילו את תהליך זיהוי הפנים בתמונות החתונה שהעליתם. תהליך זה סורק את התמונות ומנסה להתאים אותן לאורחים שהעלו סלפי.
                  <br />
                  זה יכול לקחת זמן מה, תלוי במספר התמונות. ניתן לסגור חלון זה והתהליך ימשיך ברקע (מומלץ להשאיר פתוח אם יש הרבה תמונות).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleProcessWeddingPhotos} disabled={isProcessingPhotos || uploading}>
                  {isProcessingPhotos ? (
                    <><Loader2 className="h-4 w-4 ml-2 animate-spin" />מעבד תמונות...</>
                  ) : (
                    <><Zap className="h-4 w-4 ml-2" />התחל עיבוד תמונות חתונה</>
                  )}
                </Button>
                {processingPhotosMessage && (
                  <p className={`mt-3 text-sm font-medium ${processingPhotosMessage.includes("נכשל") || processingPhotosMessage.includes("שגיאה") ? "text-red-600" : "text-green-600"}`}>
                    {processingPhotosMessage}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><ListPlus className="h-5 w-5 ml-2" />ניהול רשימת אנשי קשר והזמנות</CardTitle>
                <CardDescription>
                  הדביקו רשימת אנשי קשר בפורמט JSON. כל איש קשר צריך להכיל "name" (שם) ו-"phoneNumber" (מספר טלפון בפורמט בינלאומי, לדוגמה +972501234567).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={contactsJson}
                  onChange={handleContactsJsonChange}
                  rows={8}
                  className="w-full p-2 border rounded-md text-sm font-mono bg-gray-50 LTR-direction"
                  placeholder='[
  {
    "name": "Yossi Cohen",
    "phoneNumber": "+972501234567"
  },
  {
    "name": "Sara Levi",
    "phoneNumber": "+972529876543"
  }
]'
                  disabled={isUploadingContacts || isSendingInvitations || isSendingPhotoNotifications || isProcessingPhotos}
                  dir="ltr"
                />
                <Button onClick={handleUploadContacts} disabled={isUploadingContacts || isSendingInvitations || isSendingPhotoNotifications || isProcessingPhotos}>
                  {isUploadingContacts ? (
                    <><Loader2 className="h-4 w-4 ml-2 animate-spin" />מעלה אנשי קשר...</>
                  ) : (
                    <><Upload className="h-4 w-4 ml-2" />העלה רשימת אנשי קשר</>
                  )}
                </Button>
                {contactUploadMessage && (
                  <p className={`text-sm font-medium ${contactUploadMessage.includes("נכשלה") || contactUploadMessage.includes("שגיאה") ? "text-red-600" : "text-green-600"}`}>
                    {contactUploadMessage}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Send className="h-5 w-5 ml-2" />שליחת הודעות וואטסאפ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                   <h4 className="font-semibold mb-1 text-md">הזמנות ראשוניות (להעלאת סלפי)</h4>
                   <p className="text-xs text-gray-500 mb-2">שלחו הודעה לאנשי קשר שנוספו וטרם קיבלו הזמנה להעלות סלפי.</p>
                  <Button onClick={handleSendInvitations} disabled={isSendingInvitations || isUploadingContacts || isSendingPhotoNotifications || isProcessingPhotos}>
                    {isSendingInvitations ? (
                      <><Loader2 className="h-4 w-4 ml-2 animate-spin" />שולח הזמנות לסלפי...</>
                    ) : (
                      <><Mail className="h-4 w-4 ml-2" />שלח הזמנות להעלאת סלפי</>
                    )}
                  </Button>
                  {invitationSendMessage && (
                    <p className={`mt-2 text-sm font-medium ${invitationSendMessage.includes("נכשל") || invitationSendMessage.includes("שגיאה") ? "text-red-600" : "text-green-600"}`}>
                      {invitationSendMessage}
                    </p>
                  )}
                </div>
                <hr />
                <div>
                   <h4 className="font-semibold mb-1 text-md">התראות על תמונות חדשות שזוהו</h4>
                   <p className="text-xs text-gray-500 mb-2">לאחר עיבוד תמונות החתונה, שלחו הודעה לאורחים שנמצאו בתמונות חדשות וטרם קיבלו על כך התראה.</p>
                  <Button onClick={handleNotifyGuestsForNewPhotos} disabled={isSendingPhotoNotifications || isUploadingContacts || isSendingInvitations || isProcessingPhotos}>
                    {isSendingPhotoNotifications ? (
                      <><Loader2 className="h-4 w-4 ml-2 animate-spin" />שולח התראות על תמונות...</>
                    ) : (
                      <><Send className="h-4 w-4 ml-2" />שלח התראות על תמונות חדשות</>
                    )}
                  </Button>
                  {photoNotificationMessage && (
                    <p className={`mt-2 text-sm font-medium ${photoNotificationMessage.includes("נכשל") || photoNotificationMessage.includes("שגיאה") ? "text-red-600" : "text-green-600"}`}>
                      {photoNotificationMessage}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Settings className="h-5 w-5 ml-2" />הגדרות החתונה</CardTitle>
                <CardDescription>נהלו את פרטי החתונה וההעדפות שלכם.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 {/* Placeholder for Settings content */}
                <p>בקרוב...</p>
                <Button variant="outline" className="w-full justify-start">ערכו פרטי חתונה (דמו)</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
