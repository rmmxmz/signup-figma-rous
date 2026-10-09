import { useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordsMatch = password === confirmPassword
  const canSubmit = fullName.trim() !== '' && email.trim() !== '' && password.length >= 6 && passwordsMatch && !loading

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      // 1. Create the account in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      })

      if (signUpError) throw signUpError

      const userId = data?.user?.id
      if (!userId) {
        throw new Error('User account was not created. Please try again.')
      }

      // 2. Save the profile row in your public table even if email confirmation is required
      const { error: insertError } = await supabase.from('users').upsert(
        {
          id: userId,
          full_name: fullName.trim(),
          email: email.trim(),
        },
        { onConflict: 'id' }
      )

      if (insertError) throw insertError

      // 3. Handle email confirmation requirement
      if (!data?.session) {
        setMessage('Account created! Please check your email to verify your account before logging in.')
        // Clear sensitive fields only
        setPassword('')
        setConfirmPassword('')
        return
      }

      // 4. Success
      setMessage(`Welcome, ${fullName.trim()}! Your account was created.`)
      setFullName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')

    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <form className="signup-card" onSubmit={handleSubmit}>
        <h1>Create an account</h1>
        <p className="subtitle">Sign up to get started.</p>

        <label htmlFor="fullName">Full name</label>
        <input id="fullName" type="text" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />

        <label htmlFor="email">Email</label>
        <input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="password">Password</label>
        <input id="password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />

        <label htmlFor="confirmPassword">Confirm password</label>
        <input id="confirmPassword" type="password" placeholder="Type it again" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

        {confirmPassword !== '' && !passwordsMatch && (
          <p className="error">Passwords do not match.</p>
        )}

        <button type="submit" disabled={!canSubmit}>
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>

        {errorMessage && <p className="error server-error">{errorMessage}</p>}
        {message && <p className="success">{message}</p>}
      </form>
    </div>
  )
}

export default App
