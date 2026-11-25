import { useCountUp } from '../hooks/useCountUp'
import { formatVaultAmount, fullEthAmount } from '../lib/format'
import type { EscrowStatusKind } from '../types'

interface VaultGlyphProps {
  amount?: bigint
  buyerApproved: boolean
  sellerApproved: boolean
  disputed: boolean
  settled: boolean
  statusKind?: EscrowStatusKind
  animate?: boolean
}

const CENTER = 100
const RADIUS = 78
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const ARC_LENGTH = CIRCUMFERENCE * 0.29

function nodePosition(angleDegrees: number) {
  const radians = (angleDegrees * Math.PI) / 180
  return {
    x: CENTER + RADIUS * Math.cos(radians),
    y: CENTER + RADIUS * Math.sin(radians),
  }
}

const arbiterNode = nodePosition(-90)
const buyerNode = nodePosition(150)
const sellerNode = nodePosition(30)

function amountStyle(text: string) {
  const size = text.length <= 4 ? 19 : text.length <= 6 ? 17 : text.length <= 8 ? 13 : text.length <= 10 ? 11 : 9
  const estimatedWidth = text.length * size * 0.55
  return { size, textLength: estimatedWidth > 52 ? 52 : undefined }
}

export function VaultGlyph({
  amount,
  buyerApproved,
  sellerApproved,
  disputed,
  settled,
  statusKind,
  animate = true,
}: VaultGlyphProps) {
  const theme = disputed ? 'dispute' : settled ? 'settled' : 'live'
  const breathing = disputed && !settled && animate
  const counted = useCountUp(amount ?? 0n, 900)
  const exactText = amount === undefined ? '—' : `${fullEthAmount(amount)} ETH`
  const displayText = amount === undefined ? '—' : formatVaultAmount(counted)
  const { size, textLength } = amountStyle(displayText)
  const payoutCaption = statusKind === 'releasedToSeller' ? 'released' : 'paid out'
  const caption = settled ? payoutCaption : 'ETH'

  const stateLabel = settled
    ? `vault settled, ${payoutCaption}`
    : disputed
      ? 'vault in dispute'
      : buyerApproved && sellerApproved
        ? 'both approvals recorded'
        : buyerApproved
          ? 'buyer approved'
          : sellerApproved
            ? 'seller approved'
            : 'vault awaiting approvals'

  return (
    <svg
      className={`vault vault--${theme}${breathing ? ' is-breathing' : ''}`}
      viewBox="0 0 200 200"
      role="img"
      aria-label={`${exactText}, ${stateLabel}`}
    >
      <circle className="vault-track" cx={CENTER} cy={CENTER} r={RADIUS} />

      <circle
        className="vault-arc vault-arc--buyer"
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
        strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
        strokeDashoffset={buyerApproved ? CIRCUMFERENCE - ARC_LENGTH : CIRCUMFERENCE}
      />

      <circle
        className="vault-arc vault-arc--seller"
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        transform={`rotate(90 ${CENTER} ${CENTER})`}
        strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
        strokeDashoffset={sellerApproved ? CIRCUMFERENCE - ARC_LENGTH : CIRCUMFERENCE}
      />

      {settled && !disputed && (
        <path
          className="vault-ray"
          d={`M ${CENTER} ${CENTER} L ${sellerNode.x} ${sellerNode.y}`}
        />
      )}

      <circle className="vault-core-ring" cx={CENTER} cy={CENTER} r="35" />
      <circle className="vault-core" cx={CENTER} cy={CENTER} r="29" />
      <text
        className={`vault-amount${settled ? ' is-paid' : ''}`}
        x={CENTER}
        y={CENTER + 2}
        textAnchor="middle"
        style={{ fontSize: size }}
        textLength={textLength}
        lengthAdjust="spacingAndGlyphs"
      >
        <title>{exactText}</title>
        {displayText}
      </text>
      <text
        className={`vault-unit${settled ? ' is-paid' : ''}`}
        x={CENTER}
        y={CENTER + 15}
        textAnchor="middle"
      >
        {caption}
      </text>

      <g className="vault-node vault-node--arbiter">
        <circle cx={arbiterNode.x} cy={arbiterNode.y} r="10" />
        <circle className="vault-node-dot" cx={arbiterNode.x} cy={arbiterNode.y} r="3" />
      </g>
      <g className={`vault-node vault-node--buyer${buyerApproved ? ' is-on' : ''}`}>
        <circle cx={buyerNode.x} cy={buyerNode.y} r="10" />
        <circle className="vault-node-dot" cx={buyerNode.x} cy={buyerNode.y} r="3" />
      </g>
      <g className={`vault-node vault-node--seller${sellerApproved ? ' is-on' : ''}`}>
        <circle cx={sellerNode.x} cy={sellerNode.y} r="10" />
        <circle className="vault-node-dot" cx={sellerNode.x} cy={sellerNode.y} r="3" />
      </g>

      <text className="vault-node-label" x={CENTER} y={8} textAnchor="middle">
        Arbiter
      </text>
      <text className="vault-node-label" x={12} y={161} textAnchor="start">
        Buyer
      </text>
      <text className="vault-node-label" x={188} y={161} textAnchor="end">
        Seller
      </text>
    </svg>
  )
}
