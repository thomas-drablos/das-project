import classNames from 'classnames'
import React, { useState } from 'react'

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')

  function onClick() {
    if (isLoading) return
    setIsLoading(true)
    setError('')

    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 400) {
            return response.json()
              .then((json: { detail: string }) => { throw new Error(json.detail) })
          }
          throw new Error("Internal Server Error")
        }
        return response.json()
      })
      .then(onSuccess)
      .catch((e: unknown) => {
        if ('message' in e && typeof e.message === 'string')
          setError(e.message)
        else
          setError("Application Error")
      })
      .finally(() => { setIsLoading(false) })
  }

  return (
    <form className="box" onSubmit={(e) => { e.preventDefault() }}>
      <div className="field">
        <label className="label">Email</label>
        <div className="control">
          <input
            className="input"
            onChange={(e) => { setEmail(e.target.value) }}
            placeholder="e.g. alex@example.com"
            type="email"
            value={email}
            />
        </div>
      </div>
      <div className="field">
        <label className="label">Password</label>
        <div className="control">
          <input
            className="input"
            onChange={(e) => { setPassword(e.target.value) }}
            placeholder="**********"
            type="password"
            value={password}
            />
        </div>
      </div>
      <div className="field">
      <button
        className={classNames('button', 'is-primary', { "is-loading": isLoading })}
        onClick={onClick}
        >
        Sign in
      </button>
      </div>
      {error !== '' && (
        <div className="field">
          <article className="message is-danger">
            <div className="message-header">
              <p>Error</p>
            </div>
            <div className="message-body">
              {error}
            </div>
          </article>
        </div>
      )}
    </form>
  )
}

export default LoginForm
