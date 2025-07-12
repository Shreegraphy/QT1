// Google OAuth with forced account selection

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

// ---------- tiny utilities ----------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const parseHashToken = () => {
  const hash = window.location.hash
  if (!hash.includes("access_token")) return null
  const params = new URLSearchParams(hash.slice(1))
  return params.get("access_token")
}

// ---------- load the GSI script ----------
const loadGoogleScript = async () => {
  if (typeof window === "undefined") return
  if (window.google?.accounts?.oauth2) return
  await new Promise<void>((res, rej) => {
    const s = document.createElement("script")
    s.src = "https://accounts.google.com/gsi/client"
    s.async = s.defer = true
    s.onload = () => res()
    s.onerror = () => rej(new Error("Failed to load Google script"))
    document.head.appendChild(s)
  })
}

// ---------- get the user profile ----------
const fetchUser = async (accessToken: string) => {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error("Failed to fetch user info")
  const u = await res.json()
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    // Always use a local asset so the preview sandbox never 404s.
    picture: "/placeholder.png",
  }
}

// ---------- main sign-in function ----------
export const googleSignUp = async () => {
  if (!GOOGLE_CLIENT_ID) throw new Error("Google Client ID not set")

  await loadGoogleScript()

  // 1️⃣  If we already came back from a redirect, finish immediately
  const tokenFromHash = parseHashToken()
  if (tokenFromHash) {
    window.history.replaceState({}, "", window.location.pathname) // clean URL
    return fetchUser(tokenFromHash)
  }

  // helper: request in a given mode with forced account selection
  const requestToken = (ux_mode: "popup" | "redirect"): Promise<string> =>
    new Promise((resolve, reject) => {
      const tokenClient = window.google!.accounts!.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        prompt: "select_account consent", // Forces account picker AND consent screen
        ux_mode,
        redirect_uri: ux_mode === "redirect" ? `${window.location.origin}/oauth/google/complete` : undefined,
        callback: (resp) => {
          if (resp.error || !resp.access_token) return reject(new Error(resp.error || "No access token"))
          resolve(resp.access_token)
        },
        error_callback: (err) => reject(new Error(err.type || "OAuth error")),
      })
      try {
        tokenClient.requestAccessToken()
      } catch (e) {
        reject(e)
      }
    })

  // 2️⃣  Try popup first (with account selection)
  try {
    const token = await requestToken("popup")
    return fetchUser(token)
  } catch (err: any) {
    // Only fall back if popup really failed/closed
    if (!/popup/i.test(err.message)) throw err
    // small pause to avoid rapid double request
    await sleep(400)
  }

  // 3️⃣  Popup failed → use redirect (this page reloads at /oauth/google/complete)
  // The function will finish in step 1 on the redirected page.
  await requestToken("redirect")
  return new Promise(() => {
    /* never resolves here – handled on redirect */
  })
}
