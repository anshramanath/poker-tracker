import { useState } from 'react'
import { useRouter } from 'next/router'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider
} from '@mui/material'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/dashboard')
    } catch {
      alert('Login failed.')
    }
  }

  const signup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      router.push('/dashboard')
    } catch {
      alert('Signup failed.')
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, width: 350 }}>
        <Typography variant="h5" align="center" mb={3}>
          Poker Tracker
        </Typography>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Box display="flex" gap={2}>
          <Button variant="contained" fullWidth onClick={login}>
            Login
          </Button>
          <Button variant="outlined" fullWidth onClick={signup}>
            Sign Up
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}