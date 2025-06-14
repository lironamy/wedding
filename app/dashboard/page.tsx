"use client"

import { useState, useEffect } from "react" // Added useEffect for potential future data fetching
import Link from "next/link"
import Image from "next/image" // Import next/image
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Calendar, Users, Camera, Settings, LogOut, CheckCircle, AlertTriangle, UserCircle, ImageUp } from "lucide-react" // Added icons
import { ImageUpload } from "@/components/ui/image-upload"; // Import the new component

export default function DashboardPage() {
  // --- Placeholder User State ---
  // In a real app, this would come from an auth context or API call after login.
  // Added faceMatchResult for demonstration.
  const [user, setUser] = useState<any>({ // Using 'any' for simplicity, define a proper type in a real app
    name: "אורח משני", // Example: Secondary User
    email: "secondary@example.com",
    role: "secondary", // Assuming role is available
    isSecondaryUser: true, // Assuming this flag is available
    // Example faceMatchResult - this would be populated after login
    faceMatchResult: {
      matched: true,
      distance: 0.45,
      mainImageUsed: "/uploads/main-images/example-main-image.jpg", // Placeholder path
      bestMatchLabel: "main_user_face_0"
    }
  });

  // Example of how you might fetch user data in a real app
  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     // Replace with your actual API call to get user data
  //     // const response = await fetch('/api/user');
  //     // const data = await response.json();
  //     // setUser(data.user);
  //   };
  //   fetchUserData();
  // }, []);

  const handleLogout = () => {
    // Handle logout
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
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
          <p className="text-gray-600">נהלו את תכנון החתונה וחוויית האורחים שלכם</p>
        </div>

        {/* --- Display Matched Image Section --- */}
        {user && user.isSecondaryUser && user.faceMatchResult && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <Camera className="h-5 w-5 ml-2" />
                זיהוי פנים ותמונות משותפות
              </CardTitle>
              <CardDescription className="text-blue-600">
                הנה התמונה הראשית מהאירוע שבה זוהית.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.faceMatchResult.matched && user.faceMatchResult.mainImageUsed ? (
                <div className="text-center">
                  <p className="text-green-700 font-semibold mb-2 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
                    זוהית בהצלחה בתמונה מהאירוע! (מרחק: {user.faceMatchResult.distance.toFixed(2)})
                  </p>
                  <div className="relative w-full max-w-md mx-auto h-64 md:h-96 border rounded-lg overflow-hidden">
                    <Image
                      src={user.faceMatchResult.mainImageUsed}
                      alt="תמונה ראשית מהאירוע בה זוהית"
                      layout="fill"
                      objectFit="contain" // Or "cover" depending on desired behavior
                      priority // If this is an important image
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    תמונה: {user.faceMatchResult.mainImageUsed.split('/').pop()}
                  </p>
                </div>
              ) : (
                <p className="text-red-700 font-semibold flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 ml-2 text-red-500" />
                  לא זוהתה התאמה בתמונות האירוע או שהתמונה הראשית אינה זמינה.
                  {user.faceMatchResult.error && <span className="ml-1">({user.faceMatchResult.error})</span>}
                </p>
              )}
            </CardContent>
          </Card>
        )}
        {/* --- End Display Matched Image Section --- */}

        <Tabs defaultValue="rsvp" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rsvp">ניהול אישורי הגעה</TabsTrigger>
            <TabsTrigger value="invitation">הזמנה</TabsTrigger>
            <TabsTrigger value="photos">שיתוף תמונות</TabsTrigger>
            <TabsTrigger value="settings">הגדרות</TabsTrigger>
          </TabsList>

          <TabsContent value="rsvp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 ml-2" />
                  תגובות אישור הגעה
                </CardTitle>
                <CardDescription>צפו ונהלו את תגובות האורחים להזמנת החתונה שלכם</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">24</div>
                    <div className="text-sm text-green-600">אישרו הגעה</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">8</div>
                    <div className="text-sm text-yellow-600">ממתינים</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">3</div>
                    <div className="text-sm text-red-600">לא יגיעו</div>
                  </div>
                </div>
                <Link href="/rsvp-responses">
                  <Button>צפו בכל התגובות</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 ml-2" />
                  הזמנת החתונה
                </CardTitle>
                <CardDescription>צרו או העלו את הזמנת החתונה שלכם</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/create-invitation">
                    <Button className="w-full h-24 flex flex-col">
                      <Calendar className="h-8 w-8 mb-2" />
                      צרו הזמנה חדשה
                    </Button>
                  </Link>
                  <Link href="/upload-invitation">
                    <Button variant="outline" className="w-full h-24 flex flex-col">
                      <Calendar className="h-8 w-8 mb-2" />
                      העלו עיצוב קיים
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 ml-2" />
                  שיתוף תמונות
                </CardTitle>
                <CardDescription>העלו ושתפו תמונות חתונה עם זיהוי אורחים חכם. תמונות אלו ישמשו לזיהוי פנים.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main User Image Upload Section */}
                {!user?.isSecondaryUser && ( // Show if NOT a secondary user (i.e., a main user)
                  <div className="p-6 border rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <ImageUp className="h-5 w-5 mr-2 text-pink-500" />
                      העלאת תמונה ראשית (שלכם)
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      העלו תמונה ברורה שלכם. תמונה זו תשמש כבסיס לזיהוי פנים שלכם בתמונות האורחים.
                    </p>
                    <ImageUpload
                      uploadUrl="/api/upload-main-image"
                      onUploadSuccess={(response) => {
                        console.log("Main image uploaded:", response.filePath);
                        // Potentially update user state or show preview
                        setUser((prevUser: any) => ({
                          ...prevUser,
                          mainImagePath: response.filePath, // Assuming you store this
                        }));
                      }}
                      onUploadError={(error) => console.error("Main image upload error:", error)}
                      buttonText="העלה תמונה ראשית"
                    />
                    {user?.mainImagePath && (
                       <div className="mt-4">
                         <p className="text-sm font-medium text-gray-700">תמונה ראשית נוכחית:</p>
                         <Image src={user.mainImagePath} alt="Main user image" width={100} height={100} className="rounded border mt-1" />
                       </div>
                    )}
                  </div>
                )}

                {/* Secondary User Image Upload Section */}
                {user?.isSecondaryUser && ( // Show only if a secondary user
                  <div className="p-6 border rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <UserCircle className="h-5 w-5 mr-2 text-blue-500" />
                      העלאת תמונת פרופיל (לזיהוי)
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      העלו תמונה ברורה של הפנים שלכם. תמונה זו תעזור לנו למצוא אתכם בתמונות האירוע.
                    </p>
                    <ImageUpload
                      uploadUrl="/api/upload-secondary-image"
                      onUploadSuccess={(response) => {
                        console.log("Secondary image uploaded:", response.filePath);
                        // Potentially update user state or show preview
                         setUser((prevUser: any) => ({
                          ...prevUser,
                          secondaryImagePath: response.filePath, // Assuming you store this
                          faceMatchResult: { // Reset or update face match result as new image is uploaded
                            ...prevUser.faceMatchResult,
                            matched: false, // Needs re-evaluation
                            error: "New image uploaded, please re-login to attempt face match."
                          }
                        }));
                      }}
                      onUploadError={(error) => console.error("Secondary image upload error:", error)}
                      buttonText="העלה תמונת פרופיל"
                    />
                     {user?.secondaryImagePath && (
                       <div className="mt-4">
                         <p className="text-sm font-medium text-gray-700">תמונת פרופיל נוכחית:</p>
                         <Image src={user.secondaryImagePath} alt="Secondary user image" width={100} height={100} className="rounded border mt-1" />
                       </div>
                    )}
                  </div>
                )}

                <div className="mt-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
                  <p className="font-semibold mb-1">כיצד פועל זיהוי הפנים:</p>
                  <p>• <strong>משתמשים ראשיים:</strong> העלו תמונה ברורה שלכם. המערכת תשתמש בתמונה זו כדי לזהות אתכם בתמונות שיעלו האורחים.</p>
                  <p>• <strong>אורחים (משתמשים משניים):</strong> העלו תמונת פרופיל ברורה. לאחר מכן, בעת התחברות, המערכת תנסה להתאים את פניכם לתמונות מהאירוע שהועלו על ידי המשתמשים הראשיים.</p>
                  <p>• האורחים יקבלו התראות כשהתמונות שלהם מוכנות ויוכלו לראות את התמונה הראשית שבה זוהו.</p>
                  <p>• כל אורח יקבל גישה רק לתמונות שלו</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 ml-2" />
                  הגדרות החתונה
                </CardTitle>
                <CardDescription>נהלו את פרטי החתונה וההעדפות שלכם</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  ערכו פרטי חתונה
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  נהלו רשימת אורחים
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  הגדרות התראות
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  הגדרות פרטיות
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
