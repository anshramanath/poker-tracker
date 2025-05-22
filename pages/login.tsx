import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Stack,
} from '@mui/material'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (router.isReady) {
      setLoading(false)
    }
  }, [router.isReady])

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/dashboard')
    } catch {
      setMessage('Login failed. Please check your credentials.')
    }
  }

  const signup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      router.push('/dashboard')
    } catch {
      setMessage('Signup failed. The email may already be in use.')
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper
        elevation={4}
        sx={{
          p: 5,
          width: 400,
          borderRadius: 3,
          backgroundColor: 'white',
        }}
      >
        <Typography variant="h4" fontWeight="bold" align="center" mb={3}>
          Poker Tracker
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Stack direction="row" spacing={2}>
            <Button variant="contained" fullWidth onClick={login}>
              Login
            </Button>
            <Button variant="outlined" fullWidth onClick={signup}>
              Sign Up
            </Button>
          </Stack>
        </Stack>

        {message && (
          <Typography color="error" align="center" mt={2}>
            {message}
          </Typography>
        )}
      </Paper>
    </Box>
  )
}