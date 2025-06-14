"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Calendar, Users, Camera, Settings, LogOut } from "lucide-react"

export default function DashboardPage() {
  const [user] = useState({ name: "שרה ויוחנן", email: "sarah@example.com" })

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
                <CardDescription>העלו ושתפו תמונות חתונה עם זיהוי אורחים חכם</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">העלו את תמונות החתונה שלכם כאן</p>
                  <Button>העלו תמונות</Button>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• הבינה המלאכותית תזהה אוטומטית אורחים בתמונות</p>
                  <p>• האורחים יקבלו התראות כשהתמונות שלהם מוכנות</p>
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
