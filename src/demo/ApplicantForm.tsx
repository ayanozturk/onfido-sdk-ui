import { h, FunctionComponent } from 'preact'
import { memo, useState } from 'preact/compat'

import type { ApplicantData } from './types'

type FieldProps = {
  hidden?: boolean
  label: string
  onChange: (value: string) => void
  value?: string
}

const Field: FunctionComponent<FieldProps> = ({
  hidden = false,
  label,
  onChange,
  value,
}) => {
  if (hidden) {
    return null
  }

  const isEmail = label === 'Email'

  return (
    <div className="input-field">
      <label>{label}</label>
      <input
        onChange={(event) => onChange((event.target as HTMLInputElement).value)}
        required={isEmail}
        type={isEmail ? 'email' : 'text'}
        value={value}
      />
    </div>
  )
}

type Props = {
  onSubmit: (data: ApplicantData) => void
}

const ApplicantForm: FunctionComponent<Props> = ({ onSubmit }) => {
  const [firstName, setFirstName] = useState('Web IQA')
  const [lastName, setLastName] = useState(
    require('../../package.json').version
  )
  const [email, setEmail] = useState('')

  const handleSubmit = (event: Event) => {
    event.preventDefault()

    onSubmit({
      first_name: firstName.length ? firstName : undefined,
      last_name: lastName.length ? lastName : undefined,
      email,
    })
  }

  return (
    <div>
      <h1>Applicant data</h1>
      <form id="applicant-form" onSubmit={handleSubmit}>
        <Field
          hidden
          label="First name"
          onChange={setFirstName}
          value={firstName}
        />
        <Field
          hidden
          label="Last name"
          onChange={setLastName}
          value={lastName}
        />
        <Field label="Email" value={email} onChange={setEmail} />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default memo(ApplicantForm)
