export interface Rsvp {
  id: string
  name: string
  normalizedName: string
  createdAt: number
}

export interface RsvpInput {
  name: string
}

export interface DuplicateGroup {
  normalizedName: string
  count: number
  ids: string[]
}

export interface RsvpStats {
  total: number
  unique: number
  duplicatesCount: number
}
