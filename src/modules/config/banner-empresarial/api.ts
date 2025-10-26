// src/modules/config/banner-empresarial/api.ts
import axios from 'axios'

const API = import.meta.env.VITE_NOCODB_URL
const TOKEN = import.meta.env.VITE_NOCODB_TOKEN
const TABLE_ID = import.meta.env.VITE_TID_BANNER_EMPRESARIAL

const headers = {
  'xc-token': TOKEN,
  'Content-Type': 'application/json',
}

export async function listBanners() {
  const { data } = await axios.get(`${API}/api/v2/tables/${TABLE_ID}/records`, { headers })
  return data.list
}

export async function updateBanner(id: string, payload: any) {
  const autoFields = ['CreatedAt', 'CreatedAt1', 'UpdatedAt', 'UpdatedAt1', 'Id', 'id']
  const safePayload = Object.fromEntries(
    Object.entries(payload).filter(([k]) => !autoFields.includes(k))
  )

  await axios.patch(`${API}/api/v2/tables/${TABLE_ID}/records/${id}`, safePayload, { headers })
}
