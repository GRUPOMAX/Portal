export type Img = {
  name: string
  url: string
  size: number
  createdAt?: string
}

export type QueueItem = {
  file: File
  progress: number
  error?: string
  done?: boolean
}