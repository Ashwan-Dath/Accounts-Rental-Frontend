import amazonPrimeImg from '../assets/Amazon Prime.png'
import appleMusicImg from '../assets/Apple Music.png'
import audibleImg from '../assets/Audible.png'
import dropboxImg from '../assets/Dropbox.png'
import googleDriveImg from '../assets/Google Drive.png'
import hboMaxImg from '../assets/HBO Max.png'
import hotstarImg from '../assets/HotStar.png'
import huluImg from '../assets/Hulu.png'
import netflixImg from '../assets/Netflix.png'
import oneDriveImg from '../assets/OneDrive.png'
import soundCloudImg from '../assets/SoundCloud.png'
import spotifyImg from '../assets/Spotify.png'
import youtubeImg from '../assets/Youtube.png'

import type { PublicAd } from '../types/ad'

const PLATFORM_IMAGES: Record<string, string> = {
  amazonprime: amazonPrimeImg,
  amazonprimevideo: amazonPrimeImg,
  applemusic: appleMusicImg,
  audible: audibleImg,
  dropbox: dropboxImg,
  googledrive: googleDriveImg,
  hbomax: hboMaxImg,
  hotstar: hotstarImg,
  hulu: huluImg,
  netflix: netflixImg,
  onedrive: oneDriveImg,
  soundcloud: soundCloudImg,
  spotify: spotifyImg,
  youtube: youtubeImg,
}

function normalizePlatformKey(platform?: string) {
  return platform?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? ''
}

export function resolvePlatformImage(platform?: PublicAd['platform']) {
  const label = typeof platform === 'string' ? platform : platform?.platform
  const key = normalizePlatformKey(label)
  return key ? PLATFORM_IMAGES[key] : undefined
}

export function formatPlatform(platform?: PublicAd['platform']) {
  if (!platform) return '—'
  return typeof platform === 'string' ? platform : platform.platform ?? '—'
}

export function formatDuration(duration?: PublicAd['duration']) {
  if (!duration || !duration.value || !duration.unit) return '—'
  return `${duration.value} ${duration.unit}${duration.value > 1 ? 's' : ''}`
}

export function formatPrice(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value)
}
