import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { auth, db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Modal,
  TextField,
  Stack,
  Paper,
  CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { Session } from '@/lib/types'

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [open, setOpen] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [loading, setLoading] = useState<boolean>(true)
  const [creating, setCreating] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      router.push('/login')
      return
    }

    const q = query(collection(db, 'sessions'), where('userId', '==', user.uid))
    const unsub = onSnapshot(q, (snapshot) => {
      setSessions(
        snapshot.docs.map((doc): Session => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name ?? '',
            userId: data.userId ?? '',
            createdAt: data.createdAt ?? { seconds: 0, nanoseconds: 0 },
          }
        })
      )      
      setLoading(false)
    })

    return () => unsub()
  }, [router])

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setSessionName('')
    setCreating(false)
  }

  const handleCreateSession = async () => {
    const user = auth.currentUser
    if (!user || !sessionName.trim()) return

    setCreating(true)
    await addDoc(collection(db, 'sessions'), {
      userId: user.uid,
      name: sessionName.trim(),
      createdAt: Timestamp.now(),
    })

    handleClose()
  }

  const handleDeleteSession = async (sessionId: string) => {
    const sessionRef = doc(db, 'sessions', sessionId)
    await deleteDoc(sessionRef)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, width: 700 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">My Sessions</Typography>
          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                auth.signOut().then(() => router.push('/login'))
              }}
            >
              Logout
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpen}
            >
              New
            </Button>
          </Box>
        </Box>

        {sessions.length === 0 ? (
          <Typography variant="body1" color="text.secondary">No sessions yet.</Typography>
        ) : (
          <Stack spacing={2}>
            {sessions.map((s) => (
              <Card key={s.id} variant="outlined">
                <CardContent
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight={500}>{s.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {s.createdAt?.seconds
                        ? new Date(s.createdAt.seconds * 1000).toLocaleString([], {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        : 'Just now'}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => router.push(`/session/${s.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteSession(s.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        <Modal open={open} onClose={handleClose}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              p: 3,
              borderRadius: 2,
              boxShadow: 24,
              width: 300,
            }}
          >
            <Typography variant="h6" mb={2}>Create New Session</Typography>
            <TextField
              label="Session Name"
              fullWidth
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              sx={{ mb: 2 }}
              size="small"
              disabled={creating}
            />
            <Stack direction="row" spacing={1}>
              <Button fullWidth variant="outlined" onClick={handleClose} disabled={creating}>
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleCreateSession}
                disabled={creating}
              >
                {creating ? <CircularProgress size={20} color="inherit" /> : 'Create'}
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Paper>
    </Box>
  )
}