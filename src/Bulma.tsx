import classNames from 'classnames'
import React from 'react'

export interface ButtonFieldProps {
  kind?: 'primary' | 'link' | 'info' | 'success' | 'warning' | 'danger';
  loading?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export const ButtonField: React.FC<ButtonFieldProps> = ({ children, kind, loading, onClick }) => {
  return (
    <div className="field">
      <div className="control">
        <button
          className={classNames('button', kind && `is-${kind}`, { "is-loading": loading })}
          onClick={onClick}
        >
          {children}
        </button>
      </div>
    </div>
  )
}

export interface InputFieldProps {
  label: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  type?: string;
  value: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, ...rest }) => {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="control">
        <input className="input" {...rest} />
      </div>
    </div>
  )
}

export interface MessageProps {
  header: string;
  kind: "dark" | "link" | "primary" | "info" | "success" | "warning" | "danger";
}

export const Message: React.FC<MessageProps> = ({ children, header, kind }) => {
  return (
    <article className={classNames('message', `is-${kind}`)}>
      <div className="message-header">
        <p>{header}</p>
      </div>
      <div className="message-body">
        {children}
      </div>
    </article>
  )
}
