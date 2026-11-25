import { useEffect, useState, type FormEvent } from 'react'
import { getAddress, isAddress, type Address } from 'viem'

interface AddressFieldProps {
  address: Address | undefined
  onSubmit: (address: Address) => void
}

export function AddressField({ address, onSubmit }: AddressFieldProps) {
  const [value, setValue] = useState(address ?? '')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValue(address ?? '')
    setError(null)
  }, [address])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = value.trim()

    if (trimmed.length === 0) {
      setError('Enter an escrow address.')
      return
    }
    if (!isAddress(trimmed, { strict: false })) {
      setError('That does not look like an Ethereum address.')
      return
    }

    setError(null)
    onSubmit(getAddress(trimmed))
  }

  return (
    <form className="address-field" onSubmit={handleSubmit}>
      <label className="field-label" htmlFor="escrow-address">
        Escrow address
      </label>
      <div className="address-row">
        <input
          id="escrow-address"
          className={`address-input mono${error ? ' has-error' : ''}`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={error !== null}
          aria-describedby={error ? 'escrow-address-error' : undefined}
          placeholder="0x…"
        />
        <button type="submit" className="button button--brass button--small">
          Read
        </button>
      </div>
      {error && (
        <p className="field-error" id="escrow-address-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
