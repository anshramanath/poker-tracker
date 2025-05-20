export type Player = {
    id: string
    name: string
    buyIns: number[]
    cashOut: number | null
}

export type Session = {
    id: string
    name: string
    userId: string
    createdAt: {
      seconds: number
      nanoseconds: number
    }
}