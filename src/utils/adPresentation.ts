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

export const WHITE_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y1x8nYAAAAASUVORK5CYII=';

// Map platform identifiers to their logo assets so cards can show branded art
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

// Collapse a freeform platform label into an alphanumeric key
function normalizePlatformKey(platform?: string) {
  return platform?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? ''
}

// Pick the best-fit logo for a platform (returns undefined if none is known)
export function resolvePlatformImage(platform?: PublicAd['platform']) {
  const label = typeof platform === 'string' ? platform : platform?.platform
  const key = normalizePlatformKey(label)
  return key && PLATFORM_IMAGES[key] ? PLATFORM_IMAGES[key] : WHITE_PLACEHOLDER
}

// Present the platform label even if the server sent an object
export function formatPlatform(platform?: PublicAd['platform']) {
  if (!platform) return '—'
  return typeof platform === 'string' ? platform : platform.platform ?? '—'
}

// Turn { value, unit } into "2 weeks" shape
export function formatDuration(duration?: PublicAd['duration']) {
  if (!duration || !duration.value || !duration.unit) return '—'
  return `${duration.value} ${duration.unit}${duration.value > 1 ? 's' : ''}`
}

// Render a price in localized currency (USD fallback)
export function formatPrice(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value)
}
