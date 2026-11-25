interface VaultGlyphProps {
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
  buyerApproved,
  sellerApproved,
  disputed,
  settled,
  animate = true,
}: VaultGlyphProps) {
  const theme = disputed ? 'dispute' : settled ? 'settled' : 'live'
  const label = settled
    ? 'Vault settled'
    : disputed
      ? 'Vault in dispute'
      : buyerApproved && sellerApproved
        ? 'Both approvals recorded'
        : buyerApproved
          ? 'Buyer approved'
          : sellerApproved
            ? 'Seller approved'
            : 'Vault awaiting approvals'

  return (
    <svg
      className={`vault vault--${theme}${animate ? '' : ' is-static'}`}
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
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

      <circle className="vault-core-ring" cx={CENTER} cy={CENTER} r="26" />
      <circle className="vault-core" cx={CENTER} cy={CENTER} r="19" />
      <text className="vault-core-label" x={CENTER} y={CENTER + 4} textAnchor="middle">
        ETH
      </text>

      <g className="vault-node vault-node--arbiter">
        <circle cx={arbiterNode.x} cy={arbiterNode.y} r="11" />
        <circle className="vault-node-dot" cx={arbiterNode.x} cy={arbiterNode.y} r="3.2" />
      </g>
      <g className={`vault-node vault-node--buyer${buyerApproved ? ' is-on' : ''}`}>
        <circle cx={buyerNode.x} cy={buyerNode.y} r="11" />
        <circle className="vault-node-dot" cx={buyerNode.x} cy={buyerNode.y} r="3.2" />
      </g>
      <g className={`vault-node vault-node--seller${sellerApproved ? ' is-on' : ''}`}>
        <circle cx={sellerNode.x} cy={sellerNode.y} r="11" />
        <circle className="vault-node-dot" cx={sellerNode.x} cy={sellerNode.y} r="3.2" />
      </g>
    </svg>
  )
}
