import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { db } from '@/lib/firebase'
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

type Player = {
  id: string
  name: string
  buyIns: number[]
  cashOut: number | null
}

export default function LedgerPage() {
  const router = useRouter()
  const { id } = router.query
  const [players, setPlayers] = useState<Player[]>([])
  const [sessionName, setSessionName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const sessionRef = doc(db, 'sessions', id as string)

    const unsub = onSnapshot(collection(sessionRef, 'players'), (snapshot) => {
      setPlayers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Player)))
    })

    getDoc(sessionRef).then((docSnap) => {
      if (docSnap.exists()) {
        setSessionName(docSnap.data().name)
      }
      setLoading(false)
    })

    return () => unsub()
  }, [id])

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
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Session: {sessionName}
        </Typography>

        {players.length === 0 ? (
          <Box mb={4}>
            <Typography>No players to show.</Typography>
          </Box>
        ) : (
          <Stack spacing={2} mb={4}>
            {players.map((player) => {
              const totalBuyIn = player.buyIns.reduce((a, b) => a + b, 0)
              const net = (player.cashOut ?? 0) - totalBuyIn
              const isCashedOut = player.cashOut !== null

              return (
                <Card key={player.id} variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="medium">{player.name}</Typography>
                    <Typography color="text.secondary">
                      Status: {isCashedOut ? 'Cashed Out' : 'In Game'}
                    </Typography>
                    <Typography>
                      Total Buy-Ins: ${totalBuyIn}
                    </Typography>
                    <Typography color="text.secondary">
                      Buy-In History: {player.buyIns.map((amt) => `$${amt}`).join(', ')}
                    </Typography>
                    {isCashedOut && (
                      <>
                        <Typography>Cashed Out: ${player.cashOut}</Typography>
                        <Typography color={net >= 0 ? 'green' : 'error'}>
                          Net: ${net}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        )}

        <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => router.push(`/session/${id}`)}>
          Back to Session
        </Button>
      </Paper>
    </Box>
  )
}