import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Modal,
  IconButton,
  Paper,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import { db } from '@/lib/firebase'

export default function SessionDetail() {
  const router = useRouter()
  const { id } = router.query

  const [sessionName, setSessionName] = useState('')
  const [players, setPlayers] = useState<any[]>([])
  const [playerName, setPlayerName] = useState('')
  const [buyIn, setBuyIn] = useState('')
  const [editingPlayer, setEditingPlayer] = useState<any | null>(null)
  const [editName, setEditName] = useState('')
  const [editCashOut, setEditCashOut] = useState('')
  const [editBuyIns, setEditBuyIns] = useState<number[]>([])
  const [buyInModalPlayer, setBuyInModalPlayer] = useState<any | null>(null)
  const [cashOutModalPlayer, setCashOutModalPlayer] = useState<any | null>(null)
  const [newBuyInAmount, setNewBuyInAmount] = useState('')
  const [newCashOutAmount, setNewCashOutAmount] = useState('')

  useEffect(() => {
    if (!id) return

    const sessionRef = doc(db, 'sessions', id as string)
    const unsubPlayers = onSnapshot(collection(sessionRef, 'players'), (snapshot) => {
      setPlayers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    })

    getDoc(sessionRef).then((docSnap) => {
      if (docSnap.exists()) {
        setSessionName(docSnap.data().name)
      }
    })

    return () => unsubPlayers()
  }, [id])

  const addPlayer = async () => {
    if (!playerName || !buyIn || !id) return
    const sessionRef = doc(db, 'sessions', id as string)
    await addDoc(collection(sessionRef, 'players'), {
      name: playerName,
      buyIns: [Number(buyIn)],
      cashOut: null,
    })
    setPlayerName('')
    setBuyIn('')
  }

  const getNet = (player: any) => {
    const totalBuyIn = player.buyIns?.reduce((a: number, b: number) => a + b, 0) || 0
    return (player.cashOut ?? 0) - totalBuyIn
  }

  const openEditModal = (player: any) => {
    setEditingPlayer(player)
    setEditName(player.name)
    setEditCashOut(player.cashOut !== null ? String(player.cashOut) : '')
    setEditBuyIns([...player.buyIns])
  }

  const deletePlayer = async (playerId: string) => {
    if (!id) return
    const playerRef = doc(db, 'sessions', id as string, 'players', playerId)
    await deleteDoc(playerRef)
  }

  const openBuyInModal = (player: any) => {
    setBuyInModalPlayer(player)
    setNewBuyInAmount('')
  }

  const openCashOutModal = (player: any) => {
    setCashOutModalPlayer(player)
    setNewCashOutAmount(player.cashOut !== null ? String(player.cashOut) : '')
  }

  const updatePlayer = async () => {
    if (!editingPlayer || !id) return
    const playerRef = doc(db, 'sessions', id as string, 'players', editingPlayer.id)
    await updateDoc(playerRef, {
      name: editName,
      cashOut: editCashOut ? Number(editCashOut) : null,
      buyIns: editBuyIns,
    })
    setEditingPlayer(null)
  }

  const addBuyInToPlayer = async () => {
    if (!buyInModalPlayer || !newBuyInAmount || !id) return
    const playerRef = doc(db, 'sessions', id as string, 'players', buyInModalPlayer.id)
    const updatedBuyIns = [...buyInModalPlayer.buyIns, Number(newBuyInAmount)]
    await updateDoc(playerRef, { buyIns: updatedBuyIns })
    setBuyInModalPlayer(null)
  }

  const updateCashOutAmount = async () => {
    if (!cashOutModalPlayer || !id) return
    const playerRef = doc(db, 'sessions', id as string, 'players', cashOutModalPlayer.id)
    await updateDoc(playerRef, { cashOut: newCashOutAmount ? Number(newCashOutAmount) : null })
    setCashOutModalPlayer(null)
  }

  const handleRejoin = async (playerId: string) => {
    const playerRef = doc(db, 'sessions', id as string, 'players', playerId)
    await updateDoc(playerRef, { cashOut: null })
  }

  const handleAddBuyInInModal = () => {
    setEditBuyIns([...editBuyIns, 0])
  }

  const handleDeleteBuyIn = (index: number) => {
    setEditBuyIns(editBuyIns.filter((_, i) => i !== index))
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, width: 700 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          {"Session: " + sessionName || 'Session'}
        </Typography>

        <Box mb={4}>
            <Typography variant="h6" mb={2}>Add Player</Typography>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <TextField
                label="Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                size="small"
                sx={{ flex: 1, minWidth: 120 }}
                />
                <TextField
                label="Buy-in"
                type="number"
                value={buyIn}
                onChange={(e) => setBuyIn(e.target.value)}
                size="small"
                sx={{ flex: 1, minWidth: 120 }}
                />
                <Button
                variant="contained"
                onClick={addPlayer}
                size="medium"
                sx={{ px: 3, fontWeight: 600 }}
                >
                Add
                </Button>
            </Box>
        </Box>


        <Typography variant="h6" mb={2}>Players</Typography>

        {players.length === 0 ? (
          <Typography variant="body1" color="text.secondary" mb={4}>No players yet.</Typography>
        ) : (
          <Stack spacing={2} mb={4}>
            {players.map((player) => {
              const totalBuyIn = player.buyIns?.reduce((a: number, b: number) => a + b, 0) || 0
              const net = getNet(player)
              const isCashedOut = player.cashOut !== null

              return (
                <Card key={player.id} variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center">
                        <Typography variant="h6">{player.name}</Typography>
                        <IconButton size="small" onClick={() => openEditModal(player)} sx={{ ml: 1 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => deletePlayer(player.id)} sx={{ ml: 1 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography color={net >= 0 ? 'green' : 'error'}>
                        Net: ${net}
                      </Typography>
                    </Box>
                    <Typography variant="body2">Total Buy-ins: ${totalBuyIn}</Typography>
                    <Typography variant="body2">Cash-out: {player.cashOut !== null ? `$${player.cashOut}` : '—'}</Typography>
                    <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                      {!isCashedOut ? (
                        <>
                          <Button size="small" variant="outlined" onClick={() => openBuyInModal(player)}>+ Buy-in</Button>
                          <Button size="small" variant="contained" color="warning" onClick={() => openCashOutModal(player)}>Cash Out</Button>
                        </>
                      ) : (
                        <Button size="small" variant="outlined" onClick={() => handleRejoin(player.id)}>Rejoin</Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
          <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button variant="outlined" onClick={() => router.push(`/ledger/${id}`)}>
            View Ledger
          </Button>
        </Box>

        {/* Edit Modal */}
        <Modal open={!!editingPlayer} onClose={() => setEditingPlayer(null)}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 24, width: 350 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Edit Player</Typography>
              <IconButton onClick={() => setEditingPlayer(null)}><CloseIcon /></IconButton>
            </Box>
            <TextField fullWidth label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="Cash-out" type="number" value={editCashOut} onChange={(e) => setEditCashOut(e.target.value)} sx={{ mb: 2 }} />
            <Typography variant="subtitle2" mb={1}>Buy-ins</Typography>
            <Stack spacing={1}>
              {editBuyIns.map((amount, i) => (
                <Box key={i} display="flex" alignItems="center" gap={1}>
                  <TextField type="number" value={amount} onChange={(e) => {
                    const newBuyIns = [...editBuyIns]
                    newBuyIns[i] = Number(e.target.value)
                    setEditBuyIns(newBuyIns)
                  }} size="small" sx={{ flex: 1 }} />
                  <IconButton onClick={() => handleDeleteBuyIn(i)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              ))}
              <Button onClick={handleAddBuyInInModal} size="small">+ Add Buy-in</Button>
            </Stack>
            <Button variant="contained" fullWidth onClick={updatePlayer} sx={{ mt: 3 }}>Save</Button>
          </Box>
        </Modal>

        {/* Buy-in Modal */}
        <Modal open={!!buyInModalPlayer} onClose={() => setBuyInModalPlayer(null)}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 24, width: 300 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Add Buy-in</Typography>
              <IconButton onClick={() => setBuyInModalPlayer(null)}><CloseIcon /></IconButton>
            </Box>
            <TextField fullWidth label="Amount" type="number" value={newBuyInAmount} onChange={(e) => setNewBuyInAmount(e.target.value)} sx={{ mb: 2 }} />
            <Button variant="contained" fullWidth onClick={addBuyInToPlayer}>Add</Button>
          </Box>
        </Modal>

        {/* Cash-out Modal */}
        <Modal open={!!cashOutModalPlayer} onClose={() => setCashOutModalPlayer(null)}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 24, width: 300 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Cash Out</Typography>
              <IconButton onClick={() => setCashOutModalPlayer(null)}><CloseIcon /></IconButton>
            </Box>
            <TextField fullWidth label="Amount" type="number" value={newCashOutAmount} onChange={(e) => setNewCashOutAmount(e.target.value)} sx={{ mb: 2 }} />
            <Button variant="contained" fullWidth onClick={updateCashOutAmount}>Submit</Button>
          </Box>
        </Modal>
      </Paper>
    </Box>
  )
}