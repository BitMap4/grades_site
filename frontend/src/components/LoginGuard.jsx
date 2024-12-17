import {useAuth} from '@contexts/AuthContext'
import { Button, Center, VStack, Heading, Spinner } from '@chakra-ui/react'

export function LoginGuard({ children }) {
  const { isAuthenticated, isLoading, login } = useAuth()

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (!isAuthenticated) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Heading size="lg">Please login to continue</Heading>
          <Button colorScheme="blue" onClick={login}>
            Login with IIIT Account
          </Button>
        </VStack>
      </Center>
    )
  }

  return children
}