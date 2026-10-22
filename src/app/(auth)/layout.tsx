export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 dark:from-whatscat-darkBg dark:to-whatscat-darkCard p-4">
      {children}
    </div>
  )
}
