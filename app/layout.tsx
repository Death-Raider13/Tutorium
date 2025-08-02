import "./globals.css"
import { Toaster } from "react-hot-toast"
import NavBar from "@/components/NavBar"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body >
         <NavBar />
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  )
}
