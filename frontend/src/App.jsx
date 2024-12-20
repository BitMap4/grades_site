import { Container, Button, HStack, Spacer, ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { CourseSelector } from '@components/CourseSelector'
import { GradeInput } from '@components/GradeInput'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { AuthProvider, useAuth } from '@contexts/AuthContext'
import { LoginGuard } from '@components/LoginGuard'

const queryClient = new QueryClient()

function AppContent() {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const { logout } = useAuth()

  return (
    <Container 
      py={10} 
      w={{
        base: "sm",
        sm: "lg"
      }}
    >
      <HStack mb={6}>
        <Spacer />
        <Button onClick={logout}>logout</Button>
      </HStack>
      <CourseSelector onSelect={setSelectedCourse} />
      {selectedCourse && <GradeInput courseId={selectedCourse} />}
    </Container>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={defaultSystem}>
          <AuthProvider>
            <LoginGuard>
              <AppContent />
            </LoginGuard>
          </AuthProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App