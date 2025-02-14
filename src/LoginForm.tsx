import React, { useState } from 'react'

import { ButtonField, InputField, Message } from './Bulma.tsx'
import { postJson } from './util'

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

    postJson('/api/login', { email, password })
      .then(onSuccess)
      .catch((e: unknown) => {
        if ('message' in e && typeof e.message === 'string')
          setError(e.message)
        else
          setError("Unexpected Application Error")
      })
      .finally(() => { setIsLoading(false) })
  }

  return (
    <form className="box" onSubmit={(e) => { e.preventDefault() }}>
      <InputField
        label="Email"
        onChange={(e) => { setEmail(e.target.value) }}
        placeholder="e.g. alex@example.com"
        type="email"
        value={email}
        />
      <InputField
        label="Password"
        onChange={(e) => { setPassword(e.target.value) }}
        placeholder="********"
        type="password"
        value={password}
        />
      <ButtonField kind="primary" loading={isLoading} onClick={onClick}>
        Sign in
      </ButtonField>
      {error !== '' && (
        <div className="field">
          <Message header="Application Error" kind="danger">
            {error}
          </Message>
        </div>
      )}
    </form>
  )
}

export default LoginForm
