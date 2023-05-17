import { unlink } from 'fs/promises'
export async function removeVoices(path) {
  try {
    await unlink(path)
  } catch (e) {
    console.log('Error while removing file', e.message)
  }
}