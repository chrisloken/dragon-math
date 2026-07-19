interface DragonPuppetProps {
  /** 0–5 visual complexity for pets / flair */
  coolness?: number
  className?: string
}

/**
 * Layered SVG dragon puppet.
 * Parts are separate groups so CSS can animate wing / head / tail independently.
 * Colors come from CSS vars --dragon-body / --dragon-dark on a parent .table-N.
 */
export function DragonPuppet({ coolness = 0, className = '' }: DragonPuppetProps) {
  const cool = Math.min(5, Math.max(0, coolness))

  return (
    <svg
      viewBox="0 0 160 96"
      className={`dragon-puppet ${className}`.trim()}
      aria-hidden="true"
    >
      {/* Tail — behind body */}
      <g className="puppet-tail">
        <path
          className="fill-dark"
          d="M52 58 C34 54 18 48 8 62 C14 58 22 56 30 58 C38 60 46 60 52 58"
        />
        <path className="fill-body" d="M8 62 L2 70 L12 64 Z" />
        {cool >= 3 && (
          <path
            className="fill-accent"
            d="M14 60 L10 54 L18 58"
            opacity="0.85"
          />
        )}
      </g>

      {/* Far wing (behind) */}
      <g className="puppet-wing puppet-wing--back">
        <path
          className="fill-dark"
          d="M70 46 L42 18 L58 42 L48 12 L68 40 L62 16 L74 42"
          opacity="0.55"
        />
      </g>

      {/* Body */}
      <g className="puppet-body">
        <ellipse className="fill-body" cx="82" cy="58" rx="34" ry="14" />
        <ellipse className="fill-dark" cx="78" cy="62" rx="22" ry="7" opacity="0.35" />
        {cool >= 2 && (
          <>
            <circle className="fill-accent" cx="68" cy="54" r="2.2" />
            <circle className="fill-accent" cx="78" cy="52" r="1.8" />
            <circle className="fill-accent" cx="88" cy="54" r="2" />
          </>
        )}
        {cool >= 4 && (
          <path
            className="fill-dark"
            d="M60 50 L64 42 L68 50 M72 48 L76 40 L80 48 M84 50 L88 42 L92 50"
            opacity="0.7"
          />
        )}
      </g>

      {/* Near wing (front) — flaps via CSS */}
      <g className="puppet-wing puppet-wing--front">
        <path
          className="fill-dark"
          d="M76 48 L44 10 L62 40 L52 4 L74 42 L66 8 L80 44"
        />
        <path
          className="stroke-bone"
          d="M80 46 L66 8 M80 46 L52 4 M80 46 L44 10"
          fill="none"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {cool >= 3 && (
          <path
            className="fill-accent"
            d="M70 28 L62 18 L68 30"
            opacity="0.7"
          />
        )}
      </g>

      {/* Head */}
      <g className="puppet-head">
        <ellipse className="fill-body" cx="122" cy="42" rx="16" ry="13" />
        <polygon className="fill-body" points="132,40 152,44 132,50" />
        <polygon className="fill-dark" points="112,32 114,14 122,32" />
        <polygon className="fill-dark" points="122,30 126,12 134,30" />
        {cool >= 1 && <polygon className="fill-accent" points="128,28 134,8 138,30" />}
        {cool >= 4 && <polygon className="fill-dark" points="108,38 104,24 114,36" />}
        <circle className="fill-eye" cx="130" cy="40" r="3" />
        <circle className="fill-pupil" cx="131" cy="40" r="1.4" />
        {cool >= 5 && (
          <path
            className="fill-accent"
            d="M138 34 L146 28 L142 38 Z"
            opacity="0.95"
          />
        )}
        {/* Nostril */}
        <circle className="fill-dark" cx="146" cy="44" r="1.1" opacity="0.5" />
      </g>
    </svg>
  )
}
