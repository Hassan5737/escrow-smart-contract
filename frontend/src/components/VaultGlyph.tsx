import { formatEther } from 'viem'
import { useCountUp } from '../hooks/useCountUp'

interface VaultGlyphProps {
  amount?: bigint
  buyerApproved: boolean
  sellerApproved: boolean
  disputed: boolean
  settled: boolean
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

export function VaultGlyph({
  amount,
  buyerApproved,
  sellerApproved,
  disputed,
  settled,
  animate = true,
}: VaultGlyphProps) {
  const theme = disputed ? 'dispute' : settled ? 'settled' : 'live'
  const ethValue = amount === undefined ? undefined : Number(formatEther(amount))
  const counted = useCountUp(ethValue ?? 0, 900)
  const amountText = ethValue === undefined ? '—' : counted.toFixed(3)

  const stateLabel = settled
    ? 'vault settled'
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
      className={`vault vault--${theme}${animate ? '' : ' is-static'}`}
      viewBox="0 0 200 200"
      role="img"
      aria-label={`${amountText === '—' ? 'Amount unknown' : `${amountText} ether`}, ${stateLabel}`}
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
      <text className="vault-amount" x={CENTER} y={CENTER + 2} textAnchor="middle">
        {amountText}
      </text>
      <text className="vault-unit" x={CENTER} y={CENTER + 15} textAnchor="middle">
        ETH
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
