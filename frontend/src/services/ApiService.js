class ApiService {
  constructor() {
    // Use empty base URL so requests go through Vite's dev proxy (/api -> localhost:8000)
    this.baseUrl = ''
  }

  async fetchWithAuth(endpoint, options = {}, getAccessToken) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (getAccessToken) {
      const token = await getAccessToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `API Error: ${response.status}`)
    }

    if (response.status === 204) return null
    return response.json()
  }

  async uploadFilesWithProgress(files, getAccessToken, onProgress) {
    const token = getAccessToken ? await getAccessToken() : null
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${this.baseUrl}/api/notes/upload`)

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }

      let serverWaitTimer = null
      let serverProgress = 71

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const pct = Math.round((e.loaded / e.total) * 70)
          onProgress(pct, 'Uploading files...')
        }
      }

      xhr.upload.onload = () => {
        if (onProgress) onProgress(71, 'Server is processing files...')
        serverWaitTimer = setInterval(() => {
          if (serverProgress < 90) {
            serverProgress++
            if (onProgress) onProgress(serverProgress, 'Server is processing files...')
          }
        }, 800)
      }

      xhr.onload = () => {
        if (serverWaitTimer) clearInterval(serverWaitTimer)
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(95, 'Finalizing...')
          try {
            resolve(JSON.parse(xhr.responseText))
          } catch {
            reject(new Error('Invalid response from server'))
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText)
            reject(new Error(err.detail || 'Upload failed'))
          } catch {
            reject(new Error(`Upload failed (status ${xhr.status})`))
          }
        }
      }

      xhr.onerror = () => {
        if (serverWaitTimer) clearInterval(serverWaitTimer)
        reject(new Error('Upload failed - network error'))
      }

      xhr.send(formData)
    })
  }

  async generateOutline(fileIds, prompt, getAccessToken) {
    return this.fetchWithAuth(
      '/api/notes/generate-outline',
      { method: 'POST', body: JSON.stringify({ file_ids: fileIds, prompt }) },
      getAccessToken
    )
  }

  async updateOutline(outline, getAccessToken) {
    return this.fetchWithAuth(
      '/api/notes/outline',
      { method: 'PUT', body: JSON.stringify({ outline: { topics: outline } }) },
      getAccessToken
    )
  }

  async generateNotes(outline, fileIds, getAccessToken) {
    return this.fetchWithAuth(
      '/api/notes/generate',
      { method: 'POST', body: JSON.stringify({ outline: { topics: outline }, file_ids: fileIds }) },
      getAccessToken
    )
  }

  async downloadDocx(getAccessToken) {
    const headers = {}
    if (getAccessToken) {
      const token = await getAccessToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(`${this.baseUrl}/api/notes/download`, { headers })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Download failed' }))
      throw new Error(error.detail || 'Download failed')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Notes_Summary.docx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  async deleteFile(fileId, getAccessToken) {
    return this.fetchWithAuth(
      `/api/notes/files/${fileId}`,
      { method: 'DELETE' },
      getAccessToken
    )
  }
}

export const apiService = new ApiService()
export default apiService
