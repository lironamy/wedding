"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Heart, Mail, Lock } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email/password login
    console.log("Login:", { email, password })
    // Redirect to dashboard after successful login
    window.location.href = "/dashboard"
  }

  const handleGoogleLogin = () => {
    // Handle Google OAuth login
    console.log("Google login")
    window.location.href = "/dashboard"
  }

  const handleFacebookLogin = () => {
    // Handle Facebook OAuth login
    console.log("Facebook login")
    window.location.href = "/dashboard"
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-pink-500" />
          </div>
          <CardTitle className="text-2xl">ברוכים השבים</CardTitle>
          <CardDescription>התחברו לחשבון החתונה שלכם</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="הזינו את הסיסמה שלכם"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              התחברות
            </Button>
          </form>

          <Separator />

          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
              המשך עם Google
            </Button>
            <Button variant="outline" className="w-full" onClick={handleFacebookLogin}>
              המשך עם Facebook
            </Button>
          </div>

          <div className="text-center text-sm">
            {"אין לכם חשבון? "}
            <Link href="/register" className="text-pink-500 hover:underline">
              הרשמה
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
